/* =====================================================================
   MOTION + INTERACTION — everything that moves or responds.
   initPage() runs after every route render; all its listeners hang off
   an AbortController that is aborted on the next render. initGlobal()
   runs once (nothing global at present). Content is visible by default: every effect fails
   toward showing content, and prefers-reduced-motion turns movement off.
   ===================================================================== */
export const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const FINE=window.matchMedia('(pointer:fine)').matches;
let ac:AbortController|null=null;
const cleanups:(()=>void)[]=[];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

import {initTailor} from './tailor';
export function initPage(){
  ac?.abort();cleanups.splice(0).forEach(f=>f());
  ac=new AbortController();const sig={signal:ac.signal};
  document.body.dataset.route=location.pathname;
  reveals();heroField(sig);opening(sig);hscroll(sig);hoverPreview(sig);
  finder();filters();insightFilter();tabs(sig);stickySteps(sig);magnetic(sig);mobileCta(sig);initTailor();
  dispatchEvent(new Event('mg:page'));
}
export function initGlobal(){}

/* ---------- scroll reveal ---------- */
function reveals(){
  const els=[...document.querySelectorAll<HTMLElement>('.reveal,.steps-row li')];
  if(RM||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  /* tall blocks (long articles) can never show 12% of themselves at once, so they reveal as soon as they enter */
  const io0=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io0.unobserve(en.target);}}),{threshold:0,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>(e.offsetHeight>innerHeight*.8?io0:io).observe(e));cleanups.push(()=>{io.disconnect();io0.disconnect();});
  const t=setTimeout(()=>els.forEach(e=>{if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in');}),1800);
  cleanups.push(()=>clearTimeout(t));
}

/* ---------- hero: a living field of points ----------
   A quiet grid that breathes, and bends towards the cursor in brand pink:
   the number moving. Starts after first paint, pauses off screen and in
   background tabs, and stays still for reduced motion.
   The same field doubles as a padel court: a discreet line on the opening
   turns the cursor into a racket on the left, an opponent on the right, glass
   all round, and the ball becomes the thing the grid bends towards. */
function heroField(sig){
  const cv=document.querySelector<HTMLCanvasElement>('[data-field]');if(!cv)return;
  const ctx=cv.getContext('2d');if(!ctx)return;
  let W=0,H=0,dpr=1,pts:number[]=[],gap=34,mx=-9999,my=-9999,tmx=-9999,tmy=-9999,on=false,raf=0,t0=performance.now(),lastF=0,touchT=0;
  const size=()=>{const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;
    gap=W<700?20:26;pts=[];for(let y=gap/2;y<H;y+=gap)for(let x=gap/2;x<W;x+=gap)pts.push(x,y);};

  const sec=cv.closest<HTMLElement>('[data-open]');

  /* ----- the first three seconds: the dots spell the words, then let go -----
     Each word is drawn on an offscreen canvas, sampled to as many points as
     the grid has, and every grid dot is given a target. The dots travel in,
     hold, move to the next word, and finally scatter home as the headline
     cuts in. Scrolling or a touch ends it early. */
  let sp:any=null;                                   /* {tg:number[][],i,t0,on:boolean} */
  const rnd=(i:number)=>{const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x);};   /* a stable per-dot random */
  const spellDone=()=>{sp=null;sec?.classList.remove('intro');};
  /* a backstop: whatever happens to the dots, the words are on screen within eight seconds */
  if(sec?.classList.contains('intro')){const t=setTimeout(()=>sec.classList.remove('intro'),8000);cleanups.push(()=>clearTimeout(t));}
  const sample=(word:string)=>{
    if(W<2||H<2)size();if(W<2||H<2)throw new Error('field has no size yet');   /* never sample a zero-width canvas: that throws and would strand the intro */
    const oc=document.createElement('canvas');oc.width=W;oc.height=H;const o=oc.getContext('2d');
    let fs=Math.min(H*.56,W*1.5/Math.max(4,word.length));o.font=`700 ${fs}px 'Archivo Variable',Archivo,sans-serif`;
    const tw=o.measureText(word).width;if(tw>W*.86){fs*=W*.86/tw;o.font=`700 ${fs}px 'Archivo Variable',Archivo,sans-serif`;}
    o.fillStyle='#fff';o.textAlign='center';o.textBaseline='middle';o.fillText(word,W/2,H*.47);
    const d=o.getImageData(0,0,W,H).data,hits:number[]=[],st=W<700?3:4;
    for(let y=0;y<H;y+=st)for(let x=0;x<W;x+=st)if(d[(y*W+x)*4+3]>128)hits.push(x,y);
    const n=pts.length/2,m=hits.length/2,tg:number[]=[];
    /* give every grid dot a target; spread the picks evenly through the glyphs */
    const order=[...Array(n).keys()].sort((a,b)=>pts[a*2]-pts[b*2]||pts[a*2+1]-pts[b*2+1]);
    /* a random pick of the glyph pixels (an ordered pick draws stripes), then matched left to right so no dot travels far */
    const hidx=[...Array(m).keys()].sort((a,b)=>rnd(a)-rnd(b)).slice(0,Math.min(n,m)).sort((a,b)=>hits[a*2]-hits[b*2]||hits[a*2+1]-hits[b*2+1]);
    order.forEach((pi,k)=>{const h=hidx[Math.floor(k/n*hidx.length)];tg[pi*2]=hits[h*2];tg[pi*2+1]=hits[h*2+1];});
    return tg;};
  const spell=async()=>{
    const words=(sec?.dataset.spell||'').split('|').filter(Boolean);
    if(!sec||!words.length||RM||!sec.classList.contains('intro')){sec?.classList.remove('intro');return;}
    try{await document.fonts.load("700 100px 'Archivo Variable'");}catch{}
    if(!sec.classList.contains('intro'))return;
    try{sp={tg:words.map(sample),i:0,t0:performance.now(),pour:POUR};}catch{spellDone();return;}   /* if the field cannot be read, skip straight to the words */
    const end=()=>{if(sp)spellDone();};
    addEventListener('scroll',end,{passive:true,once:true,...sig});cv.parentElement.addEventListener('pointerdown',end,{once:true,...sig});
    const t=setTimeout(end,POUR+words.length*(IN+HOLD)+IN+400);cleanups.push(()=>clearTimeout(t));};
  const POUR=1600,IN=480,HOLD=600;                 /* ms: the fall, each travel, each hold */
  /* the page can ask the dots to spell something later (the visitor's own word), without the pour */
  sec?.addEventListener('mg:spell',async(e:Event)=>{if(RM||sp)return;const words=((e as CustomEvent).detail||[]).filter(Boolean);if(!words.length)return;
    try{await document.fonts.load("700 100px 'Archivo Variable'");}catch{}
    try{sp={tg:words.map(sample),i:0,t0:performance.now(),pour:0,keep:true};}catch{sp=null;}},sig);
  const spellPos=(i:number,now:number,bx:number,by:number)=>{
    const el=now-sp.t0,pour=sp.pour;
    if(el<pour){                                     /* sand: every dot falls in on its own delay, sways, lands, and a ripple runs across */
      const d=rnd(i),p=clamp((el-d*700)/800),e=p*p,sy=-40-rnd(i+7)*H*.7;
      const sway=Math.sin(el/180+d*9)*10*(1-e);
      const rip=p>=1?Math.sin(bx*.018-el/95)*9*clamp(1-(el-900)/700):0;
      return [bx+sway,sy+(by-sy)*e+rip,Math.max(1-e,Math.abs(rip)/9*.7)];}
    const t=el-pour,W_=IN+HOLD,k=Math.floor(t/W_),ph=t-k*W_,last=sp.tg.length;
    if(k>=last){                                     /* scatter home */
      const e=1-Math.pow(1-clamp(ph/IN),3);const tg=sp.tg[last-1];
      if(ph>=IN){spellDone();return null;}
      return [tg[i]+(bx-tg[i])*e,tg[i+1]+(by-tg[i+1])*e,1.25*(1-e)];}
    const tg=sp.tg[k],fx=k?sp.tg[k-1][i]:bx,fy=k?sp.tg[k-1][i+1]:by;
    const e=1-Math.pow(1-clamp(ph/IN),3);
    return [fx+(tg[i]-fx)*e,fy+(tg[i+1]-fy)*e,k?1.25:e*1.25];};

  /* ----- the game ----- */
  const ui=sec?.querySelector<HTMLElement>('[data-pong]'),playBtn=sec?.querySelector<HTMLElement>('[data-play]');
  const msg=ui?.querySelector<HTMLElement>('[data-pong-msg]'),sYou=ui?.querySelector<HTMLElement>('[data-ps="you"]'),sThem=ui?.querySelector<HTMLElement>('[data-ps="them"]');
  const TO=7;
  let g:any=null,keys={up:false,down:false,left:false,right:false};
  const say=(t:string)=>{if(msg)msg.textContent=t;};
  const score=()=>{if(sYou)sYou.textContent=String(g.you);if(sThem)sThem.textContent=String(g.them);};
  /* court geometry: a padel court seen from above, net down the middle, glass all round */
  const court=()=>{const m=W<700?14:gap*1.2,top=Math.max(m,96);return {l:m,r:W-m,t:top,b:H-m,net:W/2,R:W<700?19:26,HO:W<700?26:38,ball:W<700?5:6};};
  let hand=Number((()=>{try{return localStorage.getItem('mg-hand');}catch{return '';}})()||0);   /* 1 right, -1 left */
  const handUi=ui?.querySelector<HTMLElement>('[data-hand]');
  const serve=(dir:number)=>{const c=court();g.wall=0;g.bx=dir>0?c.l+(c.net-c.l)*.3:c.r-(c.r-c.net)*.3;g.by=c.t+(c.b-c.t)*(.35+Math.random()*.3);
    const a=(Math.random()*.5-.25),s=Math.min(W,H)*.52;g.vx=Math.cos(a)*s*dir;g.vy=Math.sin(a)*s;g.hold=performance.now()+900;};
  const reset=()=>{const c=court();g={you:0,them:0,hx:c.l+(c.net-c.l)*.35,hy:H/2,ohx:c.r-(c.r-c.net)*.35,ohy:H/2,bx:W/2,by:H/2,vx:0,vy:0,hold:0,over:false,last:performance.now(),trail:[] as number[],wall:0,cool:0};
    score();serve(Math.random()<.5?1:-1);say(FINE?'Move the mouse to play. Off the glass still counts. First to seven.':'Drag to play. Off the glass still counts. First to seven.');};
  const startGame=()=>{if(!sec||!ui||g)return;
    scrollTo({top:sec.offsetTop,behavior:RM?'auto':'smooth'});
    sec.classList.add('playing');ui.hidden=false;document.documentElement.classList.add('noscroll');
    /* focusing the link can scroll the overflow-hidden frame; put it back */
    const pin=cv.parentElement;pin.scrollTo(0,0);pin.addEventListener('scroll',()=>pin.scrollTo(0,0),sig);
    size();reset();start();
    if(handUi){handUi.hidden=!!hand;if(!hand){g.hold=Infinity;say('Everyone needs a moment. Which hand do you play with?');}}};
  const endGame=()=>{if(!g)return;g=null;sec.classList.remove('playing');ui.hidden=true;document.documentElement.classList.remove('noscroll');};
  const setHand=(h:number)=>{hand=h;try{localStorage.setItem('mg-hand',String(h));}catch{}if(handUi)handUi.hidden=true;if(g&&g.hold===Infinity){g.hold=performance.now()+700;say(FINE?'Move the mouse to play. Off the glass still counts. First to seven.':'Drag to play. Off the glass still counts. First to seven.');}};
  const head=(hx:number,hy:number,side:number)=>[hx,hy+(hand||1)*side*court().HO];   /* racket head sits on the hand side; the opponent mirrors you */
  const step=(now:number)=>{
    const dt=Math.min(.04,(now-g.last)/1000);g.last=now;
    const c=court(),spd=Math.min(W,H)*1.2;
    /* your hand follows the pointer, or the arrow keys, anywhere in your half */
    if(tmx>-999){g.hx+=(tmx-g.hx)*Math.min(1,dt*18);g.hy+=(tmy-g.hy)*Math.min(1,dt*18);}
    if(keys.up)g.hy-=spd*dt;if(keys.down)g.hy+=spd*dt;if(keys.left)g.hx-=spd*dt;if(keys.right)g.hx+=spd*dt;
    g.hx=clamp(g.hx,c.l+c.R,c.net-c.R-6);g.hy=clamp(g.hy,c.t+c.R,c.b-c.R);
    if(g.over)return;
    /* the opponent reads the ball late and moves a touch slower than you can */
    const theirs=g.bx>c.net||g.vx>0;
    const wx=theirs?clamp(g.bx+(g.vx>0?60:-30),c.net+c.R+6,c.r-c.R):c.r-(c.r-c.net)*.35,wy=theirs?g.by-(hand||1)*-1*c.HO+Math.sin(now/600)*22:H/2;
    g.ohx+=clamp(wx-g.ohx,-spd*.6*dt,spd*.6*dt);g.ohy+=clamp(wy-g.ohy,-spd*.6*dt,spd*.6*dt);g.ohy=clamp(g.ohy,c.t+c.R,c.b-c.R);
    if(now<g.hold)return;
    const px=g.bx;g.bx+=g.vx*dt;g.by+=g.vy*dt;
    g.trail.push(g.bx,g.by);if(g.trail.length>28)g.trail.splice(0,2);
    const r=c.ball;
    if(g.by<c.t+r){g.by=c.t+r;g.vy=Math.abs(g.vy);}if(g.by>c.b-r){g.by=c.b-r;g.vy=-Math.abs(g.vy);}
    /* a strike: the ball meets the racket head, and goes the other way */
    const strike=(hx:number,hy:number,side:number,dir:number)=>{if(now<g.cool)return false;const [cx,cy]=head(hx,hy,side);const dx=g.bx-cx,dy=g.by-cy;
      if(dx*dx+dy*dy>(c.R+r)*(c.R+r))return false;
      const s=Math.min(Math.min(W,H)*1.5,Math.hypot(g.vx,g.vy)*1.06+40),a=clamp(dy/c.R,-1,1)*.8;
      g.vx=Math.cos(a)*s*dir;g.vy=Math.sin(a)*s;g.bx=cx+(c.R+r+1)*dir;g.wall=0;g.cool=now+220;return true;};
    if(g.bx<c.net)strike(g.hx,g.hy,1,1);else strike(g.ohx,g.ohy,-1,-1);
    /* the glass: one bounce off your back wall is live, a second is the point */
    const point=(you:boolean)=>{if(you)g.you++;else g.them++;score();g.trail=[];
      if(g.you>=TO||g.them>=TO){g.over=true;say(`${you?'You win':'They win'}. ${FINE?'Click':'Tap'} to play again.`);}
      else{say(you?'Your point.':'Their point.');serve(you?-1:1);}};
    if(g.bx<c.l+r){if(g.wall===-1)return point(false);g.wall=-1;g.bx=c.l+r;g.vx=Math.abs(g.vx)*.8;g.vy*=.85;}
    if(g.bx>c.r-r){if(g.wall===1)return point(true);g.wall=1;g.bx=c.r-r;g.vx=-Math.abs(g.vx)*.8;g.vy*=.85;}
    /* back over the net untouched after your glass: their point */
    if(px<c.net&&g.bx>=c.net&&g.wall===-1)return point(false);
    if(px>c.net&&g.bx<=c.net&&g.wall===1)return point(true);
  };
  const racket=(hx:number,hy:number,side:number,a:number)=>{const c=court(),[cx,cy]=head(hx,hy,side);
    ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(cx,cy-Math.sign(cy-hy)*c.R*.9);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,c.R,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=`rgba(255,255,255,${a*.55})`;for(let y=-c.R+8;y<c.R;y+=8)for(let x=-c.R+8;x<c.R;x+=8)if(x*x+y*y<(c.R-6)*(c.R-6))ctx.fillRect(cx+x-1,cy+y-1,2,2);};
  const drawGame=()=>{
    const c=court();
    ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1.5;ctx.strokeRect(c.l,c.t,c.r-c.l,c.b-c.t);
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=6;ctx.strokeRect(c.l-4,c.t-4,c.r-c.l+8,c.b-c.t+8);      /* the glass */
    ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1.5;const sl=(c.net-c.l)*.3;
    ctx.beginPath();ctx.moveTo(c.l+sl,c.t);ctx.lineTo(c.l+sl,c.b);ctx.moveTo(c.r-sl,c.t);ctx.lineTo(c.r-sl,c.b);ctx.moveTo(c.l+sl,H/2);ctx.lineTo(c.r-sl,H/2);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.3)';for(let y=c.t;y<c.b;y+=14)ctx.fillRect(c.net-1,y,2,8);                         /* the net */
    racket(g.hx,g.hy,1,.95);racket(g.ohx,g.ohy,-1,.5);
    for(let i=0;i<g.trail.length;i+=2){const k=i/g.trail.length;ctx.fillStyle=`rgba(255,46,99,${k*.35})`;const s=3+k*5;ctx.fillRect(g.trail[i]-s/2,g.trail[i+1]-s/2,s,s);}
    if(!g.over){ctx.fillStyle='#ff2e63';ctx.beginPath();ctx.arc(g.bx,g.by,c.ball,0,Math.PI*2);ctx.fill();}
  };

  const draw=(now:number)=>{
    /* touch screens: 30fps is plenty and kinder to batteries; a touch fades after a moment */
    if((!FINE||W<900)&&!g){if(now-lastF<33){if(on)raf=requestAnimationFrame(draw);return;}lastF=now;if(touchT&&now-touchT>1400){tmx=tmy=-9999;touchT=0;}}
    if(g)step(now);
    const t=(now-t0)/1000;
    const ax=g?g.bx:tmx,ay=g?g.by:tmy;mx+=(ax-mx)*(g?.5:.12);my+=(ay-my)*(g?.5:.12);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const R=W<700?140:220;
    for(let i=0;i<pts.length;i+=2){
      const bx=pts[i],by=pts[i+1];
      const w=Math.sin(bx*.012+t*.8)*Math.cos(by*.014-t*.6);          /* slow swell */
      let x=bx,y=by+w*5,dx=x-mx,dy=y-my,d=Math.sqrt(dx*dx+dy*dy),k=0;
      if(d<R){k=1-d/R;k*=k;x-=dx*k*.45;y-=dy*k*.45;}
      if(sp){const s=spellPos(i,now,x,y);if(s){x=s[0];y=s[1];k=Math.max(k,s[2]);}}
      const r=.9+Math.max(0,w)*.7+k*(sp?3.4:2.6);
      ctx.fillStyle=k>.02?`rgba(255,46,99,${.25+k*.75})`:`rgba(255,255,255,${.09+Math.max(0,w)*.1})`;
      ctx.fillRect(x-r/2,y-r/2,r,r);
    }
    if(g)drawGame();
    if(on&&!RM)raf=requestAnimationFrame(draw);
  };
  const start=()=>{if(on)return;on=true;raf=requestAnimationFrame(draw);},stop=()=>{on=false;cancelAnimationFrame(raf);};
  const boot=()=>{size();cv.classList.add('in');if(RM){sec?.classList.remove('intro');draw(performance.now());return;}
    spell();
    const io=new IntersectionObserver(([e])=>e.isIntersecting&&!document.hidden?start():stop());io.observe(cv);
    cleanups.push(()=>{io.disconnect();stop();endGame();});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start(),sig);
    addEventListener('resize',()=>{size();},sig);
    addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();tmx=e.clientX-r.left;tmy=e.clientY-r.top;if(mx<-999){mx=tmx;my=tmy;}},{passive:true,...sig});
    document.addEventListener('pointerleave',()=>{if(!g)tmx=tmy=-9999;},sig);
    cv.parentElement.addEventListener('pointerdown',e=>{if(g){if(g.over&&!(e.target as HTMLElement).closest('button'))reset();return;}if(e.pointerType==='mouse')return;const r=cv.getBoundingClientRect();tmx=mx=e.clientX-r.left;tmy=my=e.clientY-r.top;touchT=performance.now();},{passive:true,...sig});
    playBtn?.addEventListener('click',startGame,sig);
    ui?.querySelector('[data-pong-x]')?.addEventListener('click',endGame,sig);
    ui?.querySelectorAll<HTMLElement>('[data-h]').forEach(b=>b.addEventListener('click',()=>setHand(Number(b.dataset.h)),sig));
    ui?.querySelector('[data-hand-switch]')?.addEventListener('click',()=>{if(handUi){handUi.hidden=false;}},sig);
    addEventListener('keydown',e=>{if(!g)return;if(e.key==='Escape')endGame();if(e.key==='ArrowUp'){keys.up=true;e.preventDefault();}if(e.key==='ArrowDown'){keys.down=true;e.preventDefault();}if(e.key==='ArrowLeft'){keys.left=true;e.preventDefault();}if(e.key==='ArrowRight'){keys.right=true;e.preventDefault();}},sig);
    addEventListener('keyup',e=>{if(e.key==='ArrowUp')keys.up=false;if(e.key==='ArrowDown')keys.down=false;if(e.key==='ArrowLeft')keys.left=false;if(e.key==='ArrowRight')keys.right=false;},sig);};
  const ric=(window as any).requestIdleCallback||((f)=>setTimeout(f,300));
  const go=()=>ric(boot,{timeout:sec?250:2500});   /* the opening should not wait for idle */let id:any;if(document.readyState==='complete')id=go();else addEventListener('load',()=>{id=go();},{once:true,...sig});cleanups.push(()=>{(window as any).cancelIdleCallback?.(id);clearTimeout(id);});
}

