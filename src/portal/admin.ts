/* =====================================================================
   PORTAL ADMIN — for Minshall Group staff (rows in public.admins).
   All projects; per project: service, stage and links, the plan and the
   results we measure, documents we deliver, brief, files, requests and
   quotes, invoices (raised in your accounting software, tracked here) and
   website re-checks. Every change a client should know about emails them.
   ===================================================================== */
import {sb,S,esc,gbp,date,check,notify,api,toast,upload,fileUrl,unreadForTeam,markSeen} from './core';
import {briefFor,stagesFor,svc,SERVICES} from './brief';
import {openRequest,briefSummary,fmtAnswer} from './views';

export async function viewAdmin(el:HTMLElement,rerender:()=>void){
  const all=S.projects;
  const [briefs,reqs,inv,signups]=await Promise.all([sb.from('briefs').select('client_id,submitted_at'),sb.from('requests').select('client_id,status,last_client_at,team_seen_at'),sb.from('invoices').select('client_id,status,amount_gbp'),sb.from('signups').select('*').order('created_at',{ascending:false})]);
  /* businesses that clicked through from an outreach email and ran the check on their own site (the table may not exist yet) */
  const clicks=await sb.from('site_checks').select('site,from_link,created_at').eq('from_link',true).order('created_at',{ascending:false}).limit(60).then(r=>r.data||[],()=>[]);
  const unread=c=>(reqs.data||[]).filter(r=>r.client_id===c&&unreadForTeam(r)).length;
  const owners=new Set(all.map(p=>p.owner_id));const waiting=(signups.data||[]).filter(u=>!owners.has(u.user_id));
  const sub=new Set((briefs.data||[]).filter(b=>b.submitted_at).map(b=>b.client_id));
  const open=c=>(reqs.data||[]).filter(r=>r.client_id===c&&['new','approved','in_progress'].includes(r.status)).length;
  const owed=c=>(inv.data||[]).filter(i=>i.client_id===c&&(i.status==='due'||i.status==='overdue')).reduce((s,i)=>s+Number(i.amount_gbp),0);
  const tabsA:[string,string,number][]=[['projects','Projects',all.length],['new','New client project',0],['accounts','New accounts',waiting.length],['clicks','Email clicks',clicks.length]];
  let at=(()=>{try{return sessionStorage.getItem('mg-admin-tab')||'projects';}catch{return 'projects';}})();if(!tabsA.some(t=>t[0]===at))at='projects';
  const item=(p:any)=>{const u=unread(p.id),o=open(p.id),w=owed(p.id);
    return `<li><button type="button" class="ad-proj${p.id===S.current?.id?' sel':''}" data-pick="${p.id}" data-q="${esc((p.business_name+' '+(p.owner_name||'')+' '+(p.owner_email||'')).toLowerCase())}">
      <b>${esc(p.business_name)}</b><small>${esc(SERVICES[svc(p)].short)} · ${esc(stagesFor(p).find(s=>s.id===p.stage)?.t||p.stage)}${sub.has(p.id)?' · brief in':''}</small>
      ${u||o||w?`<span class="ad-chips">${u?`<i class="hot">${u} unread</i>`:''}${o?`<i>${o} open</i>`:''}${w?`<i>${gbp(w)} owed</i>`:''}</span>`:''}</button></li>`;};
  el.innerHTML=`<nav class="ad-tabs" aria-label="Admin">${tabsA.map(([id,t,n])=>`<button type="button" data-adtab="${id}" class="${id===at?'on':''}">${t}${n?` <span>${n}</span>`:''}</button>`).join('')}</nav>
    <div data-ad="projects"${at==='projects'?'':' hidden'}><div class="ad-split">
      <aside class="ad-list"><label class="sr" for="ad-q">Find a project</label><input id="ad-q" type="search" placeholder="Find a project or client" data-adq>
        <ul>${all.map(item).join('')||'<li class="pp-muted">No projects yet.</li>'}</ul></aside>
      <div class="ad-main" data-manage>${S.current?'<p class="pp-loading">Loading…</p>':'<div class="pp-card"><p class="pp-muted">Choose a project on the left.</p></div>'}</div></div></div>
    <div data-ad="new" hidden><form class="pp-card wf-form ad-narrow" data-newproj><h3 class="pp-h">Set up a client project</h3>
      <p class="pp-muted pp-small">For a proposal or a project we run with a client's team. You lead it; add their people in Workflow, and each sees it once they sign up with the email you add.</p>
      <div class="row2"><div class="cfield"><label for="np-n">Organisation</label><input id="np-n" name="business_name" required></div>
        <div class="cfield"><label for="np-s">Service</label><select id="np-s" name="service">${Object.entries(SERVICES).map(([id,v])=>`<option value="${id}"${id==='digital'?' selected':''}>${esc(v.t)}</option>`).join('')}</select></div></div>
      <div class="cfield"><label for="np-a">The aim (the client sees this)</label><input id="np-a" name="summary" placeholder="A project tool that shows every referral, owner and deadline in one place"></div>
      <div class="row2"><div class="cfield"><label for="np-f">Project fee (£) <span class="opt">optional</span></label><input id="np-f" name="quote_total" type="number" min="0"></div>
        <div class="cfield"><label for="np-b">Billing email <span class="opt">optional</span></label><input id="np-b" name="billing_email" type="email"></div></div>
      <button class="btn sm" type="submit"><span>Create and open Workflow</span></button></form></div>
    <div data-ad="accounts" hidden><div class="pp-card"><h3 class="pp-h">New accounts without a project</h3><p class="pp-muted pp-small">They signed up but have not started a project yet. A short personal email often helps.</p>
      ${waiting.length?`<table class="pp-table"><thead><tr><th>Name</th><th>Email</th><th>Signed up</th></tr></thead><tbody>${waiting.map(u=>`<tr><td>${esc(u.name||'—')}</td><td>${esc(u.email||'—')}</td><td>${date(u.created_at)}</td></tr>`).join('')}</tbody></table>`:'<p class="pp-muted">None right now.</p>'}</div></div>
    <div data-ad="clicks" hidden><div class="pp-card"><h3 class="pp-h">Email clicks</h3><p class="pp-muted pp-small">Businesses that clicked the link in our outreach email and ran the check on their own site. Your warmest follow-ups.</p>
      ${clicks.length?`<table class="pp-table"><thead><tr><th>Website</th><th>Checked</th></tr></thead><tbody>${clicks.map(c=>`<tr><td><a class="ulink" href="https://${esc(c.site)}" target="_blank" rel="noopener">${esc(c.site)}</a></td><td>${date(c.created_at)}</td></tr>`).join('')}</tbody></table>`:'<p class="pp-muted">None yet.</p>'}</div></div>`;
  const showTab=(id:string)=>{at=id;try{sessionStorage.setItem('mg-admin-tab',id);}catch{};el.querySelectorAll<HTMLElement>('[data-ad]').forEach(s=>s.hidden=s.dataset.ad!==id);el.querySelectorAll<HTMLElement>('[data-adtab]').forEach(b=>b.classList.toggle('on',b.dataset.adtab===id));};
  showTab(at);
  el.querySelectorAll<HTMLElement>('[data-adtab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.adtab)));
  el.querySelector<HTMLInputElement>('[data-adq]')?.addEventListener('input',e=>{const q=(e.target as HTMLInputElement).value.trim().toLowerCase();el.querySelectorAll<HTMLElement>('.ad-list li').forEach(li=>{const b=li.querySelector<HTMLElement>('[data-q]');if(b)li.hidden=!!q&&!b.dataset.q.includes(q);});});
  const show=()=>manage(el.querySelector('[data-manage]'),rerender).catch(e=>{(el.querySelector('[data-manage]') as HTMLElement).innerHTML=`<div class="pp-card"><p>${esc(e.message||'Could not load this project')}</p></div>`;});
  el.querySelectorAll<HTMLElement>('[data-pick]').forEach(b=>b.addEventListener('click',async()=>{S.current=all.find(p=>p.id===b.dataset.pick);try{localStorage.setItem('mg-portal-current',S.current.id);}catch{};
    el.querySelectorAll('.ad-proj').forEach(x=>x.classList.toggle('sel',x===b));const m=el.querySelector<HTMLElement>('[data-manage]');m.innerHTML='<p class="pp-loading">Loading…</p>';
    await show();if(matchMedia('(max-width:980px)').matches)m.scrollIntoView({behavior:'smooth',block:'start'});}));
  el.querySelector<HTMLFormElement>('[data-newproj]').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f),btn=f.querySelector('button');btn.disabled=true;const v=(k:string)=>String(fd.get(k)||'').trim()||null;
    try{const row=check(await sb.from('clients').insert({business_name:v('business_name'),service:fd.get('service'),summary:v('summary'),quote_total:fd.get('quote_total')?+fd.get('quote_total'):null,
        billing_name:v('business_name'),billing_email:(v('billing_email')||'').toLowerCase()||null,stage:'discovery'}).select().single());
      check(await sb.from('briefs').insert({client_id:row.id,answers:{}}));
      S.current=row;try{localStorage.setItem('mg-portal-current',row.id);}catch{};toast('Project created. Add their team and the plan here.');location.hash='workflow';}
    catch(err){toast(err.message,true);btn.disabled=false;}
  });
  if(S.current)await show();
}

