/* Light check run on /portal: if the portal is not configured yet, show the
   "being set up" message without downloading the sign-in and data libraries. */
const env=(import.meta as any).env||{};
export function portalGate(){
  const root=document.querySelector('[data-portal]');if(!root)return;
  if(!(env.VITE_CLERK_PUBLISHABLE_KEY&&env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_ANON_KEY)){
    const F=[['Your onboarding, online','Answer the project questions in your own time. No kick-off call to book.'],['Follow every stage','Discovery, design, build, review and launch, with what happens next at each step.'],['Approve with one click','Open the design preview, approve it or request changes, all in one place.'],['Changes and quotes','Raise a change after launch, see the price first and approve it before we start.'],['Invoices in one place','Each of the three stage payments, with what it covers.'],['Your site’s performance','Your Webmins Score, re-checked every month, with what to improve next.']];
    root.innerHTML=`<div class="pp-pre">
      <div class="pp-pre-head"><span class="eyebrow">Client portal</span><h2 class="h2">Everything about your project, in one place.</h2>
        <p class="lede-s">We are opening client logins shortly. Here is what you will be able to do.</p></div>
      <ul class="pp-pre-grid">${F.map(([t,d],i)=>`<li><span>0${i+1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ul>
      <div class="pp-pre-foot"><div><b>Already working with us?</b><p>Email <a class="ulink" href="mailto:hello@minshallgroup.com">hello@minshallgroup.com</a> and we will help straight away.</p></div>
        <div class="actions"><a class="btn" href="/digitalsme#quote"><span>Start a website project</span></a><a class="btn ghost" href="/contact"><span>Talk to us</span></a></div></div>
    </div>`;
    return;
  }
  import('./index').then(m=>m.initPortal());
}
