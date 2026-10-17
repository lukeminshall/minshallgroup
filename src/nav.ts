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
  wireMega();wireMobile();wireScroll();
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
  mnav.addEventListener('click',e=>{if((e.target as HTMLElement).closest('a'))toggleMobile(false);});
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
