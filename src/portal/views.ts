/* =====================================================================
   PORTAL VIEWS — onboarding questionnaire, requests, billing, performance.
   ===================================================================== */
import {unreadForClient,markSeen,sb,S,esc,gbp,date,check,notify,api,toast,upload,fileUrl} from './core';
import {STYLES,IMAGE_DECLARATION,briefFor,svc} from './brief';
import {checkProgress} from '../progress';
import {SME,SCORE} from '../content';
import {score} from '../webmins';

/* ---------- the design brief, summarised from the answers ---------- */
export function fmtAnswer(f,v){
  if(v==null||v===''||(Array.isArray(v)&&!v.length))return '—';
  if(f.type==='scale')return Object.entries(v).map(([k,n])=>{const [a,b]=k.split(' / ');const x=Number(n);return x===3?`${a} or ${b}: either`:`${x<3?a:b}${Math.abs(x-3)===2?' (strongly)':''}`;}).join(' · ');
  if(f.type==='examples')return v.map(r=>`${r.url}${r.like?': '+r.like:''}`).join(' · ');
  return Array.isArray(v)?v.join(', '):String(v);
}
export function briefSummary(A){
  const st=STYLES.find(x=>x.t===A.direction);const sc=A.scales||{};
  const bar=(k,n)=>{const [a,b]=k.split(' / ');return `<div class="db-scale"><span>${esc(a)}</span><i>${[1,2,3,4,5].map(i=>`<b class="${i===Number(n)?'on':''}"></b>`).join('')}</i><span>${esc(b)}</span></div>`;};
  const row=(t,v)=>v&&String(v).trim()?`<div class="db-row"><dt>${t}</dt><dd>${esc(v)}</dd></div>`:'';
  return `<div class="pp-card db"><h3 class="pp-h">Design brief</h3>
    <div class="db-top">${st?`<div class="db-dir"><span class="pp-swatch" style="background:${st.bg};color:${st.ink};font-family:${st.font}" aria-hidden="true"><b>Aa</b><i style="background:${st.accent}"></i><em style="background:${st.ink}"></em><em style="background:${st.ink};width:40%"></em></span><div><small>Direction</small><b>${esc(st.t)}</b><span>${esc(st.d)}</span></div></div>`:'<p class="pp-muted">No style direction chosen yet.</p>'}
      ${(A.words||[]).length?`<div class="db-words"><small>In three words</small><p>${A.words.map(w=>`<span>${esc(w)}</span>`).join('')}</p></div>`:''}</div>
    ${Object.keys(sc).length?`<div class="db-scales">${Object.entries(sc).map(([k,n])=>bar(k,n)).join('')}</div>`:''}
    <dl class="db-dl">${row('Main job',A.action)}${row('Tone',A.tone)}${row('Colours',A.colours)}${row('First five seconds',A.feel)}${row('Photography',A.photos)}${row('Avoid',A.dislikes)}${row('Image permissions',A.imageRights?.agreed?`Confirmed by ${A.imageRights.by||'the client'} on ${date(A.imageRights.at)}`:'Not confirmed yet (no images uploaded)')}</dl>
    ${(A.examples||[]).length?`<h4 class="pp-h4">Sites they like</h4><ul class="db-ex">${A.examples.map(r=>`<li><a class="ulink" href="${/^https?:/.test(r.url)?esc(r.url):'https://'+esc(r.url)}" target="_blank" rel="noopener">${esc(r.url||'')}</a>${r.like?` <span>${esc(r.like)}</span>`:''}</li>`).join('')}</ul>`:''}
  </div>`;
}

