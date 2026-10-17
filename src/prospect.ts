/* =====================================================================
   PROSPECTING TOOL — /tools/prospect (internal, password-protected).
   Paste prospects (one per line: website, email, contact name), get each
   site's Webmins Score and a personalised outreach email to send by hand.
   Scoring runs through /api/prospect (same engine as the public check).
   The list and settings are kept in this browser only (localStorage).
   ===================================================================== */
import {SME,SCORE} from './content';
import {score} from './webmins';

const KEY='mg-prospect-v1';
const gbp=n=>'£'+Math.round(n).toLocaleString('en-GB');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}};
const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}};

type Row={site:string,email:string,name:string,status:'queued'|'running'|'done'|'error',error?:string,res?:any,ind?:string};
let rows:Row[]=[];let key='';

export function initProspect(){
  const root=document.getElementById('prospect');if(!root)return;
  const st=load();
  const $=s=>root.querySelector(s) as any;
  $('[name=sender]').value=st.sender||'Luke Minshall';
  $('[name=list]').value=st.list||'';
  key=sessionStorage.getItem('mg-tool-key')||'';
  rows=st.rows||[];
  const showApp=()=>{$('[data-gate]').hidden=true;$('[data-app]').hidden=false;paint();};

  /* password gate: checked against the server, kept for this tab only */
  $('[data-gate-form]').addEventListener('submit',async e=>{
    e.preventDefault();const pw=$('[name=pw]').value;const msg=$('[data-gate-msg]');msg.textContent='Checking…';
    const r=await fetch('/api/prospect',{method:'POST',headers:{'Content-Type':'application/json','x-tool-key':pw},body:JSON.stringify({ping:true})}).catch(()=>null);
    if(r&&r.ok){key=pw;try{sessionStorage.setItem('mg-tool-key',pw);}catch{};msg.textContent='';showApp();}
    else{const j=r?await r.json().catch(()=>({})):{};msg.textContent=j.error||'Could not reach the server.';}
  });
  if(key)showApp();

  $('[data-run]').addEventListener('click',()=>run(root));
  $('[data-clear]').addEventListener('click',()=>{if(!confirm('Clear all results from this browser?'))return;rows=[];persist(root);paint();});
  $('[data-csv]').addEventListener('click',()=>csv());
  root.addEventListener('input',e=>{const t=e.target as HTMLElement;if(t.matches('[name=sender],[name=list]'))persist(root);});
  root.addEventListener('change',e=>{const t=e.target as HTMLSelectElement;if(t.matches('[data-ind]')){rows[+t.dataset.ind].ind=t.value;persist(root);paint();}});
  root.addEventListener('click',async e=>{
    const b=(e.target as HTMLElement).closest<HTMLElement>('[data-copy]');if(!b)return;
    const i=+b.dataset.i,d=draft(rows[i]);const text=b.dataset.copy==='subject'?d.subject:d.body;
    try{await navigator.clipboard.writeText(text);b.textContent='Copied';setTimeout(()=>b.textContent=b.dataset.copy==='subject'?'Copy subject':'Copy email',1500);}catch{alert(text);}
  });

  function persist(root){const s={sender:$('[name=sender]').value,list:$('[name=list]').value,rows};save(s);}
  function paint(){
    const out=$('[data-out]');
    out.innerHTML=rows.length?rows.map((r,i)=>card(r,i)).join(''):'<p class="pt-empty">No prospects scored yet. Paste a list above and press Score.</p>';
    $('[data-count]').textContent=rows.length?`${rows.filter(r=>r.status==='done').length} of ${rows.length} scored`:'';
  }
  async function run(root){
    const lines=$('[name=list]').value.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,50);
    if(!lines.length){$('[name=list]').focus();return;}
    const psi=$('[name=psi]').checked;
    const seen=new Set(rows.map(r=>r.site));
    for(const l of lines){
      const [site,email='',name='']=l.split(/[,\t;]/).map(x=>x.trim());
      const clean=site.replace(/^https?:\/\//,'').replace(/\/$/,'');
      if(!clean||seen.has(clean))continue;seen.add(clean);
      rows.push({site:clean,email,name,status:'queued'});
    }
    persist(root);paint();
    const queue=rows.map((r,i)=>i).filter(i=>rows[i].status==='queued'||rows[i].status==='error');
    const worker=async()=>{while(queue.length){const i=queue.shift();const r=rows[i];r.status='running';paint();
      try{const res=await fetch('/api/prospect',{method:'POST',headers:{'Content-Type':'application/json','x-tool-key':key},body:JSON.stringify({url:r.site,psi})});
        const j=await res.json().catch(()=>({error:'Bad response'}));
        if(res.status===401){sessionStorage.removeItem('mg-tool-key');location.reload();return;}
        if(!res.ok)throw new Error(j.error||'Could not check');
        r.res=j;r.ind=r.ind||j.industry;r.status='done';r.error=undefined;
      }catch(err){r.status='error';r.error=err.message;}
      persist(root);paint();}};
    await Promise.all([worker(),worker(),worker()]);
  }
}

