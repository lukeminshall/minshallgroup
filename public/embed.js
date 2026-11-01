/* Placeboard embed. Paste where the feed should appear:
   <div data-placeboard="ripon"></div>
   <script src="https://theplaceboard.com/embed.js" async></script>
   Optional: data-accent="#0A6E4F" data-theme="dark". The frame sizes itself to its content. */
(function(){
  var base='https://minshallgroup.com/embed/';
  document.querySelectorAll('[data-placeboard]:not([data-pb-on])').forEach(function(el){
    var place=(el.getAttribute('data-placeboard')||'').replace(/[^a-z0-9-]/gi,'');if(!place)return;
    var q=new URLSearchParams();
    if(el.dataset.accent)q.set('accent',el.dataset.accent);
    if(el.dataset.theme)q.set('theme',el.dataset.theme);
    var f=document.createElement('iframe');
    f.src=base+place+(q.toString()?'?'+q:'');f.title='What’s on, from Placeboard';f.loading='lazy';
    f.style.cssText='width:100%;border:0;display:block;min-height:420px';
    el.setAttribute('data-pb-on','');el.appendChild(f);
    addEventListener('message',function(e){
      if(e.source===f.contentWindow&&e.data&&e.data.placeboard==='height')f.style.height=(+e.data.h||420)+'px',f.style.minHeight='0';
    });
  });
})();