/* ---------- onboarding questionnaire ---------- */
export async function viewOnboarding(el:HTMLElement){
  const p=S.current;const BRIEF=briefFor(p);
  const [b,f]=await Promise.all([sb.from('briefs').select('*').eq('client_id',p.id).maybeSingle(),sb.from('files').select('*').eq('client_id',p.id).eq('kind','brief').order('created_at')]);
  let brief=b.data||{client_id:p.id,answers:{},submitted_at:null};
  if(!b.data)check(await sb.from('briefs').insert({client_id:p.id,answers:{}}));
  const files=f.data||[];const A=brief.answers||{};
  let step=Math.max(0,BRIEF.findIndex(s=>s.fields.some(x=>x.required&&!filled(A[x.id]))));if(brief.submitted_at)step=0;
  const locked=brief.submitted_at&&p.stage!=='onboarding';

  function filled(v){return Array.isArray(v)?v.length>0:!!String(v??'').trim();}
  function done(s){return s.fields.filter(x=>x.required).every(x=>filled(A[x.id]));}
  function field(x){
    const v=A[x.id];const id=`f-${x.id}`;const req=x.required?' <span class="req">required</span>':'';
    const hint=x.hint?`<small class="pp-hint">${esc(x.hint)}</small>`:'';
    if(x.type==='textarea')return `<div class="cfield"><label for="${id}">${esc(x.label)}${req}</label>${hint}<textarea id="${id}" name="${x.id}" rows="4" placeholder="${esc(x.placeholder||'')}"${locked?' disabled':''}>${esc(v||'')}</textarea></div>`;
    if(x.type==='choice')return `<fieldset class="cfield"><legend>${esc(x.label)}${req}</legend>${hint}<div class="chips-in">${x.options.map(o=>`<label class="chk"><input type="radio" name="${x.id}" value="${esc(o)}"${v===o?' checked':''}${locked?' disabled':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
    if(x.type==='multi')return `<fieldset class="cfield"${x.max?` data-max="${x.max}"`:''}><legend>${esc(x.label)}${req}</legend>${hint}${x.max?`<small class="pp-hint">Choose up to ${x.max}.</small>`:''}<div class="chips-in">${x.options.map(o=>`<label class="chk"><input type="checkbox" name="${x.id}" value="${esc(o)}"${(v||[]).includes(o)?' checked':''}${locked?' disabled':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
    if(x.type==='visual')return `<fieldset class="cfield"><legend>${esc(x.label)}${req}</legend>${hint}<div class="pp-styles">${STYLES.map(st=>`<label class="pp-style"><input type="radio" name="${x.id}" value="${esc(st.t)}"${v===st.t?' checked':''}${locked?' disabled':''}>
        <span class="pp-swatch" style="background:${st.bg};color:${st.ink};font-family:${st.font}" aria-hidden="true"><b>Aa</b><i style="background:${st.accent}"></i><em style="background:${st.ink}"></em><em style="background:${st.ink};width:40%"></em></span>
        <span class="pp-st-t"><b>${esc(st.t)}</b><small>${esc(st.d)}</small></span></label>`).join('')}</div></fieldset>`;
    if(x.type==='scale'){const val=v||{};return `<fieldset class="cfield"><legend>${esc(x.label)}</legend>${hint}<div class="pp-scales">${x.pairs.map(([a,b2],i)=>`<div class="pp-scale"><span>${esc(a)}</span><input type="range" min="1" max="5" step="1" name="${x.id}" data-pair="${esc(a)} / ${esc(b2)}" value="${val[a+' / '+b2]||3}" aria-label="${esc(a)} or ${esc(b2)}"${locked?' disabled':''}><span>${esc(b2)}</span></div>`).join('')}</div></fieldset>`;}
    if(x.type==='examples'){const rows=[...(v||[]),{url:'',like:''},{url:'',like:''},{url:'',like:''}].slice(0,3);
      return `<fieldset class="cfield"><legend>${esc(x.label)}</legend>${hint}<div class="pp-examples">${rows.map((r,i)=>`<div class="pp-ex"><span class="pp-ex-n">${i+1}</span><label class="sr" for="${id}-u${i}">Website ${i+1}</label><input id="${id}-u${i}" data-ex="url" data-i="${i}" value="${esc(r.url||'')}" placeholder="example.co.uk"${locked?' disabled':''}><label class="sr" for="${id}-l${i}">What you like</label><input id="${id}-l${i}" data-ex="like" data-i="${i}" value="${esc(r.like||'')}" placeholder="What you like about it"${locked?' disabled':''}></div>`).join('')}</div></fieldset>`;}
    if(x.type==='files'&&!x.inspire&&!A.imageRights?.agreed&&!locked){
      /* uploads that may go on the website stay locked until the client confirms they have permission */
      return `<div class="cfield"><label>${esc(x.label)}</label>${hint}<div class="pp-declare"><p><b>Before you upload</b>${esc(IMAGE_DECLARATION)}</p>
        <label class="pp-declare-ok"><input type="checkbox" data-declare> <span>I confirm this, on behalf of ${esc(p.business_name||'my business')}</span></label></div>
        <div class="pp-drop locked" aria-disabled="true"><span>Tick the box above to upload</span></div></div>`;}
    if(x.type==='files'){const mine=files.filter(fl=>(fl.name||'').startsWith(x.label+': '));
      const ok=!x.inspire&&A.imageRights?.agreed?`<p class="pp-declared">✓ Image permissions confirmed${A.imageRights.by?' by '+esc(A.imageRights.by):''} on ${date(A.imageRights.at)}</p>`:'';
      return `<div class="cfield"><label>${esc(x.label)}</label>${hint}${ok}${locked?'':`<label class="pp-drop"><input type="file" multiple data-upload="${x.id}" data-tag="${esc(x.label)}"><span>Choose files or drag them here</span></label>`}<ul class="pp-files">${mine.map(fl=>`<li>${esc(fl.name.replace(x.label+': ',''))} <small>${Math.round((fl.size||0)/1024)} KB</small></li>`).join('')}</ul></div>`;}
    return `<div class="cfield"><label for="${id}">${esc(x.label)}${req}</label>${hint}<input id="${id}" name="${x.id}" value="${esc(v||'')}" placeholder="${esc(x.placeholder||'')}"${locked?' disabled':''}></div>`;
  }
  function paint(){
    const s=BRIEF[step];
    el.innerHTML=`${brief.submitted_at&&A.direction&&svc(p)==='website'?briefSummary(A):''}<div class="pp-brief">
      <ol class="pp-steps">${BRIEF.map((x,i)=>`<li><button type="button" data-step="${i}" class="${i===step?'on':''} ${done(x)?'ok':''}"><span>${done(x)?'✓':i+1}</span>${esc(x.t)}</button></li>`).join('')}</ol>
      <form class="pp-card" novalidate>
        ${brief.submitted_at?`<p class="pp-banner">Submitted ${date(brief.submitted_at)}. ${locked?'Your project has moved on, so answers are locked; raise a request for any changes.':'You can still make changes until the next stage starts.'}</p>`:''}
        <h3 class="pp-h">${step+1}. ${esc(s.t)}</h3><p class="pp-muted">${esc(s.intro)}</p>
        ${s.fields.map(field).join('')}
        <div class="pp-nav">${step>0?'<button type="button" class="btn ghost sm" data-prev><span>Back</span></button>':'<span></span>'}
          <span class="pp-saved" data-saved>Saves automatically</span>
          ${step<BRIEF.length-1?'<button type="button" class="btn sm" data-next><span>Next</span></button>':locked?'':`<button type="button" class="btn sm" data-submit><span>${brief.submitted_at?'Update brief':'Submit brief'}</span></button>`}</div>
      </form></div>`;
    const form=el.querySelector('form');
    let t=0;
    form.addEventListener('input',()=>{collect(form);clearTimeout(t);el.querySelector('[data-saved]').textContent='Saving…';t=window.setTimeout(save,700);});
    form.addEventListener('change',e=>{
      const fs=(e.target as HTMLElement).closest<HTMLElement>('[data-max]');
      if(fs){const max=+fs.dataset.max,boxes=[...fs.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];const n=boxes.filter(b=>b.checked).length;boxes.forEach(b=>{if(!b.checked)b.disabled=n>=max;});}
      collect(form);clearTimeout(t);t=window.setTimeout(save,300);});
    form.querySelectorAll<HTMLElement>('[data-max]').forEach(fs=>{const max=+fs.dataset.max,boxes=[...fs.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];if(boxes.filter(b=>b.checked).length>=max)boxes.forEach(b=>{if(!b.checked)b.disabled=true;});});
    el.querySelectorAll<HTMLElement>('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=+b.dataset.step;paint();scrollUp();}));
    el.querySelector('[data-prev]')?.addEventListener('click',()=>{step--;paint();scrollUp();});
    el.querySelector('[data-next]')?.addEventListener('click',()=>{step++;paint();scrollUp();});
    el.querySelector('[data-submit]')?.addEventListener('click',submit);
    el.querySelectorAll<HTMLInputElement>('[data-declare]').forEach(cb=>cb.addEventListener('change',async()=>{
      if(!cb.checked)return;
      A.imageRights={agreed:true,by:S.user?.fullName||S.user?.primaryEmailAddress?.emailAddress||'',at:new Date().toISOString(),text:IMAGE_DECLARATION};
      await save();toast('Thank you. You can upload your images now.');paint();
    }));
    el.querySelectorAll<HTMLInputElement>('[data-upload]').forEach(inp=>inp.addEventListener('change',async()=>{
      const list=[...inp.files];if(!list.length)return;toast(`Uploading ${list.length} file${list.length>1?'s':''}…`);
      try{for(const fl of list){if(fl.size>25*1024*1024){toast(`${fl.name} is over 25 MB`,true);continue;}files.push(await upload(fl,'brief',inp.dataset.tag));}toast('Uploaded');paint();}catch(e){toast(e.message,true);}
    }));
  }
  function collect(form){
    for(const x of BRIEF[step].fields){
      if(x.type==='files')continue;
      if(x.type==='scale'){const o={};form.querySelectorAll(`input[name="${x.id}"]`).forEach((i:any)=>{o[i.dataset.pair]=+i.value;});A[x.id]=o;continue;}
      if(x.type==='examples'){A[x.id]=[0,1,2].map(i=>({url:(form.querySelector(`[data-ex="url"][data-i="${i}"]`) as any)?.value.trim()||'',like:(form.querySelector(`[data-ex="like"][data-i="${i}"]`) as any)?.value.trim()||''})).filter(r=>r.url||r.like);continue;}
      if(x.type==='visual'){A[x.id]=(form.querySelector(`input[name="${x.id}"]:checked`) as any)?.value||'';continue;}
      if(x.type==='multi')A[x.id]=[...form.querySelectorAll(`input[name="${x.id}"]:checked`)].map((i:any)=>i.value);
      else if(x.type==='choice')A[x.id]=(form.querySelector(`input[name="${x.id}"]:checked`) as any)?.value||'';
      else A[x.id]=(form.querySelector(`[name="${x.id}"]`) as any)?.value||'';
    }
  }
  async function save(){
    try{check(await sb.from('briefs').update({answers:A,updated_at:new Date().toISOString()}).eq('client_id',p.id));const s=el.querySelector('[data-saved]');if(s)s.textContent='Saved';
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((b,i)=>{b.classList.toggle('ok',done(BRIEF[i]));});}
    catch(e){toast('Could not save: '+e.message,true);}
  }
  async function submit(){
    await save();
    const miss=BRIEF.findIndex(s=>!done(s));
    if(miss>=0){step=miss;paint();toast(`Please complete the required questions in “${BRIEF[miss].t}”.`,true);return;}
    try{const first=!brief.submitted_at;brief=check(await sb.from('briefs').update({submitted_at:new Date().toISOString()}).eq('client_id',p.id).select().single());
      if(first)notify('brief_submitted');toast('Thank you, your brief is with us.');paint();}
    catch(e){toast(e.message,true);}
  }
  const scrollUp=()=>el.scrollIntoView({behavior:'smooth',block:'start'});
  paint();
}

/* ---------- requests: changes, questions, approvals ---------- */
const RS={message:'Message from us',new:'Received',quoted:'Quote ready',approved:'Approved',in_progress:'In progress',done:'Done',declined:'Declined'};
export async function viewRequests(el:HTMLElement){
  const p=S.current;
  const reqs=check(await sb.from('requests').select('*').eq('client_id',p.id).order('created_at',{ascending:false}))||[];
  el.innerHTML=`<div class="pp-grid">
    <div class="pp-col"><h3 class="pp-h">Your requests</h3>
      ${reqs.length?`<ul class="pp-reqs">${reqs.map(r=>`<li><details data-req="${r.id}"><summary><span class="pp-badge s-${r.kind==='message'?'message':r.status||'new'}">${r.kind==='message'?RS.message:RS[r.status]||RS.new}</span>${unreadForClient(r)?'<span class="pp-new">New</span>':''}<b>${esc(r.title)}</b><small>${r.kind} · ${date(r.created_at)}${r.quote_gbp!=null?' · '+gbp(r.quote_gbp):''}</small></summary><div class="pp-req-body" data-body></div></details></li>`).join('')}</ul>`:'<p class="pp-muted">No requests yet.</p>'}
    </div>
    <form class="pp-col pp-card" novalidate>
      <h3 class="pp-h">New request</h3>
      <fieldset class="cfield"><legend>What is it?</legend><div class="chips-in"><label class="chk"><input type="radio" name="kind" value="change" checked><span>${svc(p)==='website'?'A change to the site':'A change or new piece of work'}</span></label><label class="chk"><input type="radio" name="kind" value="question"><span>A question</span></label></div></fieldset>
      <div class="cfield"><label for="rq-t">Short title</label><input id="rq-t" name="title" required maxlength="120" placeholder="${svc(p)==='website'?'Update opening hours on the contact page':'Add a competitor to the market analysis'}"></div>
      <div class="cfield"><label for="rq-b">Details</label><textarea id="rq-b" name="body" rows="5" placeholder="${svc(p)==='website'?'What should change, on which page, and any wording to use.':'What you need, why, and by when.'}"></textarea></div>
      <label class="pp-drop"><input type="file" name="files" multiple><span>Attach screenshots or files (optional)</span></label>
      <button class="btn" type="submit"><span>Send request</span></button>
      <p class="pp-muted pp-small">${svc(p)==='website'?'Small changes during the build are included. After launch we quote each change first, and you approve it here before we start.':'Anything inside the agreed scope is included. If something is new work, we quote it first and you approve it here before we start.'}</p>
    </form></div>`;
  const f=el.querySelector('form') as HTMLFormElement;
  f.addEventListener('submit',async e=>{
    e.preventDefault();if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f),btn=f.querySelector('button');btn.disabled=true;
    try{const r=check(await sb.from('requests').insert({client_id:p.id,kind:fd.get('kind'),title:String(fd.get('title')).trim(),body:String(fd.get('body')||'').trim()}).select().single());
      for(const fl of (f.querySelector('input[type=file]') as HTMLInputElement).files)await upload(fl,'request',r.title);
      notify('request_created',{requestId:r.id});toast('Request sent');viewRequests(el);}
    catch(err){toast(err.message,true);btn.disabled=false;}
  });
  el.querySelectorAll<HTMLDetailsElement>('[data-req]').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;const r=reqs.find(x=>x.id===d.dataset.req);
    if(unreadForClient(r)){markSeen(r,false);d.querySelector('.pp-new')?.remove();S.unread=Math.max(0,S.unread-1);const c=document.querySelector('.pp-tabs a[href="#requests"] .pp-count');if(c){if(S.unread)c.textContent=String(S.unread);else c.remove();}}
    openRequest(d,r,()=>viewRequests(el));}));
}
export async function openRequest(d:HTMLElement,r,refresh,admin=false){
  const box=d.querySelector('[data-body]') as HTMLElement;box.innerHTML='<p class="pp-muted">Loading…</p>';
  const [msgs,files]=await Promise.all([sb.from('request_messages').select('*').eq('request_id',r.id).order('created_at'),sb.from('files').select('*').eq('client_id',r.client_id).eq('kind','request').like('name',`${r.title.replace(/[%_]/g,'')}:%`)]);
  box.innerHTML=`${r.body?`<p class="pp-pre">${esc(r.body)}</p>`:''}
    ${(files.data||[]).length?`<ul class="pp-files">${files.data.map(fl=>`<li><button type="button" class="ulink" data-file="${esc(fl.path)}">${esc(fl.name.split(': ').slice(1).join(': '))}</button></li>`).join('')}</ul>`:''}
    ${r.status==='quoted'&&!admin?`<div class="pp-quote"><b>Quote: ${gbp(r.quote_gbp)}</b><span>Approve to go ahead, or decline.</span><div class="actions"><button class="btn sm" data-ans="approved"><span>Approve ${gbp(r.quote_gbp)}</span></button><button class="btn sm ghost" data-ans="declined"><span>Decline</span></button></div></div>`:''}
    <ul class="pp-thread">${(msgs.data||[]).map(m=>`<li class="${m.from_admin?'them':'me'}"><small>${m.from_admin?'Minshall Group':'You'} · ${date(m.created_at)}</small><p>${esc(m.body)}</p></li>`).join('')}</ul>
    <form class="pp-reply"><label class="sr" for="m-${r.id}">Reply</label><textarea id="m-${r.id}" rows="2" placeholder="Add a message"></textarea><button class="btn sm" type="submit"><span>Send</span></button></form>`;
  box.querySelectorAll<HTMLElement>('[data-file]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.file);if(u)window.open(u,'_blank','noopener');}));
  box.querySelectorAll<HTMLElement>('[data-ans]').forEach(b=>b.addEventListener('click',async()=>{
    try{check(await sb.from('requests').update({status:b.dataset.ans}).eq('id',r.id));notify('quote_response',{requestId:r.id});toast(b.dataset.ans==='approved'?'Approved. We will get started.':'Declined.');refresh();}catch(e){toast(e.message,true);}
  }));
  box.querySelector('form').addEventListener('submit',async e=>{
    e.preventDefault();const ta=box.querySelector('textarea');const body=ta.value.trim();if(!body)return;
    try{check(await sb.from('request_messages').insert({request_id:r.id,body}));notify(admin?'team_message':'client_message',{requestId:r.id});openRequest(d,r,refresh,admin);}catch(err){toast(err.message,true);}
  });
}

/* ---------- billing ---------- */
const IS={due:'Due',paid:'Paid',overdue:'Overdue',void:'Cancelled',draft:'Draft'};
export async function viewBilling(el:HTMLElement){
  const p=S.current;
  const inv=check(await sb.from('invoices').select('*').eq('client_id',p.id).neq('status','draft').order('issued_on',{ascending:true}))||[];
  const paid=inv.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.amount_gbp),0);
  const owed=inv.filter(i=>i.status==='due'||i.status==='overdue').reduce((s,i)=>s+Number(i.amount_gbp),0);
  el.innerHTML=`<div class="pp-sum"><div><small>Paid</small><b>${gbp(paid)}</b></div><div><small>To pay</small><b>${gbp(owed)}</b></div><div><small>${svc(p)==='website'?'Build price':'Project fee'}</small><b>${p.quote_total?gbp(p.quote_total):'—'}</b></div></div>
    ${inv.length?`<table class="pp-table"><thead><tr><th>Invoice</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${inv.map(i=>`<tr>
      <td><b>${esc(i.label)}</b>${i.number?`<small>${esc(i.number)}</small>`:''}</td><td>${date(i.issued_on)}</td><td>${date(i.due_on)}</td><td>${gbp(i.amount_gbp)}</td>
      <td><span class="pp-badge i-${i.status}">${IS[i.status]}</span></td>
      <td class="pp-act">${i.view_url&&i.status!=='paid'?`<a class="btn sm" href="${esc(i.view_url)}" target="_blank" rel="noopener"><span>View and pay</span></a>`:i.view_url?`<a class="ulink" href="${esc(i.view_url)}" target="_blank" rel="noopener">View</a>`:''}${i.pdf_path?` <button class="ulink" data-pdf="${esc(i.pdf_path)}">PDF</button>`:''}</td></tr>`).join('')}</tbody></table>`:`<div class="pp-card"><p class="pp-muted">${svc(p)==='website'?'No invoices yet. Your first invoice (one third of the build price) appears here once we confirm your quote.':'No invoices yet. They appear here as they are issued, in line with your proposal.'}</p></div>`}
    ${svc(p)==='website'?`<div class="pp-card pp-terms"><h3 class="pp-h">How billing works</h3><ul class="ticks">
      ${SME.stages.map((s,i)=>`<li><b>${['One third','One third','One third'][i]} ${s.t.toLowerCase()}:</b> ${esc(s.d)}</li>`).join('')}
      <li><b>Hosting:</b> ${p.hosting==='us'?`${gbp(SME.hosting)} a year, invoiced separately.`:`you host the site yourself; the code is handed over within ${SME.handoverDays} days of delivery.`}</li>
      ${p.domain_mode==='need'?'<li><b>Domain:</b> the first year is added to your first invoice; renewals are billed at cost.</li>':''}
      <li>Invoices are due within seven days. <a class="ulink" href="/digitalsme/terms" target="_blank" rel="noopener">Full terms</a></li></ul></div>`:`<div class="pp-card pp-terms"><h3 class="pp-h">How billing works</h3><ul class="ticks">
      <li>Invoices follow the payment schedule in your proposal.</li>
      <li>Any new work outside the agreed scope is quoted first, and you approve it in Requests before we start.</li>
      <li>Invoices are due within 14 days unless your proposal says otherwise. Questions about an invoice? Raise them in Requests.</li></ul></div>`}`;
  el.querySelectorAll<HTMLElement>('[data-pdf]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.pdf);if(u)window.open(u,'_blank','noopener');}));
}

