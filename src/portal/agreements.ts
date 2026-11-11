/* =====================================================================
   PORTAL AGREEMENTS — documents sent for electronic signature.
   Everyone on the project sees each agreement and who has signed; our team
   prepares and sends them. Signing itself happens on /sign?a=<id>.
   ===================================================================== */
import {sb,S,esc,date,check,api,toast,upload,fileUrl,clerk,myEmail} from './core';

const ST:Record<string,string>={draft:'Draft',out:'Out for signature',signed:'Signed',void:'Withdrawn'};

export async function viewAgreements(el:HTMLElement){
  const p=S.current;const me=myEmail();
  const [ag,sg,fl,mm]=await Promise.all([
    sb.from('agreements').select('*').eq('client_id',p.id).order('created_at',{ascending:false}),
    sb.from('agreement_signers').select('agreement_id,email,name,signs_for,signed_at,sort').eq('client_id',p.id).order('sort'),
    sb.from('files').select('*').eq('client_id',p.id).neq('kind','invoice').order('created_at',{ascending:false}),
    sb.from('project_members').select('email,name,role').eq('client_id',p.id)]);
  if(ag.error){el.innerHTML=`<div class="pp-card"><p class="pp-muted">Agreements are not set up yet.</p></div>`;return;}
  const list:any[]=ag.data||[],signers:any[]=sg.data||[],files:any[]=fl.data||[],members:any[]=mm.data||[];
  const pdfs=files.filter(f=>/\.pdf$/i.test(f.path||''));
  const fileOf=(id:string)=>files.find(f=>f.id===id);
  const visible=S.isAdmin?list:list.filter(a=>a.status!=='draft');
  const row=(a:any)=>{const ss=signers.filter(s=>s.agreement_id===a.id),n=ss.filter(s=>s.signed_at).length,mine=ss.find(s=>s.email===me&&!s.signed_at);
    return `<li class="ag-item st-${a.status}" data-ag="${a.id}">
      <div class="ag-top"><span class="pp-badge ag-${a.status}">${ST[a.status]}</span><b>${esc(a.title)}</b>
        <small>${a.status==='signed'?'Signed '+date(a.completed_at):a.sent_at?'Sent '+date(a.sent_at):'Not sent yet'} · ${n} of ${ss.length} signed</small></div>
      ${a.summary?`<p class="pp-small">${esc(a.summary)}</p>`:''}
      <ul class="ag-signers">${ss.map(s=>`<li class="${s.signed_at?'ok':''}">${s.signed_at?'✓ ':''}${esc(s.name)} <small>for ${esc(s.signs_for)}${s.signed_at?', '+date(s.signed_at):''}</small></li>`).join('')}</ul>
      <div class="actions">
        ${a.status!=='draft'?`<a class="btn sm${mine?'':' ghost'}" href="/sign?a=${a.id}"><span>${mine?'Read and sign':a.status==='signed'?'View the signed agreement':'Open'}</span></a>`:''}
        ${a.file_id&&fileOf(a.file_id)?`<button type="button" class="btn sm ghost" data-file="${esc(fileOf(a.file_id).path)}"><span>Document</span></button>`:''}
        ${S.isAdmin&&a.status==='draft'?`<button type="button" class="btn sm" data-send><span>Send for signature</span></button><button type="button" class="btn sm ghost" data-del><span>Delete draft</span></button>`:''}
        ${S.isAdmin&&a.status==='out'?`<button type="button" class="btn sm ghost" data-void><span>Withdraw</span></button>`:''}
      </div></li>`;};

  const cands=[...members.map(m=>({email:m.email,name:m.name||m.email,for:p.business_name,on:m.role==='approver'})),
    ...(S.isAdmin?[{email:me,name:clerk.user.fullName||me,for:'Minshall Group Limited',on:true}]:[])];
  el.innerHTML=`<div class="pp-grid">
    <div class="pp-col"><h3 class="pp-h">Agreements</h3>
      ${visible.length?`<ul class="ag-list">${visible.map(row).join('')}</ul>`:'<p class="pp-muted">No agreements yet. Anything you need to sign will appear here, and we will email you a link.</p>'}
      <p class="pp-muted pp-small">Signed copies are emailed to every signatory and kept in Documents, with a certificate page showing who signed, when and how.</p></div>
    ${S.isAdmin?`<form class="pp-col pp-card wf-form" data-newag novalidate><h3 class="pp-h">Prepare an agreement</h3>
      <div class="cfield"><label for="ag-t">Title</label><input id="ag-t" name="title" required placeholder="Agreement: Project Tracker, Phase 1"></div>
      <div class="cfield"><label for="ag-s">What is being agreed <span class="opt">shown in the email</span></label><textarea id="ag-s" name="summary" rows="2" placeholder="The proposal, terms and payment schedule for Phase 1."></textarea></div>
      <div class="cfield"><label for="ag-f">The document (PDF)</label><select id="ag-f" name="file_id"><option value="">Upload a new PDF below</option>${pdfs.map(f=>`<option value="${f.id}">${esc(f.name||f.path)}</option>`).join('')}</select></div>
      <label class="pp-drop sm"><input type="file" name="up" accept="application/pdf"><span>Upload the PDF to sign</span></label>
      <div class="cfield"><label for="ag-u">Terms on the website <span class="opt">optional</span></label><input id="ag-u" name="terms_url" type="url" placeholder="https://minshallgroup.com/digitalsme/terms"></div>
      <fieldset class="cfield"><legend>Who signs</legend>${cands.length?`<div class="chips-in">${cands.map((c,i)=>`<label class="chk"><input type="checkbox" name="who" value="${i}"${c.on?' checked':''}><span>${esc(c.name)} <small>for ${esc(c.for)}</small></span></label>`).join('')}</div>`:''}
        <small class="pp-hint">Add someone else:</small>
        <div class="row2"><input name="x_name" placeholder="Name" aria-label="Other signer's name"><input name="x_email" type="email" placeholder="Email" aria-label="Other signer's email"></div>
        <input name="x_for" placeholder="Signs on behalf of (organisation)" aria-label="Other signer signs on behalf of"></fieldset>
      <button class="btn sm" type="submit"><span>Save as a draft</span></button>
      <p class="pp-muted pp-small">Check the draft, then press Send for signature. Once sent, the document is fingerprinted and cannot be changed.</p></form>`:''}
  </div>`;

  const again=()=>viewAgreements(el);
  el.querySelectorAll<HTMLElement>('[data-file]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.file);if(u)window.open(u,'_blank','noopener');}));
  el.querySelectorAll<HTMLElement>('[data-ag]').forEach(li=>{const id=li.dataset.ag;
    li.querySelector('[data-send]')?.addEventListener('click',async e=>{const b=e.currentTarget as HTMLButtonElement;const ss=signers.filter(s=>s.agreement_id===id);
      if(!confirm(`Send for signature to ${ss.map(s=>s.name).join(', ')}? The document cannot be changed after this.`))return;
      b.disabled=true;try{const r=await api('/api/portal-notify',{event:'agreement_send',agreementId:id});toast(`Sent to ${r.sent} signator${r.sent===1?'y':'ies'}`);again();}catch(err){toast(err.message,true);b.disabled=false;}});
    li.querySelector('[data-void]')?.addEventListener('click',async()=>{if(!confirm('Withdraw this agreement? Nobody will be able to sign it.'))return;
      try{check(await sb.from('agreements').update({status:'void'}).eq('id',id));toast('Withdrawn');again();}catch(err){toast(err.message,true);}});
    li.querySelector('[data-del]')?.addEventListener('click',async()=>{if(!confirm('Delete this draft?'))return;
      try{check(await sb.from('agreements').delete().eq('id',id));toast('Draft deleted');again();}catch(err){toast(err.message,true);}});
  });
  el.querySelector<HTMLFormElement>('[data-newag]')?.addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target as HTMLFormElement;const fd=new FormData(f);const v=(k:string)=>String(fd.get(k)||'').trim();
    if(!v('title')){toast('Add a title',true);return;}
    const up=(f.querySelector('input[name=up]') as HTMLInputElement).files?.[0];
    if(!v('file_id')&&!up&&!v('terms_url')){toast('Choose or upload the PDF, or give the terms link',true);return;}
    if(up&&!/\.pdf$/i.test(up.name)){toast('The document must be a PDF',true);return;}
    const who=fd.getAll('who').map(i=>cands[+i]);
    if(v('x_email')){if(!v('x_name')||!v('x_for')){toast('Add the other signer’s name and organisation',true);return;}who.push({email:v('x_email').toLowerCase(),name:v('x_name'),for:v('x_for'),on:true});}
    if(!who.length){toast('Choose at least one signer',true);return;}
    const btn=f.querySelector<HTMLButtonElement>('button[type=submit]');btn.disabled=true;
    try{
      let fileId=v('file_id')||null;
      if(up){if(up.size>25*1024*1024)throw new Error('The PDF must be under 25 MB');fileId=(await upload(up,'deliverable',v('title'))).id;}
      const a=check(await sb.from('agreements').insert({client_id:p.id,title:v('title'),summary:v('summary')||null,file_id:fileId,terms_url:v('terms_url')||null}).select().single());
      check(await sb.from('agreement_signers').insert(who.map((w,i)=>({agreement_id:a.id,client_id:p.id,email:w.email,name:w.name,signs_for:w.for,sort:i}))));
      toast('Draft saved. Check it, then press Send for signature.');again();
    }catch(err){toast(err.message,true);btn.disabled=false;}
  });
}

/* for the overview: agreements waiting for this person's signature */
export async function agreementsWaiting(p:any){
  const me=myEmail();
  const [sg,ag]=await Promise.all([sb.from('agreement_signers').select('agreement_id').eq('client_id',p.id).eq('email',me).is('signed_at',null),sb.from('agreements').select('id,title').eq('client_id',p.id).eq('status','out')]);
  if(sg.error||ag.error)return [];
  const ids=new Set((sg.data||[]).map(s=>s.agreement_id));
  return (ag.data||[]).filter(a=>ids.has(a.id));
}
