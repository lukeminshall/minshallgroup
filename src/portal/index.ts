/* =====================================================================
   CLIENT PORTAL — entry. Loaded only on /portal (dynamic import), so the
   rest of the site never downloads Clerk or Supabase.
   Tabs live in the URL hash: #overview, #onboarding, #requests, #billing,
   #performance, #admin.
   ===================================================================== */
import {ready,boot,clerk,sb,S,esc,gbp,check,notify,api,toast,unreadForClient,unreadForTeam} from './core';
import {STAGES} from './brief';
import {SME} from '../content';
import {viewOnboarding,viewRequests,viewBilling,viewPerformance} from './views';
import {viewAdmin} from './admin';

let root:HTMLElement;let ac:AbortController|null=null;
const TABS=[['overview','Overview'],['onboarding','Onboarding'],['requests','Requests'],['billing','Billing'],['performance','Performance']];

export async function initPortal(){
  root=document.querySelector('[data-portal]');if(!root)return;
  ac?.abort();ac=new AbortController();
  if(!ready()){root.innerHTML=`<div class="pp-card"><h2 class="h2">The client portal is being set up.</h2><p>It will be available here shortly. In the meantime, email <a class="ulink" href="mailto:hello@minshallgroup.com">hello@minshallgroup.com</a> and we will help straight away.</p></div>`;return;}
  root.innerHTML=`<p class="pp-loading">Loading your portal…</p>`;
  try{await boot();}catch(e){root.innerHTML=`<div class="pp-card"><h2 class="h2">We could not load sign-in.</h2><p>Please refresh the page. If it keeps happening, email hello@minshallgroup.com.</p></div>`;return;}
  let signedIn=!!clerk.user;
  clerk.addListener(()=>{if(!!clerk.user!==signedIn){signedIn=!!clerk.user;render();}});
  addEventListener('hashchange',()=>{if(document.querySelector('[data-portal]'))render();},{signal:ac.signal});
  render();
}

async function render(){
  if(!document.body.contains(root))return;
  if(!clerk.user){
    S.user=null;
    root.innerHTML=`<div class="pp-signin">
      <div><h2 class="h2">Log in to your project.</h2><p class="lede-s">Answer your onboarding questions, follow progress, approve designs, raise change requests, see invoices and track your site’s performance, all in one place. No calls needed.</p>
        <div class="actions"><button class="btn" data-in><span>Log in</span></button><button class="btn ghost" data-up><span>Create an account</span></button></div></div>
      <ol class="pp-how">${['Create your account','Start your project from your quote','Answer the onboarding questions','Approve, request changes and go live'].map((t,i)=>`<li><span>${i+1}</span>${t}</li>`).join('')}</ol>
    </div>`;
    root.querySelector('[data-in]').addEventListener('click',()=>clerk.openSignIn({}));
    root.querySelector('[data-up]').addEventListener('click',()=>clerk.openSignUp({}));
    return;
  }
  S.user=clerk.user;
  try{
    const [projects,admins]=await Promise.all([sb.from('clients').select('*').order('created_at',{ascending:true}),sb.from('admins').select('user_id').eq('user_id',clerk.user.id)]);
    S.projects=check(projects)||[];S.isAdmin=(check(admins)||[]).length>0;
  }catch(e){root.innerHTML=`<div class="pp-card"><h2 class="h2">We could not load your project.</h2><p>${esc(e.message)}</p></div>`;return;}
  const mine=S.projects.filter(p=>p.owner_id===clerk.user.id);
  /* first visit with no project: tell the team about the new account (the server sends it once) */
  if(!mine.length&&!S.isAdmin){try{if(!sessionStorage.getItem('mg-signup-'+clerk.user.id)){sessionStorage.setItem('mg-signup-'+clerk.user.id,'1');api('/api/portal-notify',{event:'signed_up'}).catch(()=>{});}}catch{}}
  const saved=(()=>{try{return localStorage.getItem('mg-portal-current');}catch{return null;}})();
  S.current=S.projects.find(p=>p.id===saved)||mine[0]||(S.isAdmin?S.projects[0]:null)||null;
  let tab=location.hash.slice(1)||'overview';
  if(tab==='admin'&&!S.isAdmin)tab='overview';
  if(!S.current&&tab!=='admin'){shell('start');return startProject();}
  /* unread updates: for the client on their project, for the team across every project */
  try{
    if(S.current){const rq=check(await sb.from('requests').select('id,client_id,last_team_at,last_client_at,client_seen_at,team_seen_at').eq('client_id',S.current.id))||[];S.unread=rq.filter(unreadForClient).length;}
    if(S.isAdmin){const all=check(await sb.from('requests').select('id,last_client_at,team_seen_at'))||[];S.teamUnread=all.filter(unreadForTeam).length;}
  }catch{S.unread=0;S.teamUnread=0;}
  shell(tab);
  const el=root.querySelector('[data-view]') as HTMLElement;
  try{
    if(tab==='admin')return await viewAdmin(el,()=>render());
    if(tab==='onboarding')return await viewOnboarding(el);
    if(tab==='requests')return await viewRequests(el);
    if(tab==='billing')return await viewBilling(el);
    if(tab==='performance')return await viewPerformance(el);
    return await overview(el);
  }catch(e){el.innerHTML=`<div class="pp-card"><p>${esc(e.message||'Something went wrong')}</p></div>`;}
}

