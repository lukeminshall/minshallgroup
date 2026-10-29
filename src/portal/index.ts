/* =====================================================================
   CLIENT PORTAL — entry. Loaded only on /portal (dynamic import), so the
   rest of the site never downloads Clerk or Supabase.
   Tabs live in the URL hash: #overview, #onboarding, #requests, #documents,
   #billing, #performance (websites, or anything live), #admin.
   One portal for every kind of project: websites, commercial strategy and
   digital. Stages, the brief and the dashboard follow the project's service.
   ===================================================================== */
import {ready,boot,clerk,sb,S,esc,gbp,date,check,notify,api,toast,unreadForClient,unreadForTeam} from './core';
import {stagesFor,svc,SERVICES} from './brief';
import {SME} from '../content';
import {viewOnboarding,viewRequests,viewBilling,viewPerformance,viewDocuments} from './views';
import {score} from '../webmins';
import {viewAdmin} from './admin';

let root:HTMLElement;let ac:AbortController|null=null;
const tabsFor=(p:any)=>[['overview','Overview'],['onboarding',svc(p)==='website'?'Onboarding':'Brief'],['requests','Requests'],['documents','Documents'],['billing','Billing'],...(svc(p)==='website'||p?.live_url?[['performance','Performance']]:[])];

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

const savedQuote=()=>{try{const q=JSON.parse(localStorage.getItem('mg-quote')||'null');return q&&q.package?q:null;}catch{return null;}};
const pkName=(id:string)=>SME.packages.find(k=>k.id===id)?.name||id;
/* the website journey, step by step (same as on /digitalsme) */
const journey=(at:number)=>`<ol class="journey" aria-label="Your website journey">${[['Check your site','Optional, 20 seconds'],['Price it','Two minutes'],['Create your account','About 30 seconds'],['Onboarding','In your own time']].map(([t,d],i)=>`<li class="${i&&i+1<at?'done':i+1===at?'now':''}"${i+1===at?' aria-current="step"':''}><span>${i&&i+1<at?'✓':i+1}</span><b>${t}</b><small>${d}</small></li>`).join('')}</ol>`;