/* ---------- pinned horizontal capability panels ---------- */
function hscroll(sig){
  const sec=document.querySelector<HTMLElement>('[data-hscroll]');if(!sec)return;
  const track=sec.querySelector<HTMLElement>('[data-htrack]'),count=sec.querySelector('[data-hcount]');
  const panels=[...track.querySelectorAll<HTMLElement>('.hpanel:not(.hp-end)')];
  const on=()=>!RM&&innerWidth>=900;
  let dist=0;
  const measure=()=>{if(!on()){sec.style.height='';track.style.transform='';sec.classList.remove('pinned');return;}
    sec.classList.add('pinned');dist=Math.max(0,track.scrollWidth-innerWidth);sec.style.height=`${innerHeight+dist}px`;upd();};
  const upd=()=>{if(!on())return;const r=sec.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,dist));
    track.style.transform=`translate3d(${-p*dist}px,0,0)`;
    const i=Math.min(panels.length-1,Math.floor(p*(panels.length+.6)));count.textContent=String(i+1).padStart(2,'0');};
  addEventListener('scroll',upd,{passive:true,...sig});addEventListener('resize',measure,sig);
  measure();document.fonts?.ready.then(measure);
  /* phones: native swipe, with the counter, dots and a focus effect following the card in view */
  const all=[...track.querySelectorAll<HTMLElement>('.hpanel')];
  const dots=document.createElement('div');dots.className='hdots';dots.setAttribute('aria-hidden','true');dots.innerHTML=all.map(()=>'<i></i>').join('');track.after(dots);
  const swipe=()=>{if(on())return;const mid=track.scrollLeft+track.clientWidth/2;let best=0,bd=1e9;
    all.forEach((p,i)=>{const c=p.offsetLeft+p.offsetWidth/2,d=Math.abs(c-mid);if(d<bd){bd=d;best=i;}});
    all.forEach((p,i)=>p.classList.toggle('dim',i!==best));[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===best));
    count.textContent=String(Math.min(best,panels.length-1)+1).padStart(2,'0');};
  track.addEventListener('scroll',()=>requestAnimationFrame(swipe),{passive:true,...sig});swipe();
}

