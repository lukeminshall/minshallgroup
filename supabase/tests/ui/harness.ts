/* Portal workflow harness: the real Workflow screen, the real migrations and
   row-level security, in an in-browser Postgres. A small stand-in for the
   Supabase client turns the screen's queries into SQL run as the chosen
   person, so every button is checked against the real database rules.
   Server calls (/api/portal-notify) are logged, not sent. */
import '../../../src/styles.css';
import {PGlite} from '@electric-sql/pglite';
import m1 from '../../migrations/001_client_portal.sql?raw';
import m2 from '../../migrations/002_notifications.sql?raw';
import m3 from '../../migrations/003_site_checks.sql?raw';
import m4 from '../../migrations/004_services_and_team.sql?raw';
import m5 from '../../migrations/005_team_workflow.sql?raw';
import {__test,S} from '../../../src/portal/core';
import {viewWorkflow} from '../../../src/portal/workflow';

const db=new PGlite();
await db.exec(`
create role authenticated nologin; create role anon nologin;
create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id text default (auth.jwt()->>'sub'));
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;`);
for(const m of [m1,m2,m3,m4,m5])await db.exec(m);
await db.exec(`grant usage on schema public, storage, auth to authenticated; grant all on all tables in schema public, storage to authenticated; grant execute on all functions in schema public, auth, storage to authenticated;`);

/* test people (made up for this harness) */
const PEOPLE=[
  {id:'user_admin',email:'luke@minshallgroup.com',first:'Luke',full:'Luke (Minshall Group)'},
  {id:'user_o',email:'lead@client.test',first:'Olivia',full:'Olivia Lead'},
  {id:'user_e',email:'eve@client.test',first:'Eve',full:'Eve Approver'},
  {id:'user_a',email:'alex@client.test',first:'Alex',full:'Alex Reviewer'},
  {id:'user_b',email:'bea@client.test',first:'Bea',full:'Bea Reviewer'},
  {id:'user_c',email:'cal@client.test',first:'Cal',full:'Cal Contributor'}];
await db.query(`insert into public.admins values ('user_admin','Luke')`);
for(const p of PEOPLE)await db.query(`insert into public.signups (user_id,email,name) values ($1,$2,$3)`,[p.id,p.email,p.full]);

/* run SQL as a person, one statement at a time */
let chain:Promise<any>=Promise.resolve();
const asUser=(sub:string|null,sql:string,params:any[]=[])=>{const job=chain.then(async()=>{
  await db.exec('reset role');await db.exec(`set request.jwt.claims = '${JSON.stringify(sub?{sub}:{role:'service_role'})}'`);
  if(sub)await db.exec('set role authenticated');
  try{return await db.query(sql,params);}finally{await db.exec('reset role');}});chain=job.catch(()=>{});return job;};
let ME=PEOPLE[1];

