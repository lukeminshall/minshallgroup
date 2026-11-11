/* =====================================================================
   /sign?a=<agreement> — read and sign an agreement.
   The signer signs in with the email address the invitation went to; the
   server checks it, shows the document, and records the signature. Loaded
   only on /sign (dynamic import), like the portal.
   ===================================================================== */
import {ready,boot,clerk,api,esc,toast} from './core';

const when=(d:string)=>new Date(d).toLocaleString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});

export async function initSign(){
  const root=document.querySelector<HTMLElement>('[data-sign]');if(!root)return;
  const id=new URLSearchParams(location.search).get('a')||'';
  if(!ready()){root.innerHTML=`<div class="pp-card"><h2 class="h2">Signing is being set up.</h2><p>Please email <a class="ulink" href="mailto:hello@minshallgroup.com">hello@minshallgroup.com</a>.</p></div>`;return;}
  root.innerHTML='<p class="pp-loading">Loading…</p>';
  try{await boot();}catch{root.innerHTML=`<div class="pp-card"><h2 class="h2">We could not load sign-in.</h2><p>Please refresh the page.</p></div>`;return;}
  let who=clerk.user?.id||'';
  clerk.addListener(()=>{if((clerk.user?.id||'')!==who){who=clerk.user?.id||'';paint();}});
  paint();

  async function paint(){
    if(!document.body.contains(root))return;
    if(!clerk.user){
      root.innerHTML=`<div class="sg-card sg-in"><span class="eyebrow">Agreement</span><h2 class="h2">Sign in to read and sign.</h2>
        <p class="lede-s">Use the email address the invitation was sent to. If you have not signed in before, create an account with that address: it takes about 30 seconds.</p>
        <div class="actions"><button class="btn" data-in><span>Sign in</span></button><button class="btn ghost" data-up><span>Create an account</span></button></div></div>`;
      root.querySelector('[data-in]').addEventListener('click',()=>clerk.openSignIn({forceRedirectUrl:location.href}));
      root.querySelector('[data-up]').addEventListener('click',()=>clerk.openSignUp({forceRedirectUrl:location.href}));
      return;
    }
    if(!id){root.innerHTML=`<div class="sg-card"><h2 class="h2">Open the link from your email.</h2><p>Each agreement has its own link. Your agreements are also in your <a class="ulink" href="/portal#agreements">client portal</a>.</p></div>`;return;}
    root.innerHTML='<p class="pp-loading">Loading the agreement…</p>';
    let v:any;
    try{v=await api('/api/portal-notify',{event:'agreement_view',agreementId:id});}
    catch(e){root.innerHTML=`<div class="sg-card"><h2 class="h2">We could not open this agreement.</h2><p>${esc(e.message)}</p>
      <div class="actions"><button class="btn ghost" data-out><span>Sign in with a different email</span></button></div></div>`;
      root.querySelector('[data-out]').addEventListener('click',()=>clerk.signOut());return;}
    const a=v.agreement,done=v.signers.filter((s:any)=>s.signed_at).length,meSigned=v.signers.find((s:any)=>s.me&&s.signed_at);
    const badge=a.status==='signed'?'Signed by everyone':a.status==='void'?'Withdrawn':a.status==='draft'?'Draft, not sent':`${done} of ${v.signers.length} signed`;
    root.innerHTML=`<div class="sg">
      <div class="sg-head"><span class="eyebrow">Agreement · ${esc(v.org)} and Minshall Group</span><h2 class="h2">${esc(a.title)}</h2>
        <p class="sg-status st-${a.status}">${esc(badge)}</p>${a.summary?`<p class="lede-s">${esc(a.summary)}</p>`:''}</div>
      ${a.status==='signed'&&v.signedUrl?`<div class="sg-done"><b>Signed by everyone on ${when(a.completed_at)}.</b><span>The signed copy has a certificate page showing who signed, when and how. It has also been emailed to every signatory.</span><a class="btn" href="${esc(v.signedUrl)}" target="_blank" rel="noopener"><span>Download the signed copy</span></a></div>`:''}
      <div class="sg-grid">
        <div class="sg-doc">
          ${v.docUrl?`<iframe class="sg-frame" src="${esc(v.docUrl)}#view=FitH" title="${esc(a.title)}"></iframe><p class="pp-small"><a class="ulink" href="${esc(v.docUrl)}" target="_blank" rel="noopener">Open the document in a new tab</a></p>`:''}
          ${a.terms_url?`<div class="sg-terms"><b>Terms</b><p>These terms form part of the agreement.</p><a class="btn sm ghost" href="${esc(a.terms_url)}" target="_blank" rel="noopener"><span>Read the terms</span></a></div>`:''}
        </div>
        <aside class="sg-side">
          <h3 class="pp-h4">Signatories</h3>
          <ol class="sg-who">${v.signers.map((s:any)=>`<li class="${s.signed_at?'ok':''}"><span aria-hidden="true">${s.signed_at?'✓':''}</span><div><b>${esc(s.name)}${s.me?' (you)':''}</b><small>For ${esc(s.signs_for)} · ${s.signed_at?'Signed '+when(s.signed_at):'Waiting'}${s.ip?' · IP '+esc(s.ip):''}</small></div></li>`).join('')}</ol>
          ${v.me?`<form class="sg-form" novalidate>
            <h3 class="pp-h4">Your signature</h3>
            <div class="cfield"><label for="sg-name">Type your full name</label><input id="sg-name" name="name" required autocomplete="name" value="${esc(v.me.name||'')}"></div>
            <div class="sg-pad-wrap"><div class="sg-pad-top"><span>Draw your signature <span class="opt">optional</span></span><button type="button" class="ulink" data-clear>Clear</button></div>
              <canvas class="sg-pad" width="600" height="180" aria-label="Signature drawing area"></canvas></div>
            <label class="sg-check"><input type="checkbox" name="agree"><span>${esc(v.me.consent.split('. I confirm')[0])}.</span></label>
            <label class="sg-check"><input type="checkbox" name="authorised"><span>I confirm that I am authorised to sign on behalf of ${esc(v.me.signs_for)}.</span></label>
            <button class="btn" type="submit"><span>Sign the agreement</span></button>
            <p class="pp-muted pp-small">Signed in as ${esc(v.email)}. We record your name, the time, your IP address and browser, and a fingerprint of the document, on a certificate attached to the signed copy.</p>
          </form>`:meSigned&&a.status==='out'?`<div class="sg-done calm"><b>Thank you, you have signed.</b><span>We will email everyone the signed copy once the remaining signatories have signed.</span></div>`:''}
        </aside>
      </div></div>`;
    const f=root.querySelector<HTMLFormElement>('.sg-form');if(!f)return;
    /* the drawing pad */
    const cv=f.querySelector<HTMLCanvasElement>('.sg-pad'),ctx=cv.getContext('2d');let drawn=false,down=false;
    ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#0A1A3F';
    const pt=(e:PointerEvent)=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
    cv.addEventListener('pointerdown',e=>{down=true;cv.setPointerCapture(e.pointerId);const [x,y]=pt(e);ctx.beginPath();ctx.moveTo(x,y);e.preventDefault();});
    cv.addEventListener('pointermove',e=>{if(!down)return;const [x,y]=pt(e);ctx.lineTo(x,y);ctx.stroke();drawn=true;});
    const up=()=>{down=false;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    f.querySelector('[data-clear]').addEventListener('click',()=>{ctx.clearRect(0,0,cv.width,cv.height);drawn=false;});
    f.addEventListener('submit',async e=>{
      e.preventDefault();const name=(f.elements.namedItem('name') as HTMLInputElement).value.trim();
      const agree=(f.elements.namedItem('agree') as HTMLInputElement).checked,authorised=(f.elements.namedItem('authorised') as HTMLInputElement).checked;
      if(name.length<3){toast('Please type your full name',true);(f.elements.namedItem('name') as HTMLInputElement).focus();return;}
      if(!agree||!authorised){toast('Please tick both boxes to confirm',true);return;}
      if(!confirm(`Sign “${a.title}” as ${name}?`))return;
      const btn=f.querySelector<HTMLButtonElement>('button[type=submit]');btn.disabled=true;btn.querySelector('span').textContent='Signing…';
      try{const r=await api('/api/portal-notify',{event:'agreement_sign',agreementId:id,name,agree,authorised,signature:drawn?cv.toDataURL('image/png'):null});
        toast(r.complete?'Signed. Everyone has signed: the signed copy is on its way by email.':'Signed. Thank you.');paint();}
      catch(err){toast(err.message,true);btn.disabled=false;btn.querySelector('span').textContent='Sign the agreement';}
    });
  }
}