/* ---------- list rows with a preview that follows the cursor ---------- */
function hoverPreview(sig){
  const list=document.querySelector<HTMLElement>('[data-hoverlist]'),box=document.querySelector<HTMLElement>('[data-preview-box]');
  if(!list||!box||!FINE)return;
  const pvs=[...box.querySelectorAll<HTMLElement>('[data-pv]')];
  let x=0,y=0,tx=0,ty=0,raf=0,shown=false;
  const loop=()=>{const dx=tx-x;x+=dx*.16;y+=(ty-y)*.16;
    box.style.transform=`translate3d(${x}px,${y}px,0) rotate(${clamp(dx*.06,-8,8)}deg)`;raf=requestAnimationFrame(loop);};
  list.addEventListener('pointermove',e=>{tx=e.clientX+24;ty=e.clientY-120;if(!shown){x=tx;y=ty;}},sig);
  list.querySelectorAll<HTMLElement>('[data-preview]').forEach(a=>a.addEventListener('pointerenter',()=>{
    pvs.forEach(p=>p.classList.toggle('on',p.dataset.pv===a.dataset.preview));
    if(!shown){shown=true;box.classList.add('show');raf=requestAnimationFrame(loop);}},sig));
  const hide=()=>{shown=false;box.classList.remove('show');cancelAnimationFrame(raf);};
  list.addEventListener('pointerleave',hide,sig);
  addEventListener('scroll',()=>{if(!shown)return;const el=document.elementFromPoint(tx-24,ty+120);if(!el||!list.contains(el))hide();},{passive:true,...sig});
  cleanups.push(()=>{cancelAnimationFrame(raf);box.classList.remove('show');});
}

