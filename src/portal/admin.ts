/* =====================================================================
   PORTAL ADMIN — for Minshall Group staff (rows in public.admins).
   All projects; per project: stage and links, brief, files, requests and
   quotes, invoices (raised in your accounting software, tracked here) and
   website re-checks. Every change a client should know about emails them.
   ===================================================================== */
import {sb,S,esc,gbp,date,check,notify,api,toast,upload,fileUrl} from './core';
import {BRIEF,STAGES} from './brief';
import {openRequest} from './views';

export async function viewAdmin(el:HTMLElement,rerender:()=>void){
  const all=S.projects;
  const [briefs,reqs,inv]=await Promise.all([sb.from('briefs').select('client_id,submitted_at'),sb.from('requests').select('client_id,status'),sb.from('invoices').select('client_id,status,amount_gbp')]);
  const sub=new Set((briefs.data||[]).filter(b=>b.submitted_at).map(b=>b.client_id));
  const open=c=>(reqs.data||[]).filter(r=>r.client_id===c&&['new','approved','in_progress'].includes(r.status)).length;
  const owed=c=>(inv.data||[]).filter(i=>i.client_id===c&&(i.status==='due'||i.status==='overdue')).reduce((s,i)=>s+Number(i.amount_gbp),0);
  el.innerHTML=`<div class="pp-card"><h3 class="pp-h">All projects (${all.length})</h3>
    <table class="pp-table"><thead><tr><th>Business</th><th>Client</th><th>Stage</th><th>Brief</th><th>Open requests</th><th>Owed</th><th></th></tr></thead><tbody>
    ${all.map(p=>`<tr class="${p.id===S.current?.id?'sel':''}"><td><b>${esc(p.business_name)}</b><small>${esc(p.package||'')} ${p.quote_total?'· '+gbp(p.quote_total):''}</small></td><td>${esc(p.owner_name||'')}<small>${esc(p.owner_email||'')}</small></td>
      <td><span class="pp-badge st-${p.stage}">${p.stage}</span></td><td>${sub.has(p.id)?'Submitted':'—'}</td><td>${open(p.id)||'—'}</td><td>${owed(p.id)?gbp(owed(p.id)):'—'}</td>
      <td><button class="btn sm ghost" data-pick="${p.id}"><span>Manage</span></button></td></tr>`).join('')}</tbody></table></div>
    <div data-manage></div>`;
  const show=()=>manage(el.querySelector('[data-manage]'),rerender).catch(e=>{(el.querySelector('[data-manage]') as HTMLElement).innerHTML=`<div class="pp-card"><p>${esc(e.message||'Could not load this project')}</p></div>`;});
  el.querySelectorAll<HTMLElement>('[data-pick]').forEach(b=>b.addEventListener('click',()=>{S.current=all.find(p=>p.id===b.dataset.pick);try{localStorage.setItem('mg-portal-current',S.current.id);}catch{};show();}));
  if(S.current)await show();
}