/* ---------- performance ---------- */
export async function viewPerformance(el:HTMLElement){
  const p=S.current;
  const rows=check(await sb.from('scores').select('*').eq('client_id',p.id).order('checked_at',{ascending:true}))||[];
  const pts=rows.map(r=>({r,s:score(r.data,r.data.industry)}));
  const last=pts[pts.length-1],first=pts[0];
  const ring=(v,label)=>{const c=2*Math.PI*42,cls=v>=85?'good':v>=70?'okay':v>=50?'mid':'poor';return `<div class="pp-ring ${cls}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="sc-bg"/><circle cx="50" cy="50" r="42" class="sc-fg" style="stroke-dasharray:${c};stroke-dashoffset:${c*(1-v/100)}"/></svg><b>${v}</b><span>${label}</span></div>`;};
  if(!last){el.innerHTML=`<div class="pp-card"><h3 class="pp-h">No checks yet</h3><p class="pp-muted">${p.website||p.live_url?'Run your first Webmins check to set your starting point.':'Add your website address to your project and we will check it.'}</p>${p.website||p.live_url?'<button class="btn" data-run><span>Run my first check</span></button>':''}</div>`;}
  else{
    const g=last.r.data.scores;const delta=pts.length>1?last.s.total-first.s.total:0;
    el.innerHTML=`<div class="pp-perf">
      <div class="pp-card pp-perf-main">${ring(last.s.total,last.s.grade)}<div><span class="eyebrow">Webmins Score</span><h3 class="pp-h">${esc(last.r.url||'')}</h3><p class="pp-muted">Checked ${date(last.r.checked_at)}${pts.length>1?` · <b class="${delta>=0?'up':'down'}">${delta>=0?'+':''}${delta}</b> since ${esc(first.r.label||'first check')} (${first.s.total})`:''}</p>
        <div class="actions"><button class="btn sm" data-run><span>Re-check now</span></button>${p.clarity_url?`<a class="btn sm ghost" href="${esc(p.clarity_url)}" target="_blank" rel="noopener"><span>Visitor analytics</span></a>`:''}</div></div></div>
      <div class="pp-card"><h3 class="pp-h">Breakdown</h3><div class="pillars">${[...SCORE.pillars.map(x=>({t:x.t,v:last.s.p[x.id]})),{t:'Sector fit',v:last.s.fit}].map(x=>`<div class="pl"><div class="pl-top"><b>${x.t}</b><em>${x.v}</em></div><div class="pl-bar"><i style="width:${x.v}%" class="${x.v>=70?'good':x.v>=50?'mid':'poor'}"></i></div></div>`).join('')}</div></div>
      ${g?`<div class="pp-card"><h3 class="pp-h">Google’s view (mobile)</h3><div class="pp-g">${[['Speed',g.performance],['SEO',g.seo],['Accessibility',g.accessibility]].map(([t,v])=>`<div><b>${v??'–'}</b><span>${t}</span></div>`).join('')}</div></div>`:''}
      <div class="pp-card"><h3 class="pp-h">History</h3><table class="pp-table"><thead><tr><th>Date</th><th>Check</th><th>Webmins</th><th>Speed</th><th>SEO</th></tr></thead><tbody>${pts.slice().reverse().map(x=>`<tr><td>${date(x.r.checked_at)}</td><td>${esc(x.r.label||'')}</td><td><b>${x.s.total}</b></td><td>${x.r.data.scores?.performance??'–'}</td><td>${x.r.data.scores?.seo??'–'}</td></tr>`).join('')}</tbody></table></div>
      <div class="pp-card"><h3 class="pp-h">What to improve next</h3><ol class="fixes">${(last.r.data.suggestions||[]).slice(0,5).map(s=>`<li>${esc(s)}</li>`).join('')||'<li>Nothing urgent. Keep content fresh and reviews coming in.</li>'}</ol><a class="tlink" href="#requests">Ask us to fix something</a></div>
    </div>`;
  }
  el.querySelector('[data-run]')?.addEventListener('click',async()=>{
    const box=document.createElement('div');box.className='pp-card pp-checking';el.prepend(box);
    el.querySelectorAll<HTMLButtonElement>('[data-run]').forEach(b=>b.disabled=true);box.scrollIntoView({behavior:'smooth',block:'center'});
    const prog=checkProgress(box,{estimate:30000,site:(p.live_url||p.website||'').replace(/^https?:\/\//,'')});
    try{await api('/api/portal-rescore',{clientId:p.id});await prog.done();toast('Check complete');viewPerformance(el);}
    catch(err){prog.stop();box.remove();toast(err.message,true);el.querySelectorAll<HTMLButtonElement>('[data-run]').forEach(b=>b.disabled=false);}
  });
}

/* ---------- documents: what we deliver, and what the client has shared ---------- */
export async function viewDocuments(el:HTMLElement){
  const p=S.current;
  const files=check(await sb.from('files').select('*').eq('client_id',p.id).order('created_at',{ascending:false}))||[];
  const ours=files.filter(f=>f.kind==='deliverable'),theirs=files.filter(f=>f.kind!=='deliverable'&&f.kind!=='invoice');
  const row=f=>`<li><button type="button" class="ulink" data-file="${esc(f.path)}">${esc(f.kind==='deliverable'?String(f.name||'').split(': ')[0]:String(f.name||'').replace(/^[^:]+: /,''))}</button><small>${date(f.created_at)} · ${Math.max(1,Math.round((f.size||0)/1024))} KB</small></li>`;
  el.innerHTML=`<div class="pp-grid">
    <div class="pp-col pp-card"><h3 class="pp-h">From Minshall Group</h3><p class="pp-muted pp-small">Reports, presentations, models and designs we deliver. Each one is emailed to you when it is added.</p>
      ${ours.length?`<ul class="pp-docs">${ours.map(row).join('')}</ul>`:'<p class="pp-muted">Nothing delivered yet. Your first document appears here once it is ready.</p>'}</div>
    <div class="pp-col pp-card"><h3 class="pp-h">Shared by you</h3>
      ${theirs.length?`<ul class="pp-docs">${theirs.map(row).join('')}</ul>`:'<p class="pp-muted">Nothing shared yet.</p>'}
      <label class="pp-drop"><input type="file" multiple data-share><span>Share a file with us</span></label>
      <p class="pp-muted pp-small">Up to 25 MB each. Please do not share passwords or patient-identifiable data here.</p></div>
  </div>`;
  el.querySelectorAll<HTMLElement>('[data-file]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.file);if(u)window.open(u,'_blank','noopener');}));
  el.querySelector<HTMLInputElement>('[data-share]').addEventListener('change',async e=>{
    const list=[...(e.target as HTMLInputElement).files];if(!list.length)return;toast(`Uploading ${list.length} file${list.length>1?'s':''}…`);
    try{for(const fl of list){if(fl.size>25*1024*1024){toast(`${fl.name} is over 25 MB`,true);continue;}await upload(fl,'other','Shared');}toast('Shared');viewDocuments(el);}catch(err){toast(err.message,true);}
  });
}
