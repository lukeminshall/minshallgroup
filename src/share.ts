/* =====================================================================
   SHARE — article share bar. One delegated listener survives route
   changes. "Copy link" uses the clipboard; "Share…" opens the device's
   own share sheet and only shows where the browser supports it.
   ===================================================================== */
export function initShare(){
  if('share' in navigator)document.documentElement.classList.add('can-share');
  document.addEventListener('click',async e=>{
    const b=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-share-copy],[data-share-native]');if(!b)return;
    if(b.dataset.shareNative){
      try{await navigator.share({title:b.dataset.shareTitle,url:b.dataset.shareNative});}catch{}
      return;
    }
    const u=b.dataset.shareCopy||location.href;
    let ok=false;
    try{await navigator.clipboard.writeText(u);ok=true;}catch{
      /* older browsers and locked-down frames: copy from a hidden field */
      const t=document.createElement('textarea');t.value=u;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0';
      document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove();
    }
    b.textContent=ok?'Copied':'Copy failed';
    setTimeout(()=>{b.textContent='Copy link';},2000);
  });
}
