/* Cookie consent for the concept sites: Clarity stays cookie-free until the
   visitor agrees. Self-contained so each example keeps its own design. */
(function(){
  if(window.top!==window)return; /* not inside the /digitalsme previews */
  var KEY='mg-consent';
  function read(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function tell(v){if(typeof window.clarity!=='function')return;window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:v});window.clarity('consent',v==='granted');}
  var v=read();if(v){tell(v);addEventListener('load',function(){setTimeout(function(){tell(read());},2500);});return;}
  setTimeout(function(){
    var d=document.createElement('div');d.setAttribute('role','dialog');d.setAttribute('aria-label','Cookie choices');
    d.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;max-width:380px;padding:16px 18px;border-radius:14px;background:#141414;color:#fff;font:14px/1.5 system-ui,sans-serif;box-shadow:0 20px 40px rgba(0,0,0,.35)';
    d.innerHTML='<p style="margin:0 0 12px">This concept site uses Microsoft Clarity to see how it is used. Allow analytics cookies? It runs cookie-free if you say no.</p>'+
      '<button data-c="granted" style="font:inherit;font-weight:700;border:0;border-radius:999px;padding:9px 16px;margin-right:6px;cursor:pointer;background:#fff;color:#141414">Accept</button>'+
      '<button data-c="denied" style="font:inherit;font-weight:700;border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:9px 16px;cursor:pointer;background:none;color:#fff">No thanks</button>';
    d.addEventListener('click',function(e){var c=e.target.getAttribute&&e.target.getAttribute('data-c');if(!c)return;try{localStorage.setItem(KEY,c);}catch(x){}tell(c);d.remove();});
    document.body.appendChild(d);
  },1500);
})();