async function manage(box:HTMLElement,rerender){
  const p=S.current;
  const [brief,files,reqs,inv,scores]=await Promise.all([
    sb.from('briefs').select('*').eq('client_id',p.id).maybeSingle(),sb.from('files').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('requests').select('*').eq('client_id',p.id).order('created_at',{ascending:false}),sb.from('invoices').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('scores').select('id,checked_at,label').eq('client_id',p.id).order('checked_at',{ascending:false}).limit(5)]);
  const A=brief.data?.answers||{};
  box.innerHTML=`<div class="pp-admin">
    <form class="pp-card" data-proj><h3 class="pp-h">${esc(p.business_name)}: stage and links</h3>
      <div class="row2"><div class="cfield"><label>Stage</label><select name="stage">${STAGES.map(s=>`<option value="${s.id}"${s.id===p.stage?' selected':''}>${s.t}</option>`).join('')}</select></div>
        <div class="cfield"><label>Build price (£)</label><input name="quote_total" type="number" value="${p.quote_total??''}"></div></div>
      <div class="row2"><div class="cfield"><label>Preview link (for design approval)</label><input name="preview_url" value="${esc(p.preview_url||'')}" placeholder="https://…vercel.app"></div>
        <div class="cfield"><label>Live site</label><input name="live_url" value="${esc(p.live_url||'')}" placeholder="https://theirdomain.co.uk"></div></div>
      <div class="row2"><div class="cfield"><label>Clarity dashboard link</label><input name="clarity_url" value="${esc(p.clarity_url||'')}"></div>
        <div class="cfield"><label>Internal note (client cannot see)</label><input name="admin_note" value="${esc(p.admin_note||'')}"></div></div>
      <label class="pp-check"><input type="checkbox" name="tell" checked> Email the client if the stage changes</label>
      <button class="btn sm" type="submit"><span>Save</span></button></form>

    <div class="pp-card"><h3 class="pp-h">Brief ${brief.data?.submitted_at?`<small>submitted ${date(brief.data.submitted_at)}</small>`:'<small>not submitted yet</small>'}</h3>
      ${BRIEF.map(s=>`<h4 class="pp-h4">${esc(s.t)}</h4><dl class="pp-dl">${s.fields.filter(f=>f.type!=='files').map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(Array.isArray(A[f.id])?A[f.id].join(', '):A[f.id]||'—')}</dd>`).join('')}</dl>`).join('')}
      <h4 class="pp-h4">Files</h4><ul class="pp-files">${(files.data||[]).map(f=>`<li><button type="button" class="ulink" data-file="${esc(f.path)}">${esc(f.name)}</button> <small>${f.kind} · ${Math.round((f.size||0)/1024)} KB</small></li>`).join('')||'<li class="pp-muted">None</li>'}</ul></div>

    <div class="pp-card"><h3 class="pp-h">Requests</h3>
      ${(reqs.data||[]).length?`<ul class="pp-reqs">${reqs.data.map(r=>`<li><details data-req="${r.id}"><summary><span class="pp-badge s-${r.status||'new'}">${(r.status||'new').replace('_',' ')}</span><b>${esc(r.title)}</b><small>${r.kind} · ${date(r.created_at)}${r.quote_gbp!=null?' · '+gbp(r.quote_gbp):''}</small></summary>
        <form class="pp-inline" data-rq="${r.id}"><label>Quote £<input name="quote" type="number" min="0" value="${r.quote_gbp??''}"></label><button class="btn sm ghost" name="act" value="quote"><span>Send quote</span></button>
          <select name="status">${['new','in_progress','done','declined'].map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('')}</select><button class="btn sm ghost" name="act" value="status"><span>Update status</span></button></form>
        <div class="pp-req-body" data-body></div></details></li>`).join('')}</ul>`:'<p class="pp-muted">No requests.</p>'}</div>

    <div class="pp-card"><h3 class="pp-h">Invoices <small>raised in your accounting software, tracked here</small></h3>
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

    <div class="pp-card"><h3 class="pp-h">Website checks</h3>
      <ul class="pp-files">${(scores.data||[]).map(s=>`<li>${date(s.checked_at)} · ${esc(s.label||'')}</li>`).join('')||'<li class="pp-muted">None yet</li>'}</ul>
      <div class="pp-inline"><input data-label placeholder="Label, e.g. Launch" value="${p.stage==='live'?'Launch':'Before'}"><button class="btn sm" data-rescore><span>Check site now</span></button></div></div>
  </div>`;

  const refresh=()=>manage(box,rerender);
  box.querySelector('[data-proj]').addEventListener('submit',async e=>{
    e.preventDefault();const fd=new FormData(e.target as HTMLFormElement);const before=p.stage;
    const upd={stage:fd.get('stage'),quote_total:fd.get('quote_total')?+fd.get('quote_total'):null,preview_url:String(fd.get('preview_url')||'').trim()||null,live_url:String(fd.get('live_url')||'').trim()||null,clarity_url:String(fd.get('clarity_url')||'').trim()||null,admin_note:String(fd.get('admin_note')||'').trim()||null};
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
  box.querySelectorAll<HTMLDetailsElement>('[data-req]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)openRequest(d,(reqs.data||[]).find(r=>r.id===d.dataset.req),refresh,true);}));
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
  box.querySelector('[data-rescore]').addEventListener('click',async e=>{
    const b=e.currentTarget as HTMLButtonElement;b.disabled=true;
    try{await api('/api/portal-rescore',{clientId:p.id,label:(box.querySelector('[data-label]') as HTMLInputElement).value});toast('Checked');refresh();}catch(err){toast(err.message,true);b.disabled=false;}
  });
}
