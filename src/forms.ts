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
