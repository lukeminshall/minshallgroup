/* Light check run on /portal: if the portal is not configured yet, show the
   "being set up" message without downloading the sign-in and data libraries. */
const env=(import.meta as any).env||{};
export function portalGate(){
  const root=document.querySelector('[data-portal]');if(!root)return;
  if(!(env.VITE_CLERK_PUBLISHABLE_KEY&&env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_ANON_KEY)){
    root.innerHTML=`<div class="pp-card"><h2 class="h2">The client portal is being set up.</h2><p>It will be available here shortly. In the meantime, email <a class="ulink" href="mailto:hello@minshallgroup.com">hello@minshallgroup.com</a> and we will help straight away.</p></div>`;
    return;
  }
  import('./index').then(m=>m.initPortal());
}
