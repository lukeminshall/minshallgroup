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
      <div><h2 class="h2">Log in to your project.</h2><p class="lede-s">Answer your onboarding questions, follow progress, approve designs, raise change requests, see invoices and track your site’s performance, all in one place. No calls needed.</p>
        <div class="actions"><button class="btn" data-in><span>Log in</span></button><button class="btn ghost" data-up><span>Create an account</span></button></div>
        <p class="pp-muted pp-new">New here? <a class="ulink" href="/digitalsme#quote">Price your website first</a>, it takes two minutes and your choices come with you.</p></div>
      <ol class="pp-how">${['Price your website online','Create your account','Answer the onboarding questions','Approve, request changes and go live'].map((t,i)=>`<li><span>${i+1}</span>${t}</li>`).join('')}</ol>
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
    const [projects,admins]=await Promise.all([sb.from('clients').select('*').order('created_at',{ascending:true}),sb.from('admins').select('user_id').eq('user_id',clerk.user.id)]);
    S.projects=check(projects)||[];S.isAdmin=(check(admins)||[]).length>0;
  }catch(e){root.innerHTML=`<div class="pp-card"><h2 class="h2">We could not load your project.</h2><p>${esc(e.message)}</p></div>`;return;}
  const mine=S.projects.filter(p=>p.owner_id===clerk.user.id);
  /* first visit with no project: tell the team about the new account (the server sends it once) */
  if(!mine.length&&!S.isAdmin){try{if(!sessionStorage.getItem('mg-signup-'+clerk.user.id)){sessionStorage.setItem('mg-signup-'+clerk.user.id,'1');api('/api/portal-notify',{event:'signed_up',quote:savedQuote()}).catch(()=>{});}}catch{}}
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
        business_name:String(fd.get('business_name')).trim(),website:String(fd.get('website')||'').trim()||null,package:fd.get('package'),pages:+fd.get('pages')||null,
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