function shell(tab){
  const name=clerk.user.firstName||clerk.user.primaryEmailAddress?.emailAddress||'';
  const tabs=[...TABS,...(S.isAdmin?[['admin','Admin']]:[])];
  root.innerHTML=`<div class="pp-top">
      <div><span class="eyebrow">Client portal</span><h2 class="h2">${S.current?esc(S.current.business_name):'Welcome'+(name?', '+esc(name):'')}</h2></div>
      <div class="pp-user">${S.projects.length>1?`<label><span class="sr">Project</span><select data-switch>${S.projects.map(p=>`<option value="${p.id}"${p.id===S.current?.id?' selected':''}>${esc(p.business_name)}${S.isAdmin&&p.owner_id!==clerk.user.id?' ('+esc(p.owner_email||'client')+')':''}</option>`).join('')}</select></label>`:''}<div data-userbtn></div></div>
    </div>
    ${tab==='start'?'':`<nav class="pp-tabs" aria-label="Portal">${tabs.map(([id,t])=>{const n=id==='requests'&&!(S.isAdmin&&S.current?.owner_id!==clerk.user.id)?S.unread:id==='admin'?S.teamUnread:0;
      return `<a href="#${id}" class="${id===tab?'on':''}"${id===tab?' aria-current="page"':''}>${t}${n?` <span class="pp-count" aria-label="${n} new">${n}</span>`:''}</a>`;}).join('')}</nav>`}
    <div data-view></div>`;
  clerk.mountUserButton(root.querySelector('[data-userbtn]'));
  root.querySelector('[data-switch]')?.addEventListener('change',e=>{try{localStorage.setItem('mg-portal-current',(e.target as HTMLSelectElement).value);}catch{};render();});
}