async function render(){
  if(!document.body.contains(root))return;
  if(!clerk.user){
    S.user=null;
    const q=savedQuote();document.body.classList.toggle('pp-hot',!!q);
    root.innerHTML=q?`${journey(3)}<div class="pp-signin pp-signin-q">
      <div><h2 class="h2">Your quote is ready. Create your account to start.</h2><p class="lede-s">It takes about 30 seconds. Your onboarding opens straight after, with your choices already filled in. No payment is taken now: we confirm your quote within one working day, then send the first invoice.</p>
        <div class="actions"><button class="btn" data-up><span>Create my account</span></button><button class="btn ghost" data-in><span>I already have one</span></button></div></div>
      <div class="pp-qcard"><span class="eyebrow">Your quote</span><b class="pp-qbiz">${esc(q.organisation||'Your website')}</b>
        <dl><div><dt>Package</dt><dd>${esc(pkName(q.package))}</dd></div><div><dt>Pages</dt><dd>${esc(String(q.pages||''))}</dd></div><div><dt>Add-ons</dt><dd>${(q.addons||[]).length?esc((q.addons||[]).map(id=>SME.addons.find(a=>a.id===id)?.t||id).join(', ')):'None'}</dd></div><div><dt>Hosting</dt><dd>${q.hosting==='self'?'Self-hosted':'We host it'}</dd></div></dl>
        <p class="pp-qtotal"><span>Build price</span><b>${gbp(q.total||0)}</b></p>
        <a class="tlink" href="/digitalsme#quote">Change my quote</a></div>
    </div>`:`<div class="pp-signin">
      <div><h2 class="h2">Log in to your project.</h2><p class="lede-s">Strategy, digital or a new website: follow progress, answer your brief, see the plan and the results, get your documents, raise requests and see invoices, all in one place.</p>
        <div class="actions"><button class="btn" data-in><span>Log in</span></button><button class="btn ghost" data-up><span>Create an account</span></button></div>
        <p class="pp-muted pp-new">New here? <a class="ulink" href="/start">Build your brief</a> or <a class="ulink" href="/digitalsme#quote">price a website</a> first, then create your account.</p></div>
      <ol class="pp-how">${['Create your account','Choose your project and answer the brief','See the plan, the progress and the results','Get documents, approve work and raise requests'].map((t,i)=>`<li><span>${i+1}</span>${t}</li>`).join('')}</ol>
    </div>`;
    root.querySelector('[data-in]').addEventListener('click',()=>clerk.openSignIn({}));
    root.querySelector('[data-up]').addEventListener('click',()=>clerk.openSignUp({}));
    /* straight from the quote: open sign-up at once, and start the project as soon as the account exists */
    if(q&&new URLSearchParams(location.search).get('from')==='quote'){
      let seen=false;try{seen=sessionStorage.getItem('mg-su-open')==='1';sessionStorage.setItem('mg-su-open','1');sessionStorage.setItem('mg-autostart','1');}catch{}
      if(!seen)setTimeout(()=>{if(!clerk.user)clerk.openSignUp({});},350);
    }
    return;
  }
  S.user=clerk.user;document.body.classList.remove('pp-hot');
  document.querySelectorAll('.head-login').forEach(a=>{a.textContent='Your portal';});
  try{
    const [projects,admins]=await Promise.all([sb.from('clients').select('*').order('created_at',{ascending:true}),sb.rpc('is_admin')]);
    S.projects=check(projects)||[];S.isAdmin=check(admins)===true;
  }catch(e){root.innerHTML=`<div class="pp-card"><h2 class="h2">We could not load your project.</h2><p>${esc(e.message)}</p></div>`;return;}
  const mine=S.projects.filter(p=>p.owner_id===clerk.user.id);
  /* first visit with no project: tell the team about the new account (the server sends it once) */
  if(!mine.length&&!S.isAdmin){try{if(!sessionStorage.getItem('mg-signup-'+clerk.user.id)){sessionStorage.setItem('mg-signup-'+clerk.user.id,'1');api('/api/portal-notify',{event:'signed_up',quote:savedQuote()}).then(()=>render(),()=>{});}}catch{}}
  const saved=(()=>{try{return localStorage.getItem('mg-portal-current');}catch{return null;}})();
  S.current=S.projects.find(p=>p.id===saved)||mine[0]||(S.isAdmin?S.projects[0]:null)||null;
  /* the team lands on the admin dashboard; clients on their overview */
  let tab=location.hash.slice(1)||(S.isAdmin?'admin':'overview');
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
    if(tab==='documents')return await viewDocuments(el);
    if(tab==='billing')return await viewBilling(el);
    if(tab==='performance')return await viewPerformance(el);
    return await overview(el);
  }catch(e){el.innerHTML=`<div class="pp-card"><p>${esc(e.message||'Something went wrong')}</p></div>`;}
}

function shell(tab){
  const name=clerk.user.firstName||clerk.user.primaryEmailAddress?.emailAddress||'';
  const tabs=[...tabsFor(S.current),...(S.isAdmin?[['admin','Admin']]:[])];
  root.innerHTML=`<div class="pp-top">
      <div><span class="eyebrow">Client portal${S.current&&tab!=='start'?' · '+esc(SERVICES[svc(S.current)].short):''}</span><h2 class="h2">${S.current?esc(S.current.business_name):'Welcome'+(name?', '+esc(name):'')}</h2></div>
      <div class="pp-user">${S.projects.length>1?`<label><span class="sr">Project</span><select data-switch>${S.projects.map(p=>`<option value="${p.id}"${p.id===S.current?.id?' selected':''}>${esc(p.business_name)}${S.isAdmin&&p.owner_id!==clerk.user.id?' ('+esc(p.owner_email||'client')+')':''}</option>`).join('')}</select></label>`:''}<div data-userbtn></div></div>
    </div>
    ${tab==='start'?'':`<nav class="pp-tabs" aria-label="Portal">${tabs.map(([id,t])=>{const n=id==='requests'&&!(S.isAdmin&&S.current?.owner_id!==clerk.user.id)?S.unread:id==='admin'?S.teamUnread:0;
      return `<a href="#${id}" class="${id===tab?'on':''}"${id===tab?' aria-current="page"':''}>${t}${n?` <span class="pp-count" aria-label="${n} new">${n}</span>`:''}</a>`;}).join('')}</nav>`}
    <div data-view></div>`;
  clerk.mountUserButton(root.querySelector('[data-userbtn]'));
  root.querySelector('[data-switch]')?.addEventListener('change',e=>{try{localStorage.setItem('mg-portal-current',(e.target as HTMLSelectElement).value);}catch{};render();});
}