/* ---------- the draft email ---------- */
function bizName(r){
  const t=(r.res?.title||'').split(/\s[|\-–—:]\s|\s[|–—]\s?/).map(s=>s.trim()).filter(s=>s&&!/^home$/i.test(s));
  const fromTitle=t.sort((a,b)=>a.length-b.length).find(s=>s.length>=3&&s.length<=40);
  return fromTitle||r.site.replace(/^www\./,'').split('.')[0].replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
function draft(r:Row){
  const j=r.res,s=score(j,r.ind||j.industry),biz=bizName(r);
  const first=(r.name||'').split(/\s+/)[0];
  const missing=s.ess.filter(e=>!e.ok).map(e=>`Missing: ${e.t.toLowerCase()}. Customers now expect this on a ${s.I.t.toLowerCase()} website.`);
  const fixes=[...(j.suggestions||[]),...missing].slice(0,3);
  const pk=SME.packages.find(p=>p.id===j.recommended)||SME.packages[0];
  const link=`https://minshallgroup.com/digitalsme?url=${encodeURIComponent(r.site)}`;
  const sender=(load().sender||'Luke Minshall').trim();
  const subject=`${biz}: your website scored ${s.total}/100`;
  const body=[
    `Hi ${first||'there'},`,'',
    `I ran ${biz}'s website through our Webmins Score, which checks how well a small business website turns visitors into enquiries. It scored ${s.total} out of 100 (${s.grade.toLowerCase()}), measured against what customers expect from a ${s.I.t.toLowerCase()} website.`,'',
    fixes.length?`Three things stood out:\n${fixes.map((f,i)=>`${i+1}. ${f}`).join('\n')}`:'It covers the basics well. The quickest gains are in content and design.','',
    `You can see the full breakdown here. It's free and takes about 20 seconds:\n${link}`,'',
    `We fix exactly this kind of thing for a fixed price. Our ${pk.name} package starts at ${gbp(pk.price)}. If it would help, I'm happy to talk it through, with no obligation.`,'',
    `Best wishes,`,sender,`Minshall Group`,`hello@minshallgroup.com · minshallgroup.com`,'',
    `If you'd rather not hear from us again, just reply and say so and we won't contact you again.`
  ].join('\n');
  return {subject,body,s,biz};
}

function card(r:Row,i:number){
  if(r.status!=='done')return `<article class="pt-card ${r.status}"><div class="pt-head"><b>${esc(r.site)}</b><span class="pt-badge">${r.status==='error'?'Failed: '+esc(r.error):r.status==='running'?'Scoring…':'Waiting'}</span></div></article>`;
  const d=draft(r),s=d.s,cls=s.total>=85?'good':s.total>=70?'okay':s.total>=50?'mid':'poor';
  const mail=r.email?`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`:'';
  return `<article class="pt-card">
    <div class="pt-head">
      <div class="pt-score ${cls}"><b>${s.total}</b><span>${s.grade}</span></div>
      <div class="pt-id"><b>${esc(d.biz)}</b><a href="${esc(r.res.url)}" target="_blank" rel="noopener">${esc(r.site)}</a>${r.email?`<small>${esc(r.name||'')} ${esc(r.email)}</small>`:''}</div>
      <label class="pt-ind"><span class="sr">Sector</span><select data-ind="${i}">${SCORE.industries.map(x=>`<option value="${x.id}"${x.id===(r.ind||r.res.industry)?' selected':''}>${x.t}</option>`).join('')}</select></label>
    </div>
    <div class="pt-pills">${Object.entries(s.p).map(([k,v])=>`<span>${k==='industry'?'Sector fit':(SCORE.pillars.find(p=>p.id===k)?.t||k)} <b>${v}</b></span>`).join('')}</div>
    <details class="pt-mail"><summary>Draft email</summary>
      <p class="pt-subj"><b>Subject:</b> ${esc(d.subject)}</p>
      <pre>${esc(d.body)}</pre>
    </details>
    <div class="pt-actions">
      <button class="btn sm ghost" type="button" data-copy="subject" data-i="${i}">Copy subject</button>
      <button class="btn sm ghost" type="button" data-copy="body" data-i="${i}">Copy email</button>
      ${mail?`<a class="btn sm" href="${mail}"><span>Open in email</span></a>`:''}
    </div>
  </article>`;
}

function csv(){
  const head=['Website','Business','Contact','Email','Score','Grade','Sector','Subject','Email body','Check link'];
  const lines=rows.filter(r=>r.status==='done').map(r=>{const d=draft(r);return [r.site,d.biz,r.name,r.email,d.s.total,d.s.grade,d.s.I.t,d.subject,d.body,`https://minshallgroup.com/digitalsme?url=${encodeURIComponent(r.site)}`];});
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const blob=new Blob([[head,...lines].map(l=>l.map(q).join(',')).join('\r\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`prospects-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}