/* plan and results are edited as simple lines: easy to type, easy to read */
const planText=(a:any[])=>(a||[]).map(m=>[m.due||'',m.t||'',m.done?'done':''].join(' | ').replace(/ \| $/,'')).join('\n');
const parsePlan=(t:string)=>t.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(c=>c.join('')).map(([due,t,done])=>({due:/^\d{4}-\d{2}-\d{2}$/.test(due)?due:null,t:t||due,done:/^(done|yes|y|x|✓)$/i.test(done||'')}));
const kpiText=(a:any[])=>(a||[]).map(k=>[k.label,k.baseline,k.current,k.target].map(x=>x??'').join(' | ')).join('\n');
const parseKpis=(t:string)=>t.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(c=>c[0]).map(([label,baseline,current,target])=>({label,baseline:baseline||'',current:current||'',target:target||''}));

async function manage(box:HTMLElement,rerender){
  const p=S.current;
  const [brief,files,reqs,inv,scores,members]=await Promise.all([
    sb.from('briefs').select('*').eq('client_id',p.id).maybeSingle(),sb.from('files').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('requests').select('*').eq('client_id',p.id).order('created_at',{ascending:false}),sb.from('invoices').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('scores').select('id,checked_at,label').eq('client_id',p.id).order('checked_at',{ascending:false}).limit(5),
    sb.from('project_members').select('email,name,role').eq('client_id',p.id).then(r=>r,()=>({data:[]}))]);
  const A=brief.data?.answers||{};const STAGES=stagesFor(p);const BRIEF=briefFor(p,A);const web=svc(p)==='website';
  const SECS:[string,string][]=[['project','Project'],['client','Client view'],['documents','Documents'],['brief','Brief'],['messages','Messages and requests'],['invoices','Invoices'],...(web||p.live_url?[['website','Website checks']] as [string,string][]:[])];
  let sec=(()=>{try{return sessionStorage.getItem('mg-admin-sec')||'project';}catch{return 'project';}})();if(!SECS.some(x=>x[0]===sec))sec='project';
  box.innerHTML=`<div class="ad-head"><div><span class="eyebrow">${esc(SERVICES[svc(p)].short)} · ${esc(STAGES.find(s=>s.id===p.stage)?.t||p.stage)}</span><h2 class="h3">${esc(p.business_name)}</h2></div>
      <div class="ad-jump"><a class="btn sm ghost" href="#workflow"><span>Workflow</span></a><a class="btn sm ghost" href="#agreements"><span>Agreements</span></a><a class="btn sm ghost" href="#overview"><span>Their overview</span></a></div></div>
    <nav class="ad-sub" aria-label="Project sections">${SECS.map(([id,t])=>`<button type="button" data-sec-go="${id}">${t}</button>`).join('')}</nav>
    <div class="pp-admin">
    <form class="pp-card" data-proj data-sec="project"><h3 class="pp-h">Project, stage and links</h3>
      <div class="row2"><div class="cfield"><label>Service</label><select name="service">${Object.entries(SERVICES).map(([id,v])=>`<option value="${id}"${id===svc(p)?' selected':''}>${esc(v.t)}</option>`).join('')}</select></div>
        <div class="cfield"><label>Stage</label><select name="stage">${STAGES.map(s=>`<option value="${s.id}"${s.id===p.stage?' selected':''}>${s.t}</option>`).join('')}</select></div></div>
      <div class="row2"><div class="cfield"><label>${web?'Build price':'Project fee'} (£)</label><input name="quote_total" type="number" value="${p.quote_total??''}"></div>
        <div class="cfield"><label>The aim (client sees this)</label><input name="summary" value="${esc(p.summary||'')}"></div></div>
      <div class="row2"><div class="cfield"><label>Preview link (designs to review)</label><input name="preview_url" value="${esc(p.preview_url||'')}" placeholder="https://…vercel.app"></div>
        <div class="cfield"><label>Live link</label><input name="live_url" value="${esc(p.live_url||'')}" placeholder="https://theirdomain.co.uk"></div></div>
      <div class="row2"><div class="cfield"><label>Clarity dashboard link</label><input name="clarity_url" value="${esc(p.clarity_url||'')}"></div>
        <div class="cfield"><label>Internal note (client cannot see)</label><input name="admin_note" value="${esc(p.admin_note||'')}"></div></div>
      <div class="cfield"><label>Plan and milestones</label><small class="pp-hint">One per line: date | milestone | done. For example: 2026-11-20 | Discovery interviews complete | done</small><textarea name="plan" rows="5" placeholder="2026-11-20 | Discovery interviews complete&#10;2026-12-05 | Options workshop">${esc(planText(p.plan))}</textarea></div>
      <div class="cfield"><label>Results we are measuring</label><small class="pp-hint">One per line: measure | start | now | target. For example: Online bookings | 10% | 18% | 40%</small><textarea name="kpis" rows="4" placeholder="Self-pay revenue a month | £80k | £86k | £104k">${esc(kpiText(p.kpis))}</textarea></div>
      <div class="cfield"><label>Private project page (Markdown)</label><small class="pp-hint">Shown as the Proposal tab, only to people on this project. Paste the proposal here: headings, lists, tables and links all work.</small><textarea name="page_md" rows="8" placeholder="# Project title&#10;&#10;What we will deliver…">${esc(p.page_md||'')}</textarea></div>
      <label class="pp-check"><input type="checkbox" name="tell" checked> Email the client if the stage changes</label>
      <button class="btn sm" type="submit"><span>Save</span></button></form>

    <div data-sec="client">${(members.data||[]).length?'':`<div class="pp-card"><h3 class="pp-h">See it as the client</h3><p class="pp-muted">Add the client's people in Workflow first, then preview the portal as any of them here.</p><a class="btn sm" href="#workflow"><span>Open Workflow</span></a></div>`}
    ${(members.data||[]).length?`<div class="pp-card"><h3 class="pp-h">See it as the client</h3><p class="pp-muted pp-small">A read-only preview of the portal exactly as this person sees it: their tabs, what is waiting for them and what they can sign.</p>
      <div class="pp-inline"><label class="sr" for="va">Person</label><select id="va" data-viewas>${members.data.map(m=>`<option value="${esc(m.email)}">${esc(m.name||m.email)} (${esc(m.role)})</option>`).join('')}</select><button type="button" class="btn sm" data-viewas-go><span>View as them</span></button></div></div>`:''}</div>
    <div data-sec="documents"><form class="pp-card" data-deliver><h3 class="pp-h">Deliver a document</h3>
      <p class="pp-muted pp-small">Reports, decks, models or designs. The client sees it in Documents and gets an email.</p>
      <div class="cfield"><label for="dl-t">Title</label><input id="dl-t" name="title" required placeholder="Market sizing report, v1"></div>
      <label class="pp-drop"><input type="file" name="file" required><span>Choose the file</span></label>
      <button class="btn sm" type="submit"><span>Deliver</span></button></form>
      <div class="pp-card"><h3 class="pp-h">All files</h3><ul class="pp-files">${(files.data||[]).map(f=>`<li><button type="button" class="ulink" data-file="${esc(f.path)}">${esc(f.name)}</button> <small>${f.kind} · ${Math.round((f.size||0)/1024)} KB · ${date(f.created_at)}</small></li>`).join('')||'<li class="pp-muted">None yet</li>'}</ul></div></div>

    <div class="pp-card" data-sec="brief"><h3 class="pp-h">Brief ${brief.data?.submitted_at?`<small>submitted ${date(brief.data.submitted_at)}</small>`:'<small>not submitted yet</small>'}</h3>
      ${A.direction?briefSummary(A):''}
      <details class="pp-all"><summary>All answers</summary>${BRIEF.map(s=>`<h4 class="pp-h4">${esc(s.t)}</h4><dl class="pp-dl">${s.fields.filter(f=>f.type!=='files').map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(fmtAnswer(f,A[f.id]))}</dd>`).join('')}</dl>`).join('')}</details>
      <form class="wf-form" data-prefill><h4 class="pp-h4">Pre-fill the brief</h4>
        <small class="pp-hint">Paste a brief file prepared for this client. It fills in the answers we already know and adds any questions for this project; the client checks, completes and submits it. Answers they have already given are kept.</small>
        <textarea name="json" rows="4" placeholder='{"answers":{...},"questions":[...]}'></textarea>
        <button class="btn sm ghost" type="submit"><span>Pre-fill the brief</span></button></form>
      </div>

    <div data-sec="messages"><form class="pp-card" data-msg><h3 class="pp-h">Message ${esc(p.owner_name||p.business_name)}</h3>
      <p class="pp-muted pp-small">Starts a conversation in their portal and emails them the message. They can reply in the portal.</p>
      <div class="cfield"><label for="msg-t">Subject</label><input id="msg-t" name="title" required maxlength="120" placeholder="Your homepage design is nearly ready"></div>
      <div class="cfield"><label for="msg-b">Message</label><textarea id="msg-b" name="body" rows="4" required></textarea></div>
      <button class="btn sm" type="submit"><span>Send message</span></button></form>

    <div class="pp-card"><h3 class="pp-h">Requests</h3>
      ${(reqs.data||[]).length?`<ul class="pp-reqs">${reqs.data.map(r=>`<li><details data-req="${r.id}"><summary><span class="pp-badge s-${r.kind==='message'?'message':r.status||'new'}">${r.kind==='message'?'message':(r.status||'new').replace('_',' ')}</span>${unreadForTeam(r)?'<span class="pp-new">Unread</span>':''}<b>${esc(r.title)}</b><small>${r.kind} · ${date(r.created_at)}${r.quote_gbp!=null?' · '+gbp(r.quote_gbp):''}</small></summary>
        <form class="pp-inline" data-rq="${r.id}"><label>Quote £<input name="quote" type="number" min="0" value="${r.quote_gbp??''}"></label><button class="btn sm ghost" name="act" value="quote"><span>Send quote</span></button>
          <select name="status">${['new','in_progress','done','declined'].map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('')}</select><button class="btn sm ghost" name="act" value="status"><span>Update status</span></button></form>
        <div class="pp-req-body" data-body></div></details></li>`).join('')}</ul>`:'<p class="pp-muted">No requests.</p>'}</div></div>

    <div class="pp-card" data-sec="invoices"><h3 class="pp-h">Invoices <small>raised in your accounting software, tracked here</small></h3>
      <table class="pp-table"><thead><tr><th>Invoice</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
      ${(inv.data||[]).map(i=>`<tr><td><b>${esc(i.label)}</b><small>${esc(i.number||'')}</small></td><td>${gbp(i.amount_gbp)}</td><td>${date(i.due_on)}</td>
        <td><select data-inv="${i.id}">${['draft','due','paid','overdue','void'].map(s=>`<option${s===i.status?' selected':''}>${s}</option>`).join('')}</select></td>
        <td>${i.view_url?`<a class="ulink" href="${esc(i.view_url)}" target="_blank" rel="noopener">Link</a>`:''}</td></tr>`).join('')||'<tr><td colspan="5" class="pp-muted">No invoices yet.</td></tr>'}</tbody></table>
      ${p.quote_total&&!(inv.data||[]).length?`<button class="btn sm ghost" data-stages><span>Create the three stage invoices (drafts)</span></button>`:''}
      <form class="pp-inv" data-newinv><h4 class="pp-h4">Add an invoice</h4>
        <div class="row2"><div class="cfield"><label>Label</label><input name="label" required placeholder="Stage 1 of 3: to start"></div><div class="cfield"><label>Invoice number</label><input name="number"></div></div>
        <div class="row2"><div class="cfield"><label>Amount (£)</label><input name="amount" type="number" step="0.01" required></div><div class="cfield"><label>Due date</label><input name="due" type="date"></div></div>
        <div class="cfield"><label>View or pay link from your accounting software</label><input name="view_url" placeholder="https://…"></div>
        <label class="pp-drop"><input type="file" name="pdf" accept="application/pdf"><span>Attach PDF (optional)</span></label>
        <label class="pp-check"><input type="checkbox" name="issue" checked> Issue now (client sees it and gets an email)</label>
        <button class="btn sm" type="submit"><span>Add invoice</span></button></form></div>

    ${web||p.live_url?`<div class="pp-card" data-sec="website"><h3 class="pp-h">Website checks</h3>
      <ul class="pp-files">${(scores.data||[]).map(s=>`<li>${date(s.checked_at)} · ${esc(s.label||'')}</li>`).join('')||'<li class="pp-muted">None yet</li>'}</ul>
      <div class="pp-inline"><input data-label placeholder="Label, e.g. Launch" value="${p.stage==='live'?'Launch':'Before'}"><button class="btn sm" data-rescore><span>Check site now</span></button></div></div>`:''}
  </div>`;

  const refresh=()=>manage(box,rerender);
  const go=(id:string)=>{sec=id;try{sessionStorage.setItem('mg-admin-sec',id);}catch{};box.querySelectorAll<HTMLElement>('[data-sec]').forEach(c=>c.hidden=c.dataset.sec!==id);box.querySelectorAll<HTMLElement>('[data-sec-go]').forEach(b=>b.classList.toggle('on',b.dataset.secGo===id));};
  go(sec);box.querySelectorAll<HTMLElement>('[data-sec-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.secGo)));
  box.querySelector<HTMLFormElement>('[data-prefill]')?.addEventListener('submit',async e=>{e.preventDefault();
    let j:any;try{j=JSON.parse(String(new FormData(e.target as HTMLFormElement).get('json')||''));}catch{return toast('That is not a valid brief file',true);}
    if(!j||typeof j!=='object'||(!j.answers&&!j.questions))return toast('That is not a valid brief file',true);
    const cur=brief.data?.answers||{};const merged:any={...cur};
    for(const [k,val] of Object.entries(j.answers||{})){const has=cur[k]!=null&&cur[k]!==''&&!(Array.isArray(cur[k])&&!cur[k].length);if(!has)merged[k]=val;}
    if(Array.isArray(j.questions))merged._questions=j.questions;
    for(const k of ['questionsTitle','questionsIntro'])if(j[k])merged['_'+k]=j[k];
    try{if(brief.data)check(await sb.from('briefs').update({answers:merged,updated_at:new Date().toISOString()}).eq('client_id',p.id));else check(await sb.from('briefs').insert({client_id:p.id,answers:merged}));
      toast(`Brief pre-filled: ${Object.keys(j.answers||{}).length} answers, ${(j.questions||[]).length} project questions`);refresh();}catch(err){toast(err.message,true);}});
  box.querySelector('[data-viewas-go]')?.addEventListener('click',()=>{const e=(box.querySelector('[data-viewas]') as HTMLSelectElement).value;const m=(members.data||[]).find(x=>x.email===e);
    try{sessionStorage.setItem('mg-view-as',JSON.stringify({client:p.id,email:e,name:m?.name||e,role:m?.role}));}catch{};location.hash='overview';rerender();});
  box.querySelector('[data-proj]').addEventListener('submit',async e=>{
    e.preventDefault();const fd=new FormData(e.target as HTMLFormElement);const before=p.stage;
    const service=String(fd.get('service'));const stages=stagesFor({service});const stage=stages.some(x=>x.id===fd.get('stage'))?fd.get('stage'):stages[0].id;
    const upd={service,stage,summary:String(fd.get('summary')||'').trim()||null,plan:parsePlan(String(fd.get('plan')||'')),kpis:parseKpis(String(fd.get('kpis')||'')),quote_total:fd.get('quote_total')?+fd.get('quote_total'):null,preview_url:String(fd.get('preview_url')||'').trim()||null,live_url:String(fd.get('live_url')||'').trim()||null,clarity_url:String(fd.get('clarity_url')||'').trim()||null,admin_note:String(fd.get('admin_note')||'').trim()||null,page_md:String(fd.get('page_md')||'').trim()||null};
    try{S.current=check(await sb.from('clients').update(upd).eq('id',p.id).select().single());if(fd.get('tell')&&before!==upd.stage)notify('stage_changed');toast('Saved');rerender();}catch(err){toast(err.message,true);}
  });
  box.querySelectorAll<HTMLElement>('[data-file]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.file);if(u)window.open(u,'_blank','noopener');}));
  box.querySelectorAll<HTMLFormElement>('[data-rq]').forEach(f=>f.addEventListener('submit',async e=>{
    e.preventDefault();const act=((e as SubmitEvent).submitter as HTMLButtonElement)?.value;const fd=new FormData(f);
    try{
      if(act==='quote'){if(!fd.get('quote'))return toast('Enter a price first',true);check(await sb.from('requests').update({quote_gbp:+fd.get('quote'),status:'quoted'}).eq('id',f.dataset.rq));notify('request_quoted',{requestId:f.dataset.rq});}
      else{check(await sb.from('requests').update({status:fd.get('status')}).eq('id',f.dataset.rq));notify('request_updated',{requestId:f.dataset.rq});}
      toast('Updated and client emailed');refresh();
    }catch(err){toast(err.message,true);}
  }));
  box.querySelectorAll<HTMLDetailsElement>('[data-req]').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;const r=(reqs.data||[]).find(x=>x.id===d.dataset.req);
    if(unreadForTeam(r)){markSeen(r,true);d.querySelector('.pp-new')?.remove();S.teamUnread=Math.max(0,S.teamUnread-1);}
    openRequest(d,r,refresh,true);}));
  box.querySelector('[data-msg]').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f),btn=f.querySelector('button');btn.disabled=true;
    try{const r=check(await sb.from('requests').insert({client_id:p.id,kind:'message',title:String(fd.get('title')).trim(),body:String(fd.get('body')).trim()}).select().single());
      notify('team_message_new',{requestId:r.id});toast('Message sent and emailed to the client');refresh();}
    catch(err){toast(err.message,true);btn.disabled=false;}
  });
  box.querySelectorAll<HTMLSelectElement>('[data-inv]').forEach(s=>s.addEventListener('change',async()=>{
    try{const was=(inv.data||[]).find(i=>i.id===s.dataset.inv)?.status;check(await sb.from('invoices').update({status:s.value}).eq('id',s.dataset.inv));if(was==='draft'&&s.value==='due')notify('invoice_issued');toast('Invoice updated');}catch(err){toast(err.message,true);}
  }));
  box.querySelector('[data-stages]')?.addEventListener('click',async()=>{
    const t=Number(p.quote_total),third=Math.round(t/3),parts=[third,third,t-2*third];
    const labels=['Stage 1 of 3: to start','Stage 2 of 3: design approved','Stage 3 of 3: on completion'];
    try{check(await sb.from('invoices').insert(parts.map((a,i)=>({client_id:p.id,label:labels[i],amount_gbp:a,status:'draft'}))));toast('Three draft invoices created. Add numbers and links, then set them to due.');refresh();}catch(err){toast(err.message,true);}
  });
  box.querySelector('[data-newinv]').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target as HTMLFormElement;const fd=new FormData(f);if(!f.checkValidity())return;
    try{
      let pdf_path=null;const pdf=fd.get('pdf') as File;if(pdf&&pdf.size){pdf_path=(await upload(pdf,'invoice','Invoice')).path;}
      const issue=!!fd.get('issue');
      check(await sb.from('invoices').insert({client_id:p.id,label:fd.get('label'),number:fd.get('number')||null,amount_gbp:+fd.get('amount'),due_on:fd.get('due')||null,issued_on:issue?new Date().toISOString().slice(0,10):null,view_url:String(fd.get('view_url')||'').trim()||null,pdf_path,status:issue?'due':'draft'}));
      if(issue)notify('invoice_issued');toast('Invoice added');refresh();
    }catch(err){toast(err.message,true);}
  });
  box.querySelector('[data-deliver]').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target as HTMLFormElement;const fd=new FormData(f);const fl=fd.get('file') as File;
    if(!String(fd.get('title')||'').trim()||!fl?.size)return toast('Add a title and choose a file',true);
    if(fl.size>25*1024*1024)return toast('Files must be under 25 MB',true);
    const btn=f.querySelector('button');btn.disabled=true;
    try{const row=await upload(fl,'deliverable',String(fd.get('title')).trim());notify('deliverable_added',{fileId:row.id});toast('Delivered and the client emailed');refresh();}
    catch(err){toast(err.message,true);btn.disabled=false;}
  });
  box.querySelector('[data-rescore]')?.addEventListener('click',async e=>{
    const b=e.currentTarget as HTMLButtonElement;b.disabled=true;
    try{await api('/api/portal-rescore',{clientId:p.id,label:(box.querySelector('[data-label]') as HTMLInputElement).value});toast('Checked');refresh();}catch(err){toast(err.message,true);b.disabled=false;}
  });
}