/* ---------- overview: the project dashboard, in sections ---------- */
const num=(v:any)=>{const n=parseFloat(String(v??'').replace(/[^0-9.\-]/g,''));return isNaN(n)?null:n;};
async function overview(el:HTMLElement){
  const p=S.current;const web=svc(p)==='website';const STAGES=stagesFor(p);
  const [brief,invoices,reqs,docs,scores]=await Promise.all([
    sb.from('briefs').select('submitted_at').eq('client_id',p.id).maybeSingle(),
    sb.from('invoices').select('label,amount_gbp,status,due_on,view_url').eq('client_id',p.id).neq('status','draft'),
    sb.from('requests').select('id,title,kind,status,created_at,updated_at').eq('client_id',p.id).order('updated_at',{ascending:false}),
    sb.from('files').select('name,path,created_at').eq('client_id',p.id).eq('kind','deliverable').order('created_at',{ascending:false}).limit(4),
    web||p.live_url?sb.from('scores').select('data,checked_at').eq('client_id',p.id).order('checked_at',{ascending:false}).limit(1):Promise.resolve({data:[]})
  ]);
  const submitted=!!brief.data?.submitted_at;const due=(invoices.data||[]).filter(i=>i.status==='due'||i.status==='overdue');
  const owed=due.reduce((t,i)=>t+Number(i.amount_gbp),0);const allReqs=reqs.data||[];
  const quoted=allReqs.filter(r=>r.status==='quoted').length;const openReqs=allReqs.filter(r=>['new','quoted','approved','in_progress'].includes(r.status)&&r.kind!=='message'&&r.kind!=='approval').length;
  const idx=Math.max(0,STAGES.findIndex(s=>s.id===p.stage));const plan:any[]=Array.isArray(p.plan)?p.plan:[];const kpis:any[]=Array.isArray(p.kpis)?p.kpis:[];
  const nextMs=plan.find(m=>!m.done);const doneMs=plan.filter(m=>m.done).length;
  const lastScore=scores.data?.[0]?score(scores.data[0].data,scores.data[0].data.industry):null;

  /* what needs the client now */
  const next:string[]=[];
  if(S.unread)next.push(`<a class="pp-next" href="#requests"><b>${S.unread} new update${S.unread>1?'s':''} from us</b><span>Messages and replies are in Requests.</span></a>`);
  if(p.stage==='onboarding'&&!submitted)next.push(`<a class="pp-next" href="#onboarding"><b>${web?'Answer your onboarding questions':'Complete your brief'}</b><span>${web?'About 15 minutes. It replaces a kick-off call, and saves as you go.':'About 10 minutes. It means our first meeting is about decisions, not background. Saves as you go.'}</span></a>`);
  if(p.stage==='onboarding'&&submitted)next.push(`<div class="pp-next calm"><b>Thank you, we have your brief.</b><span>${web?'We are designing your pages. You will get an email when the design is ready to review.':'We will be in touch within two working days to agree the plan and the numbers we will measure.'}</span></div>`);
  if(web&&p.stage==='design'&&p.preview_url)next.push(`<div class="pp-next"><b>Your design is ready to review</b><span>Open the preview, then approve it or request changes.</span><div class="actions"><a class="btn sm" href="${esc(p.preview_url)}" target="_blank" rel="noopener"><span>Open preview</span></a><button class="btn sm ghost" data-approve><span>Approve design</span></button><a class="btn sm ghost" href="#requests"><span>Request changes</span></a></div></div>`);
  if(!web&&p.stage==='design'&&p.preview_url)next.push(`<div class="pp-next"><b>Designs are ready to review</b><span>Open the preview and tell us what you think in Requests.</span><div class="actions"><a class="btn sm" href="${esc(p.preview_url)}" target="_blank" rel="noopener"><span>Open preview</span></a><a class="btn sm ghost" href="#requests"><span>Give feedback</span></a></div></div>`);
  if(web&&p.stage==='review')next.push(`<div class="pp-next"><b>Your site is ready for a final check</b><span>Click through every page, then raise any last changes.</span><div class="actions">${p.preview_url?`<a class="btn sm" href="${esc(p.preview_url)}" target="_blank" rel="noopener"><span>Open site</span></a>`:''}<a class="btn sm ghost" href="#requests"><span>Raise a change</span></a></div></div>`);
  if(p.stage==='recommendations'&&(docs.data||[]).length)next.push(`<a class="pp-next" href="#documents"><b>Your recommendations are ready</b><span>Read them in Documents, then raise any questions in Requests.</span></a>`);
  if(p.stage==='live'&&web)next.push(`<a class="pp-next" href="#performance"><b>Your site is live</b><span>${p.live_url?esc(p.live_url)+' · ':''}See how it is performing.</span></a>`);
  if(due.length)next.push(`<a class="pp-next" href="#billing"><b>${due.length} invoice${due.length>1?'s':''} to pay</b><span>${due.map(i=>esc(i.label)+' '+gbp(i.amount_gbp)).join(' · ')}</span></a>`);
  if(quoted)next.push(`<a class="pp-next" href="#requests"><b>${quoted} quote${quoted>1?'s':''} waiting for you</b><span>Approve or decline in Requests.</span></a>`);

  /* results: agreed measures, plus the Webmins Score for websites */
  const kpiRow=(k:any)=>{const b=num(k.baseline),c=num(k.current),t=num(k.target);
    const pct=b!=null&&c!=null&&t!=null&&t!==b?Math.max(0,Math.min(100,Math.round((c-b)/(t-b)*100))):null;
    return `<li class="pp-kpi"><div class="pp-kpi-top"><b>${esc(k.label||'')}</b>${pct!=null?`<em>${pct}% of the way</em>`:''}</div>
      <div class="pp-kpi-vals"><span><small>Start</small>${esc(k.baseline||'—')}</span><span><small>Now</small><strong>${esc(k.current||'—')}</strong></span><span><small>Target</small>${esc(k.target||'—')}</span></div>
      ${pct!=null?`<div class="pl-bar"><i style="width:${pct}%" class="${pct>=70?'good':pct>=35?'mid':'poor'}"></i></div>`:''}</li>`;};
  const results=kpis.length||lastScore?`<ul class="pp-kpis">${lastScore?`<li class="pp-kpi"><div class="pp-kpi-top"><b>Webmins Score</b><em>${esc(lastScore.grade)}</em></div><div class="pp-kpi-vals"><span><small>Latest</small><strong>${lastScore.total}</strong></span><span><small>Checked</small>${date(scores.data[0].checked_at)}</span></div><a class="tlink" href="#performance">Full breakdown</a></li>`:''}${kpis.map(kpiRow).join('')}</ul>`
    :`<p class="pp-muted">${web?'Your Webmins Score appears here after your first check.':'We agree the numbers to track with you at kick-off. They appear here, with where you started and where you are now.'}</p>`;

  const details=web?`<dt>Package</dt><dd>${esc(SME.packages.find(k=>k.id===p.package)?.name||'—')}${p.pages?`, ${p.pages} pages`:''}</dd>
      <dt>Build price</dt><dd>${p.quote_total?gbp(p.quote_total)+' (paid in three stages)':'Confirmed in your quote'}</dd>
      <dt>Hosting</dt><dd>${p.hosting==='us'?`We host it, ${gbp(SME.hosting)} a year`:`You host it (code handover within ${SME.handoverDays} days)`}</dd>
      <dt>Domain</dt><dd>${p.domain_mode==='need'?'We secure: ':''}${esc(p.domain||'—')}</dd>
      <dt>Current website</dt><dd>${p.website?esc(p.website):'—'}</dd>`
    :`<dt>Service</dt><dd>${esc(SERVICES[svc(p)].t)}</dd>
      <dt>The aim</dt><dd>${esc(p.summary||'—')}</dd>
      <dt>Project fee</dt><dd>${p.quote_total?gbp(p.quote_total):'Set out in your proposal'}</dd>
      ${p.website?`<dt>Website</dt><dd>${esc(p.website)}</dd>`:''}`;

  el.innerHTML=`
    <ol class="pp-stages">${STAGES.map((s,i)=>`<li class="${i<idx?'done':i===idx?'now':''}"><span>${i<idx?'✓':i+1}</span><b>${s.t}</b><small>${s.d}</small></li>`).join('')}</ol>
    <div class="pp-tiles">
      <div><small>Stage</small><b>${esc(STAGES[idx]?.t||'')}</b><span>${idx+1} of ${STAGES.length}</span></div>
      <div><small>Next milestone</small><b>${nextMs?esc(nextMs.t):plan.length?'All done':'To be agreed'}</b><span>${nextMs?.due?date(nextMs.due):plan.length?`${doneMs} of ${plan.length} complete`:'At kick-off'}</span></div>
      <a href="#requests"><small>Open requests</small><b>${openReqs}</b><span>${quoted?quoted+' quote'+(quoted>1?'s':'')+' to answer':'View all'}</span></a>
      <a href="#billing"><small>To pay</small><b>${gbp(owed)}</b><span>${due.length?due.length+' invoice'+(due.length>1?'s':''):'Nothing due'}</span></a>
    </div>
    <div class="pp-dash">
      <section class="pp-sec pp-sec-wide"><h3 class="pp-h">What needs you</h3>${next.join('')||'<p class="pp-muted">Nothing needs you right now. We will email you when it does.</p>'}</section>
      <section class="pp-sec"><h3 class="pp-h">Plan and milestones</h3>
        ${plan.length?`<ol class="pp-plan">${plan.map(m=>`<li class="${m.done?'done':m===nextMs?'now':''}"><span aria-hidden="true">${m.done?'✓':''}</span><b>${esc(m.t||'')}</b><small>${m.done?'Done':m.due?date(m.due):''}</small></li>`).join('')}</ol>`:'<p class="pp-muted">Your plan appears here once we have agreed it together.</p>'}</section>
      <section class="pp-sec"><h3 class="pp-h">Results we are measuring</h3>${results}</section>
      <section class="pp-sec"><h3 class="pp-h">Latest activity</h3>
        ${allReqs.length?`<ul class="pp-act">${allReqs.slice(0,4).map(r=>`<li><a href="#requests"><b>${esc(r.title)}</b><small>${r.kind==='message'?'Message from us':esc(String(r.status||'new').replace('_',' '))} · ${date(r.updated_at||r.created_at)}</small></a></li>`).join('')}</ul><a class="tlink" href="#requests">All requests and messages</a>`:'<p class="pp-muted">No messages or requests yet.</p><a class="tlink" href="#requests">Ask us something</a>'}</section>
      <section class="pp-sec"><h3 class="pp-h">Documents</h3>
        ${(docs.data||[]).length?`<ul class="pp-act">${docs.data.map(d=>`<li><a href="#documents"><b>${esc(String(d.name||'').split(': ')[0])}</b><small>${date(d.created_at)}</small></a></li>`).join('')}</ul><a class="tlink" href="#documents">All documents</a>`:'<p class="pp-muted">Reports, presentations and designs we deliver will appear here.</p>'}</section>
      <section class="pp-sec pp-sec-full"><h3 class="pp-h">Your project</h3>
        <dl class="pp-dl">${details}
          ${p.preview_url?`<dt>Preview</dt><dd><a class="ulink" href="${esc(p.preview_url)}" target="_blank" rel="noopener">Open preview</a></dd>`:''}
          ${p.live_url?`<dt>Live</dt><dd><a class="ulink" href="${esc(p.live_url)}" target="_blank" rel="noopener">${esc(p.live_url)}</a></dd>`:''}
        </dl></section>
    </div>`;
  el.querySelector('[data-approve]')?.addEventListener('click',async e=>{
    if(!confirm('Approve the design? We will then build the rest of the site.'))return;
    (e.currentTarget as HTMLButtonElement).disabled=true;
    try{check(await sb.from('requests').insert({client_id:p.id,kind:'approval',title:'Design approved'}));notify('design_approved');toast('Thank you, design approved. We will email you when the build is ready.');}
    catch(err){toast(err.message,true);(e.currentTarget as HTMLButtonElement).disabled=false;}
  });
}