/* ---------- challenge finder ---------- */
function finder(){
  const root=document.querySelector('[data-finder]');if(!root)return;
  const btns=[...root.querySelectorAll<HTMLElement>('[data-f]')],panels=[...root.querySelectorAll<HTMLElement>('[data-fa]')];
  btns.forEach(b=>b.addEventListener('click',()=>{const i=b.dataset.f;
    btns.forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',String(on));});
    panels.forEach(p=>{const on=p.dataset.fa===i;p.hidden=!on;p.classList.toggle('on',on);});
  },{signal:ac.signal}));
}

/* ---------- work filters (also honours ?ind= and #case deep links) ---------- */
function filters(){
  const root=document.querySelector('[data-filters]');if(!root)return;
  const cases=[...document.querySelectorAll<HTMLElement>('.cases.grid .case')];
  const count=root.querySelector('[data-fcount]'),empty=document.querySelector<HTMLElement>('[data-empty]');
  const st={cap:'all',ind:new URLSearchParams(location.search).get('ind')||'all'};
  const apply=()=>{let n=0;
    cases.forEach(c=>{const ok=(st.cap==='all'||c.dataset.caps.split(' ').includes(st.cap))&&(st.ind==='all'||c.dataset.ind===st.ind);c.classList.toggle('out',!ok);if(ok)n++;});
    count.textContent=String(n);empty.hidden=n>0;
    root.querySelectorAll<HTMLElement>('[data-fcap]').forEach(b=>{const on=b.dataset.fcap===st.cap;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
    root.querySelectorAll<HTMLElement>('[data-find]').forEach(b=>{const on=b.dataset.find===st.ind;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});};
  root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('button');if(!b)return;
    if(b.dataset.fcap)st.cap=b.dataset.fcap;if(b.dataset.find)st.ind=b.dataset.find;apply();},{signal:ac.signal});
  document.querySelector('[data-freset]')?.addEventListener('click',()=>{st.cap='all';st.ind='all';apply();},{signal:ac.signal});
  apply();
  const id=location.hash.slice(1);const hit=id&&document.getElementById(id);
  if(hit){hit.classList.add('hit');(hit.querySelector('details') as HTMLDetailsElement).open=true;setTimeout(()=>hit.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),500);}
}

