/* =====================================================================
   FORMS — contact form submission. One delegated listener survives
   route changes. Posts JSON to the Vercel function /api/contact, which
   emails the enquiry via Resend (see api/contact.js).
   ===================================================================== */

/* pre-tick an interest from a link such as /contact?interest=DataLense */
export function preselect(){
  const v=new URLSearchParams(location.search).get('interest');if(!v)return;
  document.querySelectorAll<HTMLInputElement>('#contact-form input[name=interest]').forEach(i=>{if(i.value===v)i.checked=true;});
}
export function initForms(){
  /* newsletter opt-in */
  document.addEventListener('submit',async e=>{
    const f=e.target;
    if(!(f instanceof HTMLFormElement)||!f.classList.contains('sub-form'))return;
    e.preventDefault();
    const st=f.querySelector('.sub-status'),btn=f.querySelector<HTMLButtonElement>('button');
    const set=(m,c='')=>{st.textContent=m;st.className='sub-status'+(c?' '+c:'');};
    const fd=new FormData(f);
    if(!f.checkValidity()){set(!fd.get('email')||!(f.querySelector('input[name=email]') as HTMLInputElement).validity.valid?'Please enter a valid email address.':'Please tick the box to confirm you would like our emails.','err');return;}
    btn.disabled=true;set('Signing you up…');
    try{
      const r=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fd.get('email'),consent:!!fd.get('consent'),source:f.dataset.source,'bot-field':fd.get('bot-field')||''})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(j.error);
      f.reset();set('Thank you, you are on the list.','ok');
    }catch(err){set(err.message||'Something went wrong. Please try again later.','err');}
    finally{btn.disabled=false;}
  });
  document.addEventListener('submit',async e=>{
    const form=e.target;
    if(!(form instanceof HTMLFormElement)||(form.id!=='contact-form'&&!form.classList.contains('enq-form')))return;
    e.preventDefault();
    const status=form.querySelector('.cform-status');
    const btn=form.querySelector<HTMLButtonElement>('button[type=submit]');
    const set=(msg,cls='')=>{status.textContent=msg;status.className='cform-status'+(cls?' '+cls:'');};
    if(!form.checkValidity()){
      const bad=form.querySelector<HTMLElement>(':invalid');bad?.focus();
      set('Please add your name, a valid email and a short message.','err');return;
    }
    btn.disabled=true;set('Sending…');
    try{
      const fd=new FormData(form);
      const goal=String(fd.get('goal')||'');fd.delete('goal');
      const payload:Record<string,unknown>={...Object.fromEntries(fd.entries()),interest:fd.getAll('interest').join(', ')};
      if(goal)payload.message=`We want to ${goal} by ${fd.get('timeline')||'no fixed date'}.\n\n${payload.message}`;
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok)throw new Error('status '+res.status);
      form.reset();
      set('Thank you, that is with us. We will reply to the email you gave within two working days.','ok');
    }catch{
      set('Something went wrong sending that. Please try again in a moment.','err');
    }finally{btn.disabled=false;}
  });
}

/* contact brief: each inline select is as wide as the words chosen */
export function fitBrief(){
  document.querySelectorAll<HTMLSelectElement>('.bs select').forEach(sel=>{
    const fit=()=>{const m=document.createElement('span');const cs=getComputedStyle(sel);
      m.style.cssText=`position:absolute;visibility:hidden;white-space:pre;font:${cs.font};letter-spacing:${cs.letterSpacing}`;
      m.textContent=sel.options[sel.selectedIndex]?.text||'';document.body.appendChild(m);
      sel.style.width=`calc(${m.getBoundingClientRect().width}px + 1.15em)`;m.remove();};
    sel.addEventListener('change',fit);fit();document.fonts?.ready.then(fit);
  });
}