/* ---------- start a project: choose the kind, then the right form ---------- */
function startProject(kind?:string){
  const el=root.querySelector('[data-view]') as HTMLElement;
  const asked=new URLSearchParams(location.search).get('service');
  kind=kind||(savedQuote()?'website':SERVICES[asked||'']?asked:'');
  if(!kind){
    el.innerHTML=`<div class="pp-choose"><h2 class="h3">What would you like to start?</h2><p class="pp-muted">Choose the closest. You can add another project later.</p>
      <div class="pp-svcs">${Object.entries(SERVICES).map(([id,v])=>`<button type="button" class="pp-svc" data-kind="${id}"><b>${esc(v.t)}</b><span>${esc(v.d)}</span><em>${id==='website'?'Fixed price, priced online':'Scoped with you, fixed fee'}</em></button>`).join('')}</div></div>`;
    el.querySelectorAll<HTMLElement>('[data-kind]').forEach(b=>b.addEventListener('click',()=>startProject(b.dataset.kind)));
    return;
  }
  if(kind!=='website')return startConsulting(el,kind);
  const q=(()=>{try{return JSON.parse(localStorage.getItem('mg-quote')||'{}');}catch{return {};}})();
  const pkSel=q.package||'rebuild';
  const fromQ=!!q.package;
  el.innerHTML=`${fromQ?journey(3):''}<div class="pp-start-grid">
  <form class="pp-start${fromQ?' from-quote':''}" novalidate>
    ${fromQ?`<div class="pp-fromq"><h2 class="h3">Last step: check your details and start.</h2><p class="pp-muted">Everything from your quote is filled in. Press <b>Start my project</b> and your onboarding opens.</p></div>`:`<p class="pp-muted">Tell us the basics. Nothing is final: we confirm everything with you before any invoice.</p>`}
    <fieldset class="pp-group"><legend><span>1</span>Your business</legend>
      <div class="row2"><div class="cfield"><label for="ps-name">Business name</label><input id="ps-name" name="business_name" required value="${esc(q.organisation||'')}" placeholder="Larder &amp; Loaf"></div>
        <div class="cfield"><label for="ps-web">Current website <span class="opt">optional</span></label><input id="ps-web" name="website" placeholder="yourbusiness.co.uk" value="${esc(q.website||'')}"></div></div></fieldset>
    ${fromQ?`<div class="pp-qsum"><div><span class="eyebrow">Your choices</span><p>${esc(pkName(q.package))} · ${esc(String(q.pages||''))} pages${(q.addons||[]).length?' · '+esc((q.addons||[]).map(id=>SME.addons.find(a=>a.id===id)?.t||id).join(', ')):''} · ${q.hosting==='self'?'self-hosted':'we host it'}</p></div><button type="button" class="btn ghost sm" data-edit-q><span>Change</span></button></div>`:''}
    <fieldset class="pp-group pp-qpart"><legend><span>2</span>Your package <small>choose one</small></legend>
      <div class="pp-pkgs">${SME.packages.map(k=>`<label class="pp-pkg"><input type="radio" name="package" value="${k.id}"${pkSel===k.id?' checked':''}><span><b>${k.name}</b><em>from ${gbp(k.price)}</em><small>Up to ${k.pages} pages</small></span></label>`).join('')}</div>
      <div class="cfield pp-pages"><label for="ps-pages">How many pages do you think you need?</label><input id="ps-pages" name="pages" type="number" min="1" max="250" value="${esc(q.pages||8)}"><small class="pp-hint">Extra pages beyond your package are ${gbp(SME.extraPage)} each.</small></div></fieldset>
    <fieldset class="pp-group pp-qpart"><legend><span>3</span>Add-ons <small>tick any you want</small></legend>
      <div class="pp-addons">${SME.addons.map(a=>`<label class="pp-addon"><input type="checkbox" name="addons" value="${a.id}"${(q.addons||[]).includes(a.id)?' checked':''}><span><i aria-hidden="true"></i><b>${a.t}</b><small>${a.d}</small><em data-addon-price="${a.id}"></em></span></label>`).join('')}</div></fieldset>
    <fieldset class="pp-group pp-qpart"><legend><span>4</span>Domain and hosting</legend>
      <div class="pp-pkgs two">
        <label class="pp-pkg"><input type="radio" name="domain_mode" value="have"${q.dmode!=='need'?' checked':''}><span><b>I already have a domain</b><small>We point it at your new site</small></span></label>
        <label class="pp-pkg"><input type="radio" name="domain_mode" value="need"${q.dmode==='need'?' checked':''}><span><b>Please secure one for me</b><small>Priced at cost on your first invoice</small></span></label></div>
      <div class="cfield"><label for="ps-dom">Domain name</label><input id="ps-dom" name="domain" placeholder="yourbusiness.co.uk" value="${esc(q.domain||'')}"></div>
      <div class="pp-pkgs two">
        <label class="pp-pkg"><input type="radio" name="hosting" value="us"${q.hosting!=='self'?' checked':''}><span><b>Host it for me</b><em>${gbp(SME.hosting)} a year</em><small>We look after it and keep it fast</small></span></label>
        <label class="pp-pkg"><input type="radio" name="hosting" value="self"${q.hosting==='self'?' checked':''}><span><b>I will host it myself</b><small>Code handed over within ${SME.handoverDays} days</small></span></label></div></fieldset>
  </form>
  <aside class="pp-est" aria-live="polite">
    <span class="eyebrow">Your estimate</span>
    <dl data-est></dl>
    <p class="pp-est-total"><span>Build price</span><b data-est-total>£0</b></p>
    <p class="pp-muted pp-small" data-est-stages></p>
    <button class="btn" type="button" data-start><span>Start my project</span></button>
    <p class="pp-muted pp-small">No payment is taken here. We confirm your quote first, then send the first invoice.</p>
  </aside></div>`;
  const f=el.querySelector('form') as HTMLFormElement;
  const calc=()=>{
    const fd=new FormData(f);const pk=SME.packages.find(k=>k.id===fd.get('package'))||SME.packages[1];
    const pages=Math.max(1,+fd.get('pages')||1),extra=Math.max(0,pages-pk.pages)*SME.extraPage;
    const chosen=[...f.querySelectorAll<HTMLInputElement>('input[name="addons"]:checked')].map(i=>i.value);let add=0;const rows:string[]=[];
    SME.addons.forEach(a=>{const inc=a.in.includes(pk.id);const tag=f.querySelector(`[data-addon-price="${a.id}"]`);if(tag)tag.textContent=inc?'Included':a.price?'+'+gbp(a.price):'Free';
      /* included in this package: shown ticked and locked */
      const box=f.querySelector<HTMLInputElement>(`input[name="addons"][value="${a.id}"]`);
      if(box){if(inc){if(!box.disabled)box.dataset.was=box.checked?'1':'';box.checked=true;box.disabled=true;}else if(box.disabled){box.disabled=false;box.checked=box.dataset.was==='1';}}
      if(chosen.includes(a.id)){if(!inc&&a.price){add+=a.price;rows.push(`<div><dt>${esc(a.t)}</dt><dd>${gbp(a.price)}</dd></div>`);}else rows.push(`<div><dt>${esc(a.t)}</dt><dd>Included</dd></div>`);}});
    const total=pk.price+extra+add;
    (el.querySelector('[data-est]') as HTMLElement).innerHTML=`<div><dt>${pk.name} package</dt><dd>${gbp(pk.price)}</dd></div>${extra?`<div><dt>${pages-pk.pages} extra page${pages-pk.pages>1?'s':''}</dt><dd>${gbp(extra)}</dd></div>`:''}${rows.join('')}${fd.get('hosting')==='us'?`<div class="pp-est-yr"><dt>Hosting, yearly</dt><dd>${gbp(SME.hosting)}</dd></div>`:''}`;
    (el.querySelector('[data-est-total]') as HTMLElement).textContent=gbp(total);
    (el.querySelector('[data-est-stages]') as HTMLElement).textContent=`Paid in three stages of about ${gbp(Math.round(total/3))}: to start, at design approval and on completion.`;
    return {pk,total};
  };
  f.addEventListener('input',calc);f.addEventListener('change',calc);calc();
  /* came straight from the quote and has just signed up: start without asking again */
  let auto=false;try{auto=fromQ&&!!q.organisation&&sessionStorage.getItem('mg-autostart')==='1';sessionStorage.removeItem('mg-autostart');}catch{}
  if(auto){el.querySelector('.pp-start-grid')?.classList.add('pp-auto');setTimeout(()=>el.querySelector<HTMLButtonElement>('[data-start]')?.click(),250);}
  el.querySelector('[data-edit-q]')?.addEventListener('click',ev=>{f.classList.remove('from-quote');(ev.currentTarget as HTMLElement).closest('.pp-qsum')?.remove();f.querySelector<HTMLElement>('.pp-qpart')?.scrollIntoView({behavior:'smooth',block:'start'});});
  el.querySelector('[data-start]').addEventListener('click',async()=>{
    if(!f.checkValidity()){const bad=f.querySelector(':invalid') as HTMLElement;bad?.focus();bad?.scrollIntoView({behavior:'smooth',block:'center'});toast('Please add your business name',true);return;}
    const btn=el.querySelector<HTMLButtonElement>('[data-start]');btn.disabled=true;
    const fd=new FormData(f);const {total}=calc();
    try{
      const row=check(await sb.from('clients').insert({
        service:'website',business_name:String(fd.get('business_name')).trim(),website:String(fd.get('website')||'').trim()||null,package:fd.get('package'),pages:+fd.get('pages')||null,
        addons:fd.getAll('addons'),domain_mode:fd.get('domain_mode'),domain:String(fd.get('domain')||'').trim()||null,hosting:fd.get('hosting'),
        quote_total:total,owner_email:clerk.user.primaryEmailAddress?.emailAddress||null,owner_name:clerk.user.fullName||null
      }).select().single());
      check(await sb.from('briefs').insert({client_id:row.id,answers:{}}));
      S.current=row;try{localStorage.setItem('mg-portal-current',row.id);localStorage.removeItem('mg-quote');}catch{}
      notify('project_started');
      if(row.website)api('/api/portal-rescore',{clientId:row.id}).catch(()=>{});
      location.hash='onboarding';
    }catch(err){toast(err.message,true);btn.disabled=false;el.querySelector('.pp-start-grid')?.classList.remove('pp-auto');}
  });
}