const conv=(v:any)=>v===undefined?null:Array.isArray(v)?(v.some(x=>x&&typeof x==='object')?JSON.stringify(v):v):(v&&typeof v==='object')?JSON.stringify(v):v;
class Q{t:string;f:[string,string,any][]=[];o:string[]=[];op='select';cols='*';pl:any=null;one=0;lim=0;
  constructor(t:string){this.t=t;}
  select(c='*'){if(this.op==='select')this.cols=c;return this;}
  eq(k:string,v:any){this.f.push([k,'=',v]);return this;} neq(k:string,v:any){this.f.push([k,'<>',v]);return this;}
  is(k:string,v:any){this.f.push([k,'is',v]);return this;} in(k:string,v:any[]){this.f.push([k,'in',v]);return this;} like(k:string,v:string){this.f.push([k,'like',v]);return this;}
  order(k:string,o:any={}){this.o.push(`"${k}" ${o.ascending===false?'desc':'asc'}`);return this;} limit(n:number){this.lim=n;return this;}
  insert(r:any){this.op='insert';this.pl=Array.isArray(r)?r:[r];return this;} update(r:any){this.op='update';this.pl=r;return this;} delete(){this.op='delete';return this;}
  single(){this.one=1;return this;} maybeSingle(){this.one=2;return this;}
  then(ok:any,bad:any){return this.run().then(ok,bad);}
  async run(){
    const ps:any[]=[];const P=(v:any)=>{ps.push(conv(v));return '$'+ps.length;};
    const where=()=>this.f.length?' where '+this.f.map(([k,op,v])=>op==='is'?`"${k}" is null`:op==='in'?`"${k}" = any(${P(v)})`:`"${k}" ${op} ${P(v)}`).join(' and '):'';
    let sql='';
    if(this.op==='select')sql=`select ${this.cols} from public.${this.t}${where()}${this.o.length?' order by '+this.o.join(','):''}${this.lim?' limit '+this.lim:''}`;
    if(this.op==='insert'){const cols=[...new Set(this.pl.flatMap((r:any)=>Object.keys(r)))] as string[];
      sql=`insert into public.${this.t} (${cols.map(c=>`"${c}"`).join(',')}) values ${this.pl.map((r:any)=>'('+cols.map(c=>r[c]===undefined?'default':P(r[c])).join(',')+')').join(',')} returning *`;}
    if(this.op==='update')sql=`update public.${this.t} set ${Object.entries(this.pl).map(([k,v])=>`"${k}" = ${P(v)}`).join(', ')}${where()} returning *`;
    if(this.op==='delete')sql=`delete from public.${this.t}${where()} returning *`;
    try{const r=await asUser(ME.id,sql,ps);let data:any=r.rows;
      if(this.one){data=r.rows[0]??null;if(this.one===1&&!data)return {data:null,error:{message:'No row returned (blocked by the database rules)'}};}
      return {data,error:null};}
    catch(e:any){return {data:null,error:{message:e.message}};}
  }}
const sb:any={from:(t:string)=>new Q(t),
  rpc:async(fn:string,args:any={})=>{const ks=Object.keys(args);try{const r=await asUser(ME.id,`select public.${fn}(${ks.map((k,i)=>`${k} => $${i+1}`).join(', ')}) as r`,ks.map(k=>conv(args[k])));return {data:r.rows[0].r,error:null};}catch(e:any){return {data:null,error:{message:e.message}};}},
  storage:{from:()=>({upload:async(path:string)=>({data:{path},error:null}),createSignedUrl:async()=>({data:{signedUrl:'about:blank'}})})}};

/* server calls: logged; a final sign-off with an invoice is marked raised, as the server would */
const log=(t:string)=>{const d=document.createElement('div');d.textContent=t;document.getElementById('hx-log').appendChild(d);};
const realFetch=window.fetch.bind(window);
(window as any).fetch=async(u:any,o:any={})=>{
  if(!String(u).startsWith('/api/'))return realFetch(u,o);
  const b=JSON.parse(o.body||'{}');log(`${ME.first}: ${b.event}${b.email?' '+b.email:''}`);
  let invoice;
  if(b.event==='signoff_decided'){const s=(await asUser(null,`select * from public.signoffs where id=$1`,[b.signoffId])).rows[0];
    if(s?.status==='approved'&&s.invoice_amount!=null&&!s.invoice_state){await asUser(null,`update public.signoffs set invoice_state='raised' where id=$1`,[s.id]);invoice='sent';log(`  → invoice ${s.invoice_label} £${s.invoice_amount} raised in Xero (simulated)`);}}
  return new Response(JSON.stringify({ok:true,invoice}),{status:200,headers:{'Content-Type':'application/json'}});};

/* the project, created by the client lead */
const proj=(await asUser('user_o',`insert into public.clients (business_name,service,summary,owner_email,owner_name) values ('Demo Health Ltd','digital','A project tool for the clinical team','lead@client.test','Olivia Lead') returning *`)).rows[0];

