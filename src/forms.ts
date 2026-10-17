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
    if(!(form instanceof HTMLFormElement)||form.id!=='contact-form')return;
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
      const payload={...Object.fromEntries(fd.entries()),interest:fd.getAll('interest').join(', ')};
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok)throw new Error('status '+res.status);
      form.reset();
      set('Thank you, that is with us. We will reply to the email you gave within two working days.','ok');
    }catch{
      set('Something went wrong sending that. Please try again in a moment.','err');
    }finally{btn.disabled=false;}
  });
}
