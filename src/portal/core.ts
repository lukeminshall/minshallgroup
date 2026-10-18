/* =====================================================================
   PORTAL CORE — Clerk login, Supabase client (using the Clerk session as
   its access token), shared state and small helpers.
   Needs build-time env: VITE_CLERK_PUBLISHABLE_KEY, VITE_SUPABASE_URL,
   VITE_SUPABASE_ANON_KEY (public values, safe in the browser; security is
   enforced by Supabase row-level security).
   ===================================================================== */
import {Clerk} from '@clerk/clerk-js';
import {createClient,SupabaseClient} from '@supabase/supabase-js';

const env=(import.meta as any).env||{};
export const CFG={clerk:env.VITE_CLERK_PUBLISHABLE_KEY as string,url:env.VITE_SUPABASE_URL as string,anon:env.VITE_SUPABASE_ANON_KEY as string};
export const ready=()=>!!(CFG.clerk&&CFG.url&&CFG.anon);

export let clerk:any=null;
export let sb:SupabaseClient=null as any;
export const S:{user:any,isAdmin:boolean,projects:any[],current:any,brief:any,unread:number,teamUnread:number}={user:null,isAdmin:false,projects:[],current:null,brief:null,unread:0,teamUnread:0};
/* unread: the other side acted after this side last looked */
export const unreadForClient=r=>!!r.last_team_at&&(!r.client_seen_at||new Date(r.last_team_at)>new Date(r.client_seen_at));
export const unreadForTeam=r=>!!r.last_client_at&&(!r.team_seen_at||new Date(r.last_client_at)>new Date(r.team_seen_at));
export async function markSeen(r,admin:boolean){
  const col=admin?'team_seen_at':'client_seen_at';const now=new Date().toISOString();
  try{await sb.from('requests').update({[col]:now}).eq('id',r.id);r[col]=now;}catch{}
}

function loadUi(domain){
  if((window as any).__internal_ClerkUICtor)return Promise.resolve();
  return new Promise<void>((ok,bad)=>{const s=document.createElement('script');s.src=`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`;s.async=true;s.crossOrigin='anonymous';s.onload=()=>ok();s.onerror=()=>bad(new Error('Could not load sign-in'));document.head.appendChild(s);});
}
export async function boot(){
  if(clerk)return clerk;
  const domain=atob(CFG.clerk.split('_')[2]).slice(0,-1);
  await loadUi(domain);
  clerk=new Clerk(CFG.clerk);
  await clerk.load({ui:{ClerkUI:(window as any).__internal_ClerkUICtor},appearance:{variables:{colorPrimary:'#0A1A3F',fontFamily:'Manrope Variable, Manrope, system-ui, sans-serif',borderRadius:'10px'}}});
  sb=createClient(CFG.url,CFG.anon,{accessToken:async()=>(await clerk.session?.getToken())??null});
  return clerk;
}

export async function token(){return (await clerk.session?.getToken())||'';}
export async function api(path,payload){
  const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await token()}`},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'Something went wrong');
  return j;
}
/* fire-and-forget email notification; never blocks the UI */
export function notify(event,extra={}){if(S.current)api('/api/portal-notify',{event,clientId:S.current.id,...extra}).catch(()=>{});}

export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const gbp=n=>'£'+Number(n||0).toLocaleString('en-GB',{minimumFractionDigits:Number(n)%1?2:0,maximumFractionDigits:2});
export const date=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
export function toast(msg,bad=false){
  let t=document.getElementById('pt-toast');
  if(!t){t=document.createElement('div');t.id='pt-toast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent=msg;t.className=bad?'bad show':'show';clearTimeout((t as any)._h);(t as any)._h=setTimeout(()=>t.className='',3500);
}
export function check(res){if(res.error){throw new Error(res.error.message||'Database error');}return res.data;}

/* storage: one private folder per project */
export async function upload(file:File,kind='brief',tag=''){
  const safe=file.name.replace(/[^\w.\-]+/g,'_').slice(-80);
  const path=`${S.current.id}/${kind}/${Date.now()}-${safe}`;
  check(await sb.storage.from('client-files').upload(path,file,{upsert:false,contentType:file.type||undefined}));
  return check(await sb.from('files').insert({client_id:S.current.id,path,name:(tag?tag+': ':'')+file.name,kind,size:file.size}).select().single());
}
export async function fileUrl(path){const r=await sb.storage.from('client-files').createSignedUrl(path,3600);return r.data?.signedUrl||'';}

/* test hook: lets automated checks swap in stand-in login/data clients */
export function __test(o:{sb?:any,clerk?:any}){if(o.sb)sb=o.sb;if(o.clerk)clerk=o.clerk;}
