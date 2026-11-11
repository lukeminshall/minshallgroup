/* =====================================================================
   PORTAL WORKFLOW — the client's team, the phases of the build, tasks
   allocated to people, and sign-off points where several people review a
   document and one final approver signs it off.
   What each person can do is enforced by the database (migration 005);
   this screen only shows the buttons that will work for them.
   ===================================================================== */
import {sb,S,esc,gbp,date,check,notify,api,toast,upload,fileUrl,clerk,myEmail} from './core';

const ROLES:Record<string,[string,string]>={
  approver:['Final approver','Gives the last sign-off at each stage, after the reviewers'],
  reviewer:['Reviewer','Reads, comments, and approves or asks for changes'],
  contributor:['Contributor','Is given tasks and updates them'],
  viewer:['Viewer','Follows progress and reads the documents']};
const TS:Record<string,string>={todo:'To do',doing:'In progress',review:'Ready for review',done:'Done'};
const SS:Record<string,string>={open:'In review',changes:'Changes requested',ready:'Ready for final sign-off',approved:'Signed off'};
const PS:Record<string,string>={upcoming:'Upcoming',active:'In progress',done:'Complete'};
const TEMPLATE=[
  ['Discovery and specification','Agree what the tool must do, then sign off the specification.'],
  ['Design','Screens and user journeys, reviewed and signed off.'],
  ['Build','Built in usable slices, shown to you as we go.'],
  ['Testing and acceptance','Your team tests it against the specification and signs it off.'],
  ['Launch and handover','Go live, training and handover.']];

let openSo='';   /* keep the sign-off someone is working on open across refreshes */