/* commercial strategy or digital: a short start, the detail goes in the brief */
function startConsulting(el:HTMLElement,kind:string){
  const v=SERVICES[kind];
  el.innerHTML=`<div class="pp-start-grid">
  <form class="pp-start" novalidate>
    <p class="pp-muted"><button type="button" class="ulink" data-back>Choose a different kind of project</button></p>
    <fieldset class="pp-group"><legend><span>1</span>Your organisation</legend>
      <div class="row2"><div class="cfield"><label for="pc-name">Organisation name</label><input id="pc-name" name="business_name" required placeholder="Northfield Physio"></div>
        <div class="cfield"><label for="pc-web">Website <span class="opt">optional</span></label><input id="pc-web" name="website" placeholder="yourorganisation.co.uk"></div></div></fieldset>
    <fieldset class="pp-group"><legend><span>2</span>What do you want to achieve?</legend>
      <div class="cfield"><label for="pc-aim">In a sentence or two</label><textarea id="pc-aim" name="summary" rows="3" required placeholder="${kind==='strategy'?'Grow self-pay revenue by 30% and decide whether to open a fifth clinic.':'Let patients book and rebook online, and free up our reception team.'}"></textarea></div></fieldset>
  </form>
  <aside class="pp-est"><span class="eyebrow">${esc(v.t)}</span>
    <ol class="pp-how pp-how-s">${['Start your project','Complete the brief, about 10 minutes','We agree the plan, the fee and the numbers to track','Follow progress, results and documents here'].map((t,i)=>`<li><span>${i+1}</span>${t}</li>`).join('')}</ol>
    <button class="btn" type="button" data-start><span>Start my project</span></button>
    <p class="pp-muted pp-small">Nothing is charged here. We send a short written proposal with a fixed fee before any work starts.</p>
  </aside></div>`;
  const f=el.querySelector('form') as HTMLFormElement;
  el.querySelector('[data-back]').addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.delete('service');history.replaceState(null,'',u);startProject('');});
  el.querySelector('[data-start]').addEventListener('click',async()=>{
    if(!f.checkValidity()){const bad=f.querySelector(':invalid') as HTMLElement;bad?.focus();toast('Please add your organisation name and what you want to achieve',true);return;}
    const btn=el.querySelector<HTMLButtonElement>('[data-start]');btn.disabled=true;const fd=new FormData(f);
    try{
      const row=check(await sb.from('clients').insert({service:kind,business_name:String(fd.get('business_name')).trim(),website:String(fd.get('website')||'').trim()||null,
        summary:String(fd.get('summary')).trim(),owner_email:clerk.user.primaryEmailAddress?.emailAddress||null,owner_name:clerk.user.fullName||null}).select().single());
      check(await sb.from('briefs').insert({client_id:row.id,answers:{}}));
      S.current=row;try{localStorage.setItem('mg-portal-current',row.id);}catch{}
      notify('project_started');location.hash='onboarding';
    }catch(err){toast(err.message,true);btn.disabled=false;}
  });
}