async function act(p:any){
  ME=p;
  __test({sb,clerk:{user:{id:p.id,firstName:p.first,fullName:p.full,primaryEmailAddress:{emailAddress:p.email}},session:{getToken:async()=>'t'}}});
  S.isAdmin=(await asUser(p.id,'select public.is_admin() v')).rows[0].v;
  const rows=(await asUser(p.id,'select * from public.clients where id=$1',[proj.id])).rows;
  document.querySelectorAll('[data-bar] button').forEach((b:any)=>b.classList.toggle('on',b.dataset.u===p.id));
  const el=document.querySelector('[data-view]') as HTMLElement;
  if(!rows.length){el.innerHTML=`<div class="pp-card"><p>${p.full} cannot see this project.</p></div>`;return;}
  S.current=rows[0];S.user={id:p.id};
  await viewWorkflow(el);
}
const bar=document.querySelector('[data-bar]');
for(const p of PEOPLE){const b=document.createElement('button');b.textContent=p.full;b.dataset.u=p.id;b.onclick=()=>act(p);bar.appendChild(b);}
(window as any).__hx={act:(id:string)=>act(PEOPLE.find(p=>p.id===id)),sql:(s:string,ps:any[]=[])=>asUser(null,s,ps).then(r=>r.rows),people:PEOPLE};
/* ?seed: a team of five, the standard phases, two tasks and a specification sign-off with one approval and one request for changes */
if(new URLSearchParams(location.search).has('seed')){
  const q=(s:string,ps:any[]=[])=>asUser(null,s,ps);
  await q(`insert into public.project_members (client_id,email,name,job_title,role,added_by) values ($1,'eve@client.test','Eve Approver','Clinical director','approver','user_admin'),($1,'alex@client.test','Alex Reviewer','Service manager','reviewer','user_admin'),($1,'bea@client.test','Bea Reviewer','Clinical lead','reviewer','user_admin'),($1,'cal@client.test','Cal Contributor','Systems analyst','contributor','user_admin')`,[proj.id]);
  const T=[['Discovery and specification','active'],['Design','upcoming'],['Build','upcoming'],['Testing and acceptance','upcoming'],['Launch and handover','upcoming']];
  for(const [i,[t,st]] of T.entries())await q(`insert into public.phases (client_id,sort,title,status) values ($1,$2,$3,$4)`,[proj.id,i+1,t,st]);
  const ph=(await q(`select id from public.phases where client_id=$1 order by sort limit 1`,[proj.id])).rows[0].id;
  const f=(await q(`insert into public.files (client_id,path,name,kind,size,uploaded_by) values ($1,'x/spec.pdf','Specification, version 1: Specification v1.pdf','deliverable',240000,'user_admin') returning id`,[proj.id])).rows[0].id;
  await q(`insert into public.tasks (client_id,phase_id,title,detail,assignee_email,status,created_by) values ($1,$2,'Map the current referral process','Interview two GP practices.','cal@client.test','doing','user_admin'),($1,$2,'Confirm reporting requirements',null,'bea@client.test','todo','user_admin')`,[proj.id,ph]);
  const so=(await asUser('user_admin',`insert into public.signoffs (client_id,phase_id,title,detail,approver_email,file_ids,invoice_label,invoice_amount) values ($1,$2,'Specification, version 1','Please check the scope and the referral journey in section 3.','eve@client.test',$3,'Project costs: build phase',12000) returning id`,[proj.id,ph,[f]])).rows[0].id;
  await asUser('user_admin',`insert into public.signoff_reviews (signoff_id,client_id,email,name) values ($1,$2,'alex@client.test','Alex Reviewer'),($1,$2,'bea@client.test','Bea Reviewer')`,[so,proj.id]);
  await asUser('user_a',`select public.decide_signoff($1,'approved','Scope looks right to me.')`,[so]);
  await asUser('user_b',`select public.decide_signoff($1,'changes','Section 3 is missing the GP referral route.')`,[so]);
}
/* ?proposal: render the Proposal tab from a Markdown file in the Downloads folder (local check only) */
if(new URLSearchParams(location.search).has('proposal')){const {viewProposal}=await import('../../../src/portal/proposal');
  const md=await (await fetch('/@fs/Users/lukeminshall/Downloads/IML%20Healthcare%20-%20portal%20page.md')).text();
  S.current={...proj,page_md:md};viewProposal(document.querySelector('[data-view]') as HTMLElement);throw new Error('proposal preview: stop');}
const start=new URLSearchParams(location.search).get('as');
await act(PEOPLE.find(p=>p.id===start)||PEOPLE[0]);