/* ---------- overview ---------- */
async function overview(el:HTMLElement){
  const p=S.current;
  const [brief,invoices,reqs]=await Promise.all([
    sb.from('briefs').select('submitted_at').eq('client_id',p.id).maybeSingle(),
    sb.from('invoices').select('label,amount_gbp,status,due_on,view_url').eq('client_id',p.id).neq('status','draft'),
    sb.from('requests').select('id,status').eq('client_id',p.id)
  ]);
  const submitted=!!brief.data?.submitted_at;const due=(invoices.data||[]).filter(i=>i.status==='due'||i.status==='overdue');
  const quoted=(reqs.data||[]).filter(r=>r.status==='quoted').length;const idx=STAGES.findIndex(s=>s.id===p.stage);
  const next:string[]=[];
  if(p.stage==='onboarding'&&!submitted)next.push(`<a class="pp-next" href="#onboarding"><b>Answer your onboarding questions</b><span>About 15 minutes. It replaces a kick-off call, and saves as you go.</span></a>`);
  if(p.stage==='onboarding'&&submitted)next.push(`<div class="pp-next calm"><b>Thank you, we have your brief.</b><span>We are designing your pages. You will get an email when the design is ready to review.</span></div>`);
  if(p.stage==='design'&&p.preview_url)next.push(`<div class="pp-next"><b>Your design is ready to review</b><span>Open the preview, then approve it or request changes.</span><div class="actions"><a class="btn sm" href="${esc(p.preview_url)}" target="_blank" rel="noopener"><span>Open preview</span></a><button class="btn sm ghost" data-approve><span>Approve design</span></button><a class="btn sm ghost" href="#requests"><span>Request changes</span></a></div></div>`);
  if(p.stage==='review')next.push(`<div class="pp-next"><b>Your site is ready for a final check</b><span>Click through every page, then raise any last changes.</span><div class="actions">${p.preview_url?`<a class="btn sm" href="${esc(p.preview_url)}" target="_blank" rel="noopener"><span>Open site</span></a>`:''}<a class="btn sm ghost" href="#requests"><span>Raise a change</span></a></div></div>`);
  if(p.stage==='live')next.push(`<a class="pp-next" href="#performance"><b>Your site is live</b><span>${p.live_url?esc(p.live_url)+' · ':''}See how it is performing.</span></a>`);
  if(due.length)next.push(`<a class="pp-next" href="#billing"><b>${due.length} invoice${due.length>1?'s':''} to pay</b><span>${due.map(i=>esc(i.label)+' '+gbp(i.amount_gbp)).join(' · ')}</span></a>`);
  if(S.unread)next.unshift(`<a class="pp-next" href="#requests"><b>${S.unread} new update${S.unread>1?'s':''} from us</b><span>Messages and replies are in Requests.</span></a>`);
  if(quoted)next.push(`<a class="pp-next" href="#requests"><b>${quoted} quote${quoted>1?'s':''} waiting for you</b><span>Approve or decline in Requests.</span></a>`);
  el.innerHTML=`
    <ol class="pp-stages">${STAGES.map((s,i)=>`<li class="${i<idx?'done':i===idx?'now':''}"><span>${i<idx?'✓':i+1}</span><b>${s.t}</b><small>${s.d}</small></li>`).join('')}</ol>
    <div class="pp-grid">
      <div class="pp-col"><h3 class="pp-h">What happens next</h3>${next.join('')||'<p class="pp-muted">Nothing needs you right now.</p>'}</div>
      <div class="pp-col"><h3 class="pp-h">Your project</h3>
        <dl class="pp-dl">
          <dt>Package</dt><dd>${esc(SME.packages.find(k=>k.id===p.package)?.name||'—')}${p.pages?`, ${p.pages} pages`:''}</dd>
          <dt>Build price</dt><dd>${p.quote_total?gbp(p.quote_total)+' (paid in three stages)':'Confirmed in your quote'}</dd>
          <dt>Hosting</dt><dd>${p.hosting==='us'?`We host it, ${gbp(SME.hosting)} a year`:`You host it (code handover within ${SME.handoverDays} days)`}</dd>
          <dt>Domain</dt><dd>${p.domain_mode==='need'?'We secure: ':''}${esc(p.domain||'—')}</dd>
          <dt>Current website</dt><dd>${p.website?esc(p.website):'—'}</dd>
          ${p.preview_url?`<dt>Preview</dt><dd><a class="ulink" href="${esc(p.preview_url)}" target="_blank" rel="noopener">Open preview</a></dd>`:''}
          ${p.live_url?`<dt>Live site</dt><dd><a class="ulink" href="${esc(p.live_url)}" target="_blank" rel="noopener">${esc(p.live_url)}</a></dd>`:''}
        </dl></div>
    </div>`;
  el.querySelector('[data-approve]')?.addEventListener('click',async e=>{
    if(!confirm('Approve the design? We will then build the rest of the site.'))return;
    (e.currentTarget as HTMLButtonElement).disabled=true;
    try{check(await sb.from('requests').insert({client_id:p.id,kind:'approval',title:'Design approved'}));notify('design_approved');toast('Thank you, design approved. We will email you when the build is ready.');}
    catch(err){toast(err.message,true);(e.currentTarget as HTMLButtonElement).disabled=false;}
  });
}