/* ---------- industry tabs (deep-linkable via #id) ---------- */
function tabs(sig){
  const root=document.querySelector('[data-tabs]');if(!root)return;
  const btns=[...root.querySelectorAll<HTMLElement>('[data-tab]')],panels=[...root.querySelectorAll<HTMLElement>('.tab-panel')];
  const show=(id,push)=>{if(!panels.some(p=>p.id===id))return;
    btns.forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
    panels.forEach(p=>p.classList.toggle('on',p.id===id));
    if(push)history.replaceState(null,'','#'+id);};
  btns.forEach(b=>b.addEventListener('click',()=>{show(b.dataset.tab,true);if(innerWidth<1024)root.querySelector('.tab-panels').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});},sig));
  const h=location.hash.slice(1);if(h)show(h,false);
  addEventListener('hashchange',()=>show(location.hash.slice(1),false),sig);
}

/* ---------- sticky steps on /approach ---------- */
function stickySteps(sig){
  const steps=[...document.querySelectorAll<HTMLElement>('[data-ss]')];if(!steps.length)return;
  const idx=[...document.querySelectorAll<HTMLElement>('[data-ss-i]')],bar=document.querySelector<HTMLElement>('[data-ss-bar]');
  const set=i=>{steps.forEach((s,k)=>s.classList.toggle('on',k===i));idx.forEach((s,k)=>s.classList.toggle('on',k===i));bar?.style.setProperty('--sp',String((i+1)/steps.length));};
  let cur=-1;
  const upd=()=>{const mid=innerHeight/2;let best=0,bd=Infinity;
    steps.forEach((s,k)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=k;}});
    if(best!==cur){cur=best;set(best);}};
  addEventListener('scroll',upd,{passive:true,...sig});upd();
}