export async function viewWorkflow(el:HTMLElement){
  const p=S.current;const uid=clerk.user.id;
  const me=myEmail();
  const manage=!S.viewAs&&(S.isAdmin||p.owner_id===uid);
  const [m,ph,tk,so,rv,cm,fl]=await Promise.all([
    sb.from('project_members').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('phases').select('*').eq('client_id',p.id).order('sort').order('created_at'),
    sb.from('tasks').select('*').eq('client_id',p.id).order('sort').order('created_at'),
    sb.from('signoffs').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('signoff_reviews').select('*').eq('client_id',p.id),
    sb.from('comments').select('*').eq('client_id',p.id).order('created_at'),
    sb.from('files').select('*').eq('client_id',p.id).neq('kind','invoice').order('created_at',{ascending:false})]);
  const members:any[]=check(m)||[],phases:any[]=check(ph)||[],tasks:any[]=check(tk)||[],signoffs:any[]=check(so)||[],reviews:any[]=check(rv)||[],comments:any[]=check(cm)||[],files:any[]=check(fl)||[];
  const person=(e:string)=>members.find(x=>x.email===e);
  const who=(e:string)=>e?esc(person(e)?.name||e):'Unallocated';
  const approver=members.find(x=>x.role==='approver');
  const mine=members.find(x=>x.email===me);
  const revsOf=(s:any)=>reviews.filter(r=>r.signoff_id===s.id);
  const status=(s:any)=>s.status==='open'&&!revsOf(s).length?'ready':s.status;

  /* ---------- what needs this person ---------- */
  const needs:string[]=[];
  for(const s of signoffs){
    if(s.status==='approved')continue;
    const r=revsOf(s).find(x=>x.email===me);
    if(r&&!r.decision)needs.push(`<a class="pp-next" href="#so-${s.id}" data-goto="${s.id}"><b>Review: ${esc(s.title)}</b><span>Approve it or ask for changes${s.due_on?' by '+date(s.due_on):''}.</span></a>`);
    if(s.approver_email===me&&status(s)==='ready')needs.push(`<a class="pp-next" href="#so-${s.id}" data-goto="${s.id}"><b>Final sign-off: ${esc(s.title)}</b><span>${revsOf(s).length?'Every reviewer has approved it.':'It is ready for you.'}</span></a>`);
  }
  for(const t of tasks)if(t.assignee_email===me&&t.status!=='done')needs.push(`<div class="pp-next calm"><b>Your task: ${esc(t.title)}</b><span>${TS[t.status]}${t.due_on?' · due '+date(t.due_on):''}</span></div>`);

  /* ---------- one sign-off ---------- */
  const thread=(list:any[])=>`<ul class="pp-thread">${list.map(c=>`<li class="${c.author_id===uid?'me':'them'}"><small>${c.from_admin?'Minshall Group':esc(c.author_name||'Team')} · ${date(c.created_at)}</small><p>${esc(c.body)}</p></li>`).join('')}</ul>`;
  const soCard=(s:any)=>{
    const rs=revsOf(s),st=status(s),done=rs.filter(r=>r.decision==='approved').length;
    const docs=files.filter(f=>(s.file_ids||[]).includes(f.id));
    const myRev=rs.find(r=>r.email===me),isAp=s.approver_email===me,waiting=rs.filter(r=>r.decision!=='approved').length;
    const can=s.status!=='approved'&&(myRev||isAp);
    const add=members.filter(x=>x.role!=='viewer'&&x.email!==s.approver_email&&!rs.some(r=>r.email===x.email));
    return `<details class="wf-so st-${st}" id="so-${s.id}" data-so="${s.id}"${openSo===s.id?' open':''}><summary>
        <span class="pp-badge so-${st}">${SS[st]}</span><b>${esc(s.title)}</b>
        <small>Version ${s.version} · ${rs.length?`${done} of ${rs.length} reviewers approved`:'No reviewers'} · final sign-off: ${s.approver_email?who(s.approver_email):'not set'}${s.due_on?' · by '+date(s.due_on):''}</small></summary>
      <div class="wf-so-body">
        ${s.detail?`<p class="wf-detail">${esc(s.detail)}</p>`:''}
        <h4 class="pp-h4">Documents</h4>
        ${docs.length?`<ul class="pp-docs">${docs.map(f=>`<li><button type="button" class="ulink" data-file="${esc(f.path)}">${esc(f.name||'Document')}</button><small>${date(f.created_at)}</small></li>`).join('')}</ul>`:'<p class="pp-muted pp-small">No documents attached.</p>'}
        <h4 class="pp-h4">Sign-off</h4>
        <ol class="wf-chain">
          ${rs.map(r=>`<li class="d-${r.decision||'wait'}"><span aria-hidden="true">${r.decision==='approved'?'✓':r.decision==='changes'?'!':''}</span><b>${who(r.email)}</b><small>Reviewer · ${r.decision==='approved'?'Approved '+date(r.decided_at):r.decision==='changes'?'Asked for changes '+date(r.decided_at):'Waiting'}</small>
            ${manage&&s.status!=='approved'?`<button type="button" class="wf-x" data-unrev="${esc(r.email)}" aria-label="Remove ${who(r.email)}">×</button>`:''}</li>`).join('')}
          <li class="final d-${s.status==='approved'?'approved':'wait'}"><span aria-hidden="true">${s.status==='approved'?'✓':''}</span><b>${s.approver_email?who(s.approver_email):'No final approver yet'}</b><small>Final approver · ${s.status==='approved'?'Signed off '+date(s.decided_at):waiting?`After ${waiting} more review${waiting>1?'s':''}`:'Waiting'}</small></li>
        </ol>
        ${s.invoice_amount!=null?`<p class="wf-inv"><b>On sign-off:</b> an invoice for ${esc(s.invoice_label||'project costs')}, ${gbp(s.invoice_amount)} + VAT, ${s.invoice_auto_send?'is raised and emailed from Xero':'is drafted in Xero for us to check'}.
          ${s.invoice_state?`<span class="pp-badge iv-${s.invoice_state}">${{raising:'Raising now',raised:'Invoice raised',manual:'Invoice to raise by hand',failed:'Invoice failed'}[s.invoice_state]}</span>`:''}
          ${S.isAdmin&&s.invoice_error?`<small class="wf-err">${esc(s.invoice_error)}</small>`:''}
          ${S.isAdmin&&s.status==='approved'&&(s.invoice_state==='failed'||!s.invoice_state)?` <button type="button" class="btn sm ghost" data-reinv><span>Try the invoice again</span></button>`:''}</p>`:''}
        ${can?`<form class="wf-decide" data-decide>
            <label for="dn-${s.id}">${isAp?'Your final sign-off':'Your review'}</label>
            <textarea id="dn-${s.id}" name="note" rows="2" placeholder="${isAp?'Optional note for the record':'Comments, or what needs to change'}"></textarea>
            <div class="actions">${isAp&&waiting?`<p class="pp-muted pp-small">You can sign off once ${waiting} more reviewer${waiting>1?'s have':' has'} approved.</p>`:`<button class="btn sm" name="d" value="approved"><span>${isAp?'Sign off':'Approve'}</span></button>`}
              <button class="btn sm ghost" name="d" value="changes"><span>Request changes</span></button></div></form>`:''}
        <h4 class="pp-h4">Comments</h4>
        ${thread(comments.filter(c=>c.signoff_id===s.id))}
        <form class="pp-reply" data-comment><label class="sr" for="c-${s.id}">Comment</label><textarea id="c-${s.id}" rows="2" placeholder="Add a comment for the team"></textarea><button class="btn sm" type="submit"><span>Post</span></button></form>
        ${manage&&s.status!=='approved'?`<div class="wf-admin">
          ${add.length?`<div class="pp-inline"><label class="sr" for="ar-${s.id}">Add a reviewer</label><select id="ar-${s.id}" data-addrev><option value="">Add a reviewer…</option>${add.map(x=>`<option value="${esc(x.email)}">${esc(x.name||x.email)}</option>`).join('')}</select></div>`:''}
          <label class="pp-drop sm"><input type="file" data-newver><span>Upload a new version and send it back out for review</span></label>
          ${s.status==='changes'?'<button type="button" class="btn sm ghost" data-reopen><span>Send back out without a new file</span></button>':''}
        </div>`:''}
      </div></details>`;};

  /* ---------- tasks ---------- */
  const taskRow=(t:any)=>{const editable=manage||t.assignee_email===me;
    return `<li class="wf-task t-${t.status}" data-task="${t.id}"><div><b>${esc(t.title)}</b><small>${who(t.assignee_email)}${t.due_on?' · due '+date(t.due_on):''}</small>${t.detail?`<p class="pp-small">${esc(t.detail)}</p>`:''}</div>
      ${editable?`<label class="sr" for="ts-${t.id}">Status</label><select id="ts-${t.id}" data-tstatus>${Object.entries(TS).map(([k,v])=>`<option value="${k}"${k===t.status?' selected':''}>${v}</option>`).join('')}</select>`:`<span class="pp-badge t-${t.status}">${TS[t.status]}</span>`}
      ${manage?`<select data-tassign aria-label="Allocate to"><option value="">Unallocated</option>${members.filter(x=>x.role!=='viewer').map(x=>`<option value="${esc(x.email)}"${x.email===t.assignee_email?' selected':''}>${esc(x.name||x.email)}</option>`).join('')}</select><button type="button" class="wf-x" data-tdel aria-label="Delete task">×</button>`:''}</li>`;};

  const phaseBlock=(ph:any|null,i:number)=>{
    const ts=tasks.filter(t=>(t.phase_id||null)===(ph?.id||null)),ss=signoffs.filter(s=>(s.phase_id||null)===(ph?.id||null));
    if(!ph&&!ts.length&&!ss.length)return '';
    return `<section class="wf-phase p-${ph?.status||'none'}"${ph?` data-phase="${ph.id}"`:''}>
      <header><span class="wf-n">${ph?(ph.status==='done'?'✓':i+1):'·'}</span><div><h3 class="pp-h">${ph?esc(ph.title):'Not in a phase'}</h3>${ph?`<small>${PS[ph.status]}${ph.due_on?' · due '+date(ph.due_on):''}</small>`:''}</div>
        ${ph&&manage?`<label class="sr" for="ps-${ph.id}">Phase status</label><select id="ps-${ph.id}" data-pstatus>${Object.entries(PS).map(([k,v])=>`<option value="${k}"${k===ph.status?' selected':''}>${v}</option>`).join('')}</select><button type="button" class="wf-x" data-pdel aria-label="Delete phase">×</button>`:''}</header>
      ${ph?.detail?`<p class="pp-muted">${esc(ph.detail)}</p>`:''}
      <div class="wf-cols"><div><h4 class="pp-h4">Sign-off points</h4>${ss.length?ss.map(soCard).join(''):'<p class="pp-muted pp-small">No sign-off points yet.</p>'}</div>
        <div><h4 class="pp-h4">Tasks</h4>${ts.length?`<ul class="wf-tasks">${ts.map(taskRow).join('')}</ul>`:'<p class="pp-muted pp-small">No tasks yet.</p>'}</div></div></section>`;};

  /* ---------- the page ---------- */
  const reviewerOpts=members.filter(x=>x.role!=='viewer'&&x.role!=='approver');
  const phaseOpts=`<option value="">No phase</option>${phases.map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join('')}`;
  el.innerHTML=`
    ${needs.length?`<section class="pp-sec pp-sec-wide wf-needs"><h3 class="pp-h">Waiting for you</h3>${needs.join('')}</section>`:''}
    <div class="wf-layout">
      <div class="wf-main">
        ${phases.length?phases.map((x,i)=>phaseBlock(x,i)).join(''):`<div class="pp-card"><h3 class="pp-h">The plan appears here</h3><p class="pp-muted">${manage?'Add the phases of the build, then the tasks and sign-off points in each one.':'We are setting up the phases, tasks and sign-off points for this project.'}</p>${manage?'<button type="button" class="btn sm" data-template><span>Add the standard build phases</span></button>':''}</div>`}
        ${phaseBlock(null,0)}
      </div>
      <aside class="wf-side">
        <div class="pp-card"><h3 class="pp-h">Project team</h3>
          ${members.length?`<ul class="wf-team">${members.map(x=>`<li><div><b>${esc(x.name||x.email)}</b><small>${esc(x.job_title?x.job_title+' · ':'')}${esc(x.email)}</small></div>
            ${manage?`<label class="sr" for="mr-${x.id}">Role</label><select id="mr-${x.id}" data-mrole="${x.id}">${Object.entries(ROLES).map(([k,[t]])=>`<option value="${k}"${k===x.role?' selected':''}>${t}</option>`).join('')}</select><button type="button" class="wf-x" data-mdel="${x.id}" aria-label="Remove ${esc(x.name||x.email)}">×</button>`:`<span class="pp-badge r-${x.role}">${ROLES[x.role][0]}</span>`}</li>`).join('')}</ul>`:'<p class="pp-muted pp-small">No one added yet.</p>'}
          ${mine?`<p class="pp-muted pp-small">You are ${ROLES[mine.role][0].toLowerCase()}: ${ROLES[mine.role][1].toLowerCase()}.</p>`:''}
          ${manage?`<form class="wf-form" data-addmember><h4 class="pp-h4">Add someone</h4>
            <div class="cfield"><label for="am-n">Name</label><input id="am-n" name="name" required></div>
            <div class="cfield"><label for="am-e">Email</label><input id="am-e" name="email" type="email" required></div>
            <div class="cfield"><label for="am-j">Job title <span class="opt">optional</span></label><input id="am-j" name="job_title"></div>
            <div class="cfield"><label for="am-r">Role</label><select id="am-r" name="role">${Object.entries(ROLES).map(([k,[t,d]])=>`<option value="${k}"${k==='reviewer'?' selected':''}${k==='approver'&&approver?' disabled':''}>${t}: ${d}</option>`).join('')}</select></div>
            <label class="pp-check"><input type="checkbox" name="invite" checked> Email them an invitation</label>
            <button class="btn sm" type="submit"><span>Add to the team</span></button></form>`:''}
        </div>
        ${manage?`<form class="pp-card wf-form" data-billing><h3 class="pp-h">Invoices go to</h3><p class="pp-muted pp-small">Used when a sign-off raises an invoice in Xero.</p>
          <div class="cfield"><label for="bl-n">Organisation or person</label><input id="bl-n" name="billing_name" value="${esc(p.billing_name||'')}" placeholder="${esc(p.business_name)}"></div>
          <div class="cfield"><label for="bl-e">Billing email</label><input id="bl-e" name="billing_email" type="email" value="${esc(p.billing_email||'')}" placeholder="${esc(p.owner_email||'accounts@')}"></div>
          <button class="btn sm ghost" type="submit"><span>Save</span></button></form>`:''}
      </aside>
    </div>
    ${manage?`<details class="pp-card wf-build"${phases.length?'':' open'}><summary><h3 class="pp-h">Add to the plan</h3></summary>
      <div class="wf-forms">
        <form class="wf-form" data-addphase><h4 class="pp-h4">A phase</h4>
          <div class="cfield"><label for="ap-t">Title</label><input id="ap-t" name="title" required placeholder="Discovery and specification"></div>
          <div class="cfield"><label for="ap-d">What happens in it <span class="opt">optional</span></label><input id="ap-d" name="detail"></div>
          <div class="cfield"><label for="ap-due">Due <span class="opt">optional</span></label><input id="ap-due" name="due_on" type="date"></div>
          <button class="btn sm" type="submit"><span>Add phase</span></button>${phases.length?'':' <button type="button" class="btn sm ghost" data-template><span>Or add the standard five</span></button>'}</form>
        <form class="wf-form" data-bulkphase><h4 class="pp-h4">Several phases at once</h4>
          <div class="cfield"><label for="bp-t">One per line: name | date | what is delivered</label><textarea id="bp-t" name="lines" rows="6" placeholder="G0 Agreement | 2026-11-13 | Agreement signed&#10;G1 Scope sign-off | 2026-12-04 | Specification and designs signed off"></textarea><small class="pp-hint">Dates as 2026-11-13 or 13 Nov 2026. Leave the date out if it is not fixed yet.</small></div>
          <button class="btn sm" type="submit"><span>Add these phases</span></button></form>
        <form class="wf-form" data-addtask><h4 class="pp-h4">A task</h4>
          <div class="cfield"><label for="at-t">Task</label><input id="at-t" name="title" required placeholder="Write the referral user stories"></div>
          <div class="cfield"><label for="at-d">Detail <span class="opt">optional</span></label><textarea id="at-d" name="detail" rows="2"></textarea></div>
          <div class="row2"><div class="cfield"><label for="at-p">Phase</label><select id="at-p" name="phase_id">${phaseOpts}</select></div>
            <div class="cfield"><label for="at-a">Allocate to</label><select id="at-a" name="assignee_email"><option value="">Unallocated</option>${members.filter(x=>x.role!=='viewer').map(x=>`<option value="${esc(x.email)}">${esc(x.name||x.email)}</option>`).join('')}<option value="__team">Minshall Group</option></select></div></div>
          <div class="cfield"><label for="at-due">Due <span class="opt">optional</span></label><input id="at-due" name="due_on" type="date"></div>
          <button class="btn sm" type="submit"><span>Add task</span></button></form>
        <form class="wf-form wf-form-wide" data-addso><h4 class="pp-h4">A sign-off point</h4>
          <div class="row2"><div class="cfield"><label for="as-t">What is being signed off</label><input id="as-t" name="title" required placeholder="Specification, version 1"></div>
            <div class="cfield"><label for="as-p">Phase</label><select id="as-p" name="phase_id">${phaseOpts}</select></div></div>
          <div class="cfield"><label for="as-d">What to check <span class="opt">optional</span></label><textarea id="as-d" name="detail" rows="2" placeholder="Please check the scope, the user journeys in section 3 and the integration list."></textarea></div>
          <fieldset class="cfield"><legend>Reviewers</legend>${reviewerOpts.length?`<div class="chips-in">${reviewerOpts.map(x=>`<label class="chk"><input type="checkbox" name="rev" value="${esc(x.email)}" checked><span>${esc(x.name||x.email)}</span></label>`).join('')}</div>`:'<p class="pp-muted pp-small">Add reviewers to the team first, or the final approver signs off alone.</p>'}
            <small class="pp-hint">Final sign-off: ${approver?esc(approver.name||approver.email):'add a final approver to the team'}.</small></fieldset>
          <fieldset class="cfield"><legend>Documents</legend>
            ${files.length?`<div class="wf-pick">${files.slice(0,30).map(f=>`<label class="chk"><input type="checkbox" name="doc" value="${f.id}"><span>${esc(f.name||'File')}</span></label>`).join('')}</div>`:''}
            <label class="pp-drop sm"><input type="file" name="up" multiple><span>Upload documents for this sign-off</span></label></fieldset>
          <div class="cfield"><label for="as-due">Sign off by <span class="opt">optional</span></label><input id="as-due" name="due_on" type="date"></div>
          ${S.isAdmin?`<fieldset class="cfield wf-invset"><legend>Invoice on sign-off <span class="opt">optional</span></legend>
            <div class="row2"><div class="cfield"><label for="as-il">Invoice line</label><input id="as-il" name="invoice_label" placeholder="Project costs: build phase"></div>
              <div class="cfield"><label for="as-ia">Amount before VAT (£)</label><input id="as-ia" name="invoice_amount" type="number" min="0" step="0.01"></div></div>
            <label class="pp-check"><input type="checkbox" name="invoice_auto_send" checked> Email it from Xero straight away (untick to leave a draft in Xero to check)</label></fieldset>`:''}
          <button class="btn sm" type="submit"><span>Send for sign-off</span></button></form>
      </div></details>`:''}`;

  /* ---------- wiring ---------- */
  const again=()=>viewWorkflow(el);
  const run=async(fn:()=>Promise<any>,ok?:string)=>{try{await fn();if(ok)toast(ok);again();}catch(e){toast(e.message||'Something went wrong',true);}};
  el.querySelectorAll<HTMLElement>('[data-goto]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openSo=a.dataset.goto;const d=el.querySelector<HTMLDetailsElement>(`#so-${a.dataset.goto}`);if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});}}));
  el.querySelectorAll<HTMLElement>('[data-file]').forEach(b=>b.addEventListener('click',async()=>{const u=await fileUrl(b.dataset.file);if(u)window.open(u,'_blank','noopener');}));
  el.querySelectorAll<HTMLDetailsElement>('[data-so]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)openSo=d.dataset.so;else if(openSo===d.dataset.so)openSo='';}));

  /* sign-off actions */
  el.querySelectorAll<HTMLElement>('[data-so]').forEach(d=>{
    const id=d.dataset.so,s=signoffs.find(x=>x.id===id);
    d.querySelector<HTMLFormElement>('[data-decide]')?.addEventListener('submit',async e=>{
      e.preventDefault();const f=e.target as HTMLFormElement;const dec=((e as SubmitEvent).submitter as HTMLButtonElement)?.value;const note=(f.note as any).value.trim();
      if(dec==='changes'&&!note){toast('Please say what needs to change',true);(f.note as any).focus();return;}
      if(dec==='approved'&&s.approver_email===me&&!confirm(`Give the final sign-off on “${s.title}”?${s.invoice_amount!=null?`\n\nThis raises the invoice for ${s.invoice_label||'project costs'} (${gbp(s.invoice_amount)} + VAT).`:''}`))return;
      f.querySelectorAll('button').forEach(b=>b.disabled=true);
      try{
        const st=check(await sb.rpc('decide_signoff',{p_signoff:id,p_decision:dec,p_note:note||null}));
        if(st==='approved'){const r=await api('/api/portal-notify',{event:'signoff_decided',clientId:p.id,signoffId:id}).catch(()=>({}));
          toast(r.invoice==='sent'?'Signed off. The invoice has been emailed from Xero.':r.invoice==='failed'?'Signed off. The invoice did not go through; we have been told and will sort it.':'Signed off. Thank you.');}
        else{notify('signoff_decided',{signoffId:id});toast(dec==='approved'?(st==='ready'?'Approved. It now goes to the final approver.':'Approved. Thank you.'):'Sent back with your changes.');}
        again();
      }catch(err){toast(err.message,true);f.querySelectorAll('button').forEach(b=>b.disabled=false);}
    });
    d.querySelector<HTMLFormElement>('[data-comment]')?.addEventListener('submit',e=>{e.preventDefault();const ta=(e.target as HTMLFormElement).querySelector('textarea');const body=ta.value.trim();if(!body)return;
      run(async()=>{check(await sb.from('comments').insert({client_id:p.id,signoff_id:id,body}));notify('signoff_comment',{signoffId:id});});});
    d.querySelector<HTMLSelectElement>('[data-addrev]')?.addEventListener('change',e=>{const v=(e.target as HTMLSelectElement).value;if(!v)return;
      run(async()=>{check(await sb.from('signoff_reviews').insert({signoff_id:id,client_id:p.id,email:v,name:person(v)?.name||null}));notify('signoff_reopened',{signoffId:id});},'Reviewer added and emailed');});
    d.querySelectorAll<HTMLElement>('[data-unrev]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Remove this reviewer from the sign-off?'))return;
      run(async()=>{check(await sb.from('signoff_reviews').delete().eq('signoff_id',id).eq('email',b.dataset.unrev));},'Reviewer removed');}));
    d.querySelector<HTMLInputElement>('[data-newver]')?.addEventListener('change',e=>{const fl=(e.target as HTMLInputElement).files?.[0];if(!fl)return;
      if(fl.size>25*1024*1024){toast('Files must be under 25 MB',true);return;}
      run(async()=>{const row=await upload(fl,S.isAdmin?'deliverable':'other',`${s.title}, version ${s.version+1}`);
        check(await sb.from('signoffs').update({file_ids:[...(s.file_ids||[]),row.id]}).eq('id',id));
        check(await sb.rpc('reopen_signoff',{p_signoff:id}));notify('signoff_reopened',{signoffId:id});},'New version sent out for review');});
    d.querySelector('[data-reopen]')?.addEventListener('click',()=>run(async()=>{check(await sb.rpc('reopen_signoff',{p_signoff:id}));notify('signoff_reopened',{signoffId:id});},'Sent back out for review'));
    d.querySelector('[data-reinv]')?.addEventListener('click',()=>run(async()=>{const r=await api('/api/portal-notify',{event:'signoff_invoice_retry',clientId:p.id,signoffId:id});toast(`Invoice: ${r.invoice||'nothing to do'}`);}));
  });

  /* tasks */
  el.querySelectorAll<HTMLElement>('[data-task]').forEach(li=>{const id=li.dataset.task;
    li.querySelector<HTMLSelectElement>('[data-tstatus]')?.addEventListener('change',e=>run(async()=>{check(await sb.from('tasks').update({status:(e.target as HTMLSelectElement).value}).eq('id',id));notify('task_updated',{taskId:id});},'Task updated'));
    li.querySelector<HTMLSelectElement>('[data-tassign]')?.addEventListener('change',e=>run(async()=>{const v=(e.target as HTMLSelectElement).value||null;check(await sb.from('tasks').update({assignee_email:v}).eq('id',id));if(v)notify('task_assigned',{taskId:id});},'Task allocated'));
    li.querySelector('[data-tdel]')?.addEventListener('click',()=>{if(confirm('Delete this task?'))run(async()=>{check(await sb.from('tasks').delete().eq('id',id));},'Task deleted');});
  });

  /* phases */
  el.querySelectorAll<HTMLElement>('[data-phase]').forEach(sec=>{const id=sec.dataset.phase;
    sec.querySelector<HTMLSelectElement>('[data-pstatus]')?.addEventListener('change',e=>run(async()=>{check(await sb.from('phases').update({status:(e.target as HTMLSelectElement).value}).eq('id',id));},'Phase updated'));
    sec.querySelector('[data-pdel]')?.addEventListener('click',()=>{if(confirm('Delete this phase? Its tasks and sign-offs stay, under “Not in a phase”.'))run(async()=>{check(await sb.from('phases').delete().eq('id',id));},'Phase deleted');});
  });
  el.querySelectorAll('[data-template]').forEach(b=>b.addEventListener('click',()=>run(async()=>{
    const base=phases.length;check(await sb.from('phases').insert(TEMPLATE.map(([title,detail],i)=>({client_id:p.id,sort:base+i+1,title,detail,status:i||base?'upcoming':'active'}))));},'Five phases added. Rename or remove any of them.')));

  /* team */
  el.querySelector<HTMLFormElement>('[data-addmember]')?.addEventListener('submit',e=>{e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f);const email=String(fd.get('email')).trim().toLowerCase();
    run(async()=>{check(await sb.from('project_members').insert({client_id:p.id,email,name:String(fd.get('name')).trim(),job_title:String(fd.get('job_title')||'').trim()||null,role:fd.get('role')}));
      if(fd.get('invite'))await api('/api/portal-notify',{event:'member_added',clientId:p.id,email});},fd.get('invite')?'Added and invited':'Added');});
  el.querySelectorAll<HTMLSelectElement>('[data-mrole]').forEach(s=>s.addEventListener('change',()=>run(async()=>{check(await sb.from('project_members').update({role:s.value}).eq('id',s.dataset.mrole));},'Role updated')));
  el.querySelectorAll<HTMLElement>('[data-mdel]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Remove this person from the project? They will no longer see it.'))run(async()=>{check(await sb.from('project_members').delete().eq('id',b.dataset.mdel));},'Removed from the project');}));
  el.querySelector<HTMLFormElement>('[data-billing]')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target as HTMLFormElement);
    run(async()=>{S.current=check(await sb.from('clients').update({billing_name:String(fd.get('billing_name')||'').trim()||null,billing_email:String(fd.get('billing_email')||'').trim().toLowerCase()||null}).eq('id',p.id).select().single());},'Saved');});

  /* building the plan */
  const val=(fd:FormData,k:string)=>String(fd.get(k)||'').trim()||null;
  el.querySelector<HTMLFormElement>('[data-addphase]')?.addEventListener('submit',e=>{e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity())return;const fd=new FormData(f);
    run(async()=>{check(await sb.from('phases').insert({client_id:p.id,sort:phases.length+1,title:val(fd,'title'),detail:val(fd,'detail'),due_on:val(fd,'due_on'),status:phases.length?'upcoming':'active'}));},'Phase added');});
  el.querySelector<HTMLFormElement>('[data-bulkphase]')?.addEventListener('submit',e=>{e.preventDefault();const t=String(new FormData(e.target as HTMLFormElement).get('lines')||'');
    const iso=(s:string)=>{s=s.trim();if(!s)return null;if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const d=new Date(s.replace(/^(mon|tue|wed|thu|fri|sat|sun)\w*\s+/i,''));return isNaN(+d)?null:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
    const rows=t.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(r=>r[0]);
    if(!rows.length){toast('Paste at least one line',true);return;}
    run(async()=>{check(await sb.from('phases').insert(rows.map(([title,d,detail],i)=>{const due=iso(d||'');return {client_id:p.id,sort:phases.length+i+1,title,due_on:due,detail:[detail,d&&!due?d:''].filter(Boolean).join(' · ')||null,status:!phases.length&&!i?'active':'upcoming'};})));},`${rows.length} phases added`);});
  el.querySelector<HTMLFormElement>('[data-addtask]')?.addEventListener('submit',e=>{e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity())return;const fd=new FormData(f);
    const a=val(fd,'assignee_email');const assignee=a==='__team'?null:a;
    run(async()=>{const t=check(await sb.from('tasks').insert({client_id:p.id,phase_id:val(fd,'phase_id'),title:val(fd,'title'),detail:(a==='__team'?'With Minshall Group. ':'')+(val(fd,'detail')||'')||null,assignee_email:assignee,due_on:val(fd,'due_on')}).select().single());
      if(assignee)notify('task_assigned',{taskId:t.id});},assignee?'Task added and allocated':'Task added');});
  el.querySelector<HTMLFormElement>('[data-addso]')?.addEventListener('submit',e=>{e.preventDefault();const f=e.target as HTMLFormElement;if(!f.checkValidity()){(f.querySelector(':invalid') as HTMLElement)?.focus();return;}
    const fd=new FormData(f);const btn=f.querySelector<HTMLButtonElement>('button[type=submit]');
    if(!approver&&!fd.getAll('rev').length){toast('Add a final approver or a reviewer to the team first',true);return;}
    const amount=fd.get('invoice_amount')?Number(fd.get('invoice_amount')):null;
    if(amount!=null&&!val(fd,'invoice_label')){toast('Add the invoice line, or clear the amount',true);return;}
    btn.disabled=true;
    run(async()=>{
      const ids=fd.getAll('doc').map(String);
      for(const fl of (f.querySelector('input[name=up]') as HTMLInputElement).files){if(fl.size>25*1024*1024){toast(`${fl.name} is over 25 MB`,true);continue;}ids.push((await upload(fl,S.isAdmin?'deliverable':'other',String(fd.get('title')).trim())).id);}
      const s=check(await sb.from('signoffs').insert({client_id:p.id,phase_id:val(fd,'phase_id'),title:val(fd,'title'),detail:val(fd,'detail'),due_on:val(fd,'due_on'),approver_email:approver?.email||null,file_ids:ids,
        ...(S.isAdmin&&amount!=null?{invoice_label:val(fd,'invoice_label'),invoice_amount:amount,invoice_auto_send:!!fd.get('invoice_auto_send')}:{})}).select().single());
      const revs=fd.getAll('rev').map(String);
      if(revs.length)check(await sb.from('signoff_reviews').insert(revs.map(r=>({signoff_id:s.id,client_id:p.id,email:r,name:person(r)?.name||null}))));
      openSo=s.id;notify('signoff_opened',{signoffId:s.id});
    },'Sent for sign-off. Everyone involved has been emailed.');});
}

/* for the overview: what is waiting for this person, and the phases if the project has them */
export async function workflowSummary(p:any){
  const me=myEmail();
  const [ph,so,rv,tk]=await Promise.all([
    sb.from('phases').select('title,status,due_on').eq('client_id',p.id).order('sort'),
    sb.from('signoffs').select('id,title,status,approver_email').eq('client_id',p.id).neq('status','approved'),
    sb.from('signoff_reviews').select('signoff_id,email,decision').eq('client_id',p.id),
    sb.from('tasks').select('title,status').eq('client_id',p.id).eq('assignee_email',me).neq('status','done')]);
  if(ph.error)return {phases:[],waiting:0,tasks:0};   /* the workflow tables are not set up yet */
  const revs=rv.data||[];
  const waiting=(so.data||[]).filter(s=>revs.some(r=>r.signoff_id===s.id&&r.email===me&&!r.decision)||(s.approver_email===me&&(s.status==='ready'||(s.status==='open'&&!revs.some(r=>r.signoff_id===s.id))))).length;
  return {phases:ph.data||[],waiting,tasks:(tk.data||[]).length};
}