/* ---------- start a project (from the quote builder, if used) ---------- */
function startProject(){
  const el=root.querySelector('[data-view]') as HTMLElement;
  const q=(()=>{try{return JSON.parse(localStorage.getItem('mg-quote')||'{}');}catch{return {};}})();
  el.innerHTML=`<form class="pp-card pp-start" novalidate>
    <h3 class="pp-h">Start your project</h3>
    <p class="pp-muted">${q.package?'We have filled this in from your quote. Check it and press Start.':'Tell us the basics. You can change the details with us later.'}</p>
    <div class="row2"><div class="cfield"><label>Business name</label><input name="business_name" required value="${esc(q.organisation||'')}"></div>
      <div class="cfield"><label>Current website <span class="opt">optional</span></label><input name="website" placeholder="yourbusiness.co.uk" value="${esc(q.website||'')}"></div></div>
    <div class="row2"><div class="cfield"><label>Package</label><select name="package">${SME.packages.map(k=>`<option value="${k.id}"${(q.package||'rebuild')===k.id?' selected':''}>${k.name}, from ${gbp(k.price)}</option>`).join('')}</select></div>
      <div class="cfield"><label>Number of pages</label><input name="pages" type="number" min="1" max="250" value="${esc(q.pages||8)}"></div></div>
    <fieldset class="cfield"><legend>Add-ons</legend><div class="chips-in">${SME.addons.map(a=>`<label class="chk"><input type="checkbox" name="addons" value="${a.id}"${(q.addons||[]).includes(a.id)?' checked':''}><span>${a.t}</span></label>`).join('')}</div></fieldset>
    <div class="row2"><div class="cfield"><label>Domain</label><select name="domain_mode"><option value="have"${q.dmode!=='need'?' selected':''}>I already have a domain</option><option value="need"${q.dmode==='need'?' selected':''}>Please secure one for me</option></select></div>
      <div class="cfield"><label>Domain name</label><input name="domain" placeholder="yourbusiness.co.uk" value="${esc(q.domain||'')}"></div></div>
    <div class="cfield"><label>Hosting</label><select name="hosting"><option value="us"${q.hosting!=='self'?' selected':''}>Host it for me (${gbp(SME.hosting)} a year)</option><option value="self"${q.hosting==='self'?' selected':''}>I will host it myself</option></select></div>
    <button class="btn" type="submit"><span>Start my project</span></button>
    <p class="pp-muted pp-small">No payment is taken here. We confirm your quote and send the first invoice.</p>
  </form>`;
  const f=el.querySelector('form') as HTMLFormElement;
  f.addEventListener('submit',async e=>{
    e.preventDefault();if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f),btn=f.querySelector('button');btn.disabled=true;
    const pk=SME.packages.find(k=>k.id===fd.get('package'));
    try{
      const row=check(await sb.from('clients').insert({
        business_name:String(fd.get('business_name')).trim(),website:String(fd.get('website')||'').trim()||null,package:fd.get('package'),pages:+fd.get('pages')||null,
        addons:fd.getAll('addons'),domain_mode:fd.get('domain_mode'),domain:String(fd.get('domain')||'').trim()||null,hosting:fd.get('hosting'),
        quote_total:q.total||pk?.price||null,owner_email:clerk.user.primaryEmailAddress?.emailAddress||null,owner_name:clerk.user.fullName||null
      }).select().single());
      check(await sb.from('briefs').insert({client_id:row.id,answers:{}}));
      S.current=row;try{localStorage.setItem('mg-portal-current',row.id);localStorage.removeItem('mg-quote');}catch{}
      notify('project_started');
      if(row.website)api('/api/portal-rescore',{clientId:row.id}).catch(()=>{});
      location.hash='onboarding';
    }catch(err){toast(err.message,true);btn.disabled=false;}
  });
}
