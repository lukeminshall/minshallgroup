/* =====================================================================
   NAV — header behaviour: solid-on-scroll, hide-on-scroll-down, mega
   menus (hover with intent delay, keyboard and touch friendly), the
   full-screen mobile menu and the reading-progress bar.
   ===================================================================== */
import {navMarkup,mobileNavMarkup,footerMarkup} from './shell';
import {tile} from './brand';

const head=document.getElementById('site-head');
const nav=document.getElementById('nav');
const mnav=document.getElementById('mnav');
const burger=document.getElementById('burger');

export function buildShell(){
  document.getElementById('brand-tile').outerHTML=tile();
  nav.innerHTML=navMarkup();
  mnav.innerHTML=mobileNavMarkup();
  document.getElementById('site-foot').innerHTML=footerMarkup();
  wireMega();wireMobile();wireScroll();wirePick();
}

function closeMegas(){nav.querySelectorAll('.navitem.open').forEach(n=>{n.classList.remove('open');n.querySelector('.navbtn').setAttribute('aria-expanded','false');});head.classList.remove('mega-open');syncSolid();}
function openMega(item){if(item.classList.contains('open'))return;closeMegas();item.classList.add('open');item.querySelector('.navbtn').setAttribute('aria-expanded','true');head.classList.add('mega-open');syncSolid();}

function wireMega(){
  nav.querySelectorAll<HTMLElement>('.has-mega').forEach(item=>{
    let t=0;
    item.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(t);t=window.setTimeout(()=>openMega(item),90);});
    item.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;clearTimeout(t);t=window.setTimeout(closeMegas,180);});
    item.addEventListener('focusin',()=>openMega(item));
    item.addEventListener('focusout',e=>{if(!item.contains(e.relatedTarget as Node))closeMegas();});
    /* touch: first tap opens the menu, second tap follows the link */
    item.querySelector('.navbtn').addEventListener('click',e=>{if(matchMedia('(pointer:coarse)').matches&&!item.classList.contains('open')){e.preventDefault();openMega(item);}});
  });
  nav.addEventListener('click',e=>{if((e.target as HTMLElement).closest('.mega a'))closeMegas();});
  addEventListener('keydown',e=>{if(e.key==='Escape'){closeMegas();if(mnav.classList.contains('open'))toggleMobile(false);}});
  document.addEventListener('click',e=>{if(!nav.contains(e.target as Node))closeMegas();});
}

function toggleMobile(open){
  burger.setAttribute('aria-expanded',String(open));
  burger.setAttribute('aria-label',open?'Close menu':'Open menu');
  document.body.classList.toggle('menu-open',open);
  if(open){mnav.hidden=false;requestAnimationFrame(()=>mnav.classList.add('open'));}
  else{mnav.classList.remove('open');setTimeout(()=>{if(!mnav.classList.contains('open'))mnav.hidden=true;},350);}
}
function wireMobile(){
  burger.addEventListener('click',()=>toggleMobile(burger.getAttribute('aria-expanded')!=='true'));
  mnav.addEventListener('click',e=>{
    const t=e.target as HTMLElement,tog=t.closest<HTMLButtonElement>('.mn-tog');
    if(tog){const ul=tog.closest('.mn-item').querySelector<HTMLElement>('.mn-sub');const open=tog.getAttribute('aria-expanded')!=='true';
      tog.setAttribute('aria-expanded',String(open));ul.hidden=!open;requestAnimationFrame(()=>ul.classList.toggle('on',open));return;}
    if(t.closest('a'))toggleMobile(false);});
}

let lastY=0;
function syncSolid(){head.classList.toggle('solid',scrollY>40||head.classList.contains('mega-open'));}
function wireScroll(){
  const bar=document.querySelector<HTMLElement>('.progress i');
  const on=()=>{const y=scrollY;syncSolid();
    head.classList.toggle('hide',y>lastY&&y>400&&!head.classList.contains('mega-open'));lastY=y;
    const max=document.documentElement.scrollHeight-innerHeight;bar.style.setProperty('--p',String(max>0?y/max:0));};
  addEventListener('scroll',on,{passive:true});on();
}

export function setActive(path){
  nav.querySelectorAll<HTMLAnchorElement>('.navbtn').forEach(a=>{const h=a.getAttribute('href');a.classList.toggle('is-active',path===h||path.startsWith(h+'/'));});
  closeMegas();
}

/* "Start a project" asks which kind: a website (self-serve) or consultancy */
function wirePick(){
  const b=nav.querySelector<HTMLButtonElement>('[data-cta-pick]'),m=nav.querySelector<HTMLElement>('#cta-menu');if(!b||!m)return;
  const set=(open:boolean)=>{b.setAttribute('aria-expanded',String(open));m.hidden=!open;requestAnimationFrame(()=>m.classList.toggle('on',open));if(open)closeMegas();};
  b.addEventListener('click',e=>{e.stopPropagation();set(m.hidden);if(!m.hidden)m.querySelector<HTMLElement>('a')?.focus({preventScroll:true});});
  m.addEventListener('click',e=>{if((e.target as HTMLElement).closest('a'))set(false);});
  document.addEventListener('click',e=>{if(!m.hidden&&!m.contains(e.target as Node))set(false);});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden){set(false);b.focus();}});
}
