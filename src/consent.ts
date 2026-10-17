/* =====================================================================
   COOKIE CONSENT — Microsoft Clarity runs without cookies until a visitor
   agrees. The choice is remembered on this device and sent to Clarity
   with its consent API; "Cookie settings" in the footer reopens it.
   ===================================================================== */
const KEY='mg-consent';
type Choice='granted'|'denied';
const read=():Choice|null=>{try{const v=localStorage.getItem(KEY);return v==='granted'||v==='denied'?v:null;}catch{return null;}};
const save=(v:Choice)=>{try{localStorage.setItem(KEY,v);}catch{}};
function tell(v:Choice){
  const c=(window as any).clarity;if(typeof c!=='function')return;
  c('consentv2',{ad_Storage:'denied',analytics_Storage:v});
  if(v==='granted')c('consent');else c('consent',false);
}
let box:HTMLElement|null=null;
function show(){
  if(box){box.hidden=false;requestAnimationFrame(()=>box.classList.add('on'));return;}
  box=document.createElement('div');box.className='cookie';box.setAttribute('role','dialog');box.setAttribute('aria-label','Cookie choices');
  box.innerHTML=`<p><b>Cookies, briefly.</b> We use Microsoft Clarity to see how people use this site so we can improve it. With your agreement it can set analytics cookies; without it, it runs cookie-free. <a href="/privacy#cookies">More detail</a></p>
    <div class="cookie-acts"><button type="button" class="btn sm" data-c="granted"><span>Accept analytics</span></button><button type="button" class="btn sm ghost" data-c="denied"><span>No thanks</span></button></div>`;
  document.body.appendChild(box);
  box.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-c]');if(!b)return;const v=b.dataset.c as Choice;save(v);tell(v);hide();});
  requestAnimationFrame(()=>box.classList.add('on'));
}
function hide(){if(!box)return;box.classList.remove('on');setTimeout(()=>{if(box)box.hidden=true;},350);}
export function initConsent(){
  const v=read();
  if(v)tell(v);else setTimeout(show,1500);
  /* the Clarity tag loads late, so repeat the stored choice once it has */
  addEventListener('load',()=>setTimeout(()=>{const s=read();if(s)tell(s);},2500));
  document.addEventListener('click',e=>{if((e.target as HTMLElement).closest('[data-cookie-settings]')){e.preventDefault();show();}});
}