/* ---------- magnetic buttons ---------- */
function magnetic(sig){
  if(!FINE||RM)return;
  document.querySelectorAll<HTMLElement>('.mag').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${x*.18}px,${y*.3}px)`;},sig);
    b.addEventListener('pointerleave',()=>{b.style.transform='';},sig);
  });
}

/* ---------- insights: filter by topic ---------- */
function insightFilter(){
  const box=document.querySelector<HTMLElement>('[data-icards]');if(!box)return;
  const btns=[...document.querySelectorAll<HTMLButtonElement>('[data-itag]')];
  btns.forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.itag;
    btns.forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});
    box.querySelectorAll<HTMLElement>('[data-tag]').forEach(c=>{const show=t==='All'||c.dataset.tag===t;c.hidden=!show;if(show)c.classList.add('in');});}));
}

/* ---------- phones: one clear next step, always a thumb away ----------
   Appears once the hero has gone, hides near the footer call to action
   and on pages that are already the next step. */
function mobileCta(sig){
  const b=document.getElementById('mcta');if(!b)return;
  const p=location.pathname,sme=p.startsWith('/digitalsme');
  const off=p==='/contact'||p.startsWith('/portal')||p.startsWith('/tools')||p==='/digitalsme/terms';
  b.setAttribute('href',sme?'#quote':'/contact');b.querySelector('span').textContent=sme?'Build my quote':'Start a project';
  const foot=document.querySelector('.foot-cta');
  const upd=()=>{if(off){b.classList.remove('on');return;}
    const fr=foot?.getBoundingClientRect();const nearFoot=fr&&fr.top<innerHeight;
    const show=scrollY>innerHeight*.9&&!nearFoot&&!document.body.classList.contains('menu-open');
    b.classList.toggle('on',show);b.setAttribute('aria-hidden',String(!show));b.tabIndex=show?0:-1;};
  addEventListener('scroll',upd,{passive:true,...sig});upd();
}

/* ---------- opening: four beats, driven by scroll ----------
   The section is tall and its inner frame is pinned. Scroll progress picks
   the beat; the proxies light one by one across the second beat; the bar
   at the foot shows how far through. Reduced motion stacks every beat. */
function opening(sig){
  const sec=document.querySelector<HTMLElement>('[data-open]');if(!sec)return;
  if(RM){sec.classList.add('static');sec.classList.remove('intro');return;}
  const beats=[...sec.querySelectorAll<HTMLElement>('.beat')],prox=[...sec.querySelectorAll<HTMLElement>('.proxies span')],bar=sec.querySelector<HTMLElement>('.open-bar i');
  const cuts=[0,.17,.4,.58,.78];
  const upd=()=>{const r=sec.getBoundingClientRect(),run=r.height-innerHeight;const p=clamp(-r.top/Math.max(1,run));
    let cur=0;cuts.forEach((c,i)=>{if(p>=c)cur=i;});
    beats.forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('off',i<cur);b.classList.toggle('pre',i>cur);});
    const q=clamp((p-.24)/.28);const lit=Math.ceil(q*prox.length);prox.forEach((s,i)=>s.classList.toggle('lit',i<lit));
    bar?.style.setProperty('--p',String(p));};
  addEventListener('scroll',upd,{passive:true,...sig});addEventListener('resize',upd,sig);upd();
}
