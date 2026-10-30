/* =====================================================================
   GRAPHIC SYSTEM — navy + pink line-work drawn from what the group does.
   No stock photography. Everything below is generated SVG.
   ===================================================================== */
function rnd(s){const x=Math.sin(s*99.13)*43758.5453;return x-Math.floor(x);}
function smoothClosed(p){
  const n=p.length;let d=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){
    const p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n];
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }return d+'Z';
}
function blob(cx,cy,r,jit,seed,n=12){
  const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const rr=r*(1+(rnd(seed+i*1.7)-.5)*jit);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  return smoothClosed(pts);
}
/* unique id per graphic instance so gradients never cross-reference */
let GID=0;const uid=p=>p+(++GID);
/* catchment / isochrone — health, DataLense */
export function gCatchment(){
  const g=uid('cg'),cx=240,cy=180;
  let dots='';for(let x=40;x<=440;x+=44)for(let y=32;y<=328;y+=44)dots+=`<circle class="grid" cx="${x}" cy="${y}" r="1.1"/>`;
  let routes='';[[26,44],[456,66],[430,326],[54,300]].forEach(([x,y])=>routes+=`<line class="gl" style="stroke-dasharray:2 6" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`);
  const pins=[[150,116],[334,142],[300,254],[166,246],[356,232]].map(([x,y],i)=>i%2
    ?`<g><circle class="ring" cx="${x}" cy="${y}" r="5"/><circle class="dot" cx="${x}" cy="${y}" r="2.3"/></g>`
    :`<circle class="dot" cx="${x}" cy="${y}" r="3.2"/>`).join('');
  return `<svg class="gfx" viewBox="0 0 480 360" role="img" aria-label="Drivetime catchment rings around a site with nearby providers">
    <defs><radialGradient id="${g}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--pink)" stop-opacity="0.24"/>
      <stop offset="68%" stop-color="var(--pink)" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="var(--pink)" stop-opacity="0"/></radialGradient></defs>
    <g>${dots}</g>${routes}
    <path class="s-soft" d="${blob(cx,cy,152,.17,3)}"/>
    <path class="s-soft" d="${blob(cx,cy,112,.15,11)}"/>
    <path class="s" d="${blob(cx,cy,74,.14,23)}"/>
    <path class="breathe" fill="url(#${g})" stroke="none" d="${blob(cx,cy,74,.14,23)}"/>
    <circle class="pulse-ring" style="animation-delay:0s" cx="${cx}" cy="${cy}" r="15"/>
    <circle class="pulse-ring" style="animation-delay:1.7s" cx="${cx}" cy="${cy}" r="15"/>
    <circle class="dot-p" cx="${cx}" cy="${cy}" r="5.5"/>
    ${pins}
    <text x="${cx+10}" y="${cy-72}">20 min</text>
    <text x="${cx+10}" y="${cy-38}">10 min</text>
  </svg>`;
}
/* network — engagements to outcomes, with travelling signal pulses */
export function gNetwork(){
  const L=[[112,98],[112,180],[112,262]],R=[[368,120],[368,200],[368,280]];
  const links=[[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]],hot=[1,0],flow=[[0,1],[1,0],[2,2]];
  let base='',glow='';
  links.forEach(([a,b])=>{const s=L[a],e=R[b],h=(a===hot[0]&&b===hot[1]);
    const d=`M${s[0]} ${s[1]} C${s[0]+120} ${s[1]}, ${e[0]-120} ${e[1]}, ${e[0]} ${e[1]}`;
    base+=`<path class="${h?'p':'s-soft'}" fill="none" d="${d}"/>`;
    if(flow.some(f=>f[0]===a&&f[1]===b))glow+=`<path class="flow" fill="none" stroke="var(--pink)" stroke-width="2" d="${d}"/>`;});
  let nodes='';L.forEach(p=>nodes+=`<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="4.5"/>`);
  R.forEach((p,i)=>{nodes+= i===0
    ?`<circle class="pulse-ring" cx="${p[0]}" cy="${p[1]}" r="10"/><circle class="dot-p" cx="${p[0]}" cy="${p[1]}" r="6.5"/>`
    :`<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="5"/>`;});
  return `<svg class="gfx" viewBox="86 60 296 240" aria-label="Client engagements connected to outcomes">
    <text x="112" y="76" text-anchor="middle">Work</text>
    <text x="368" y="76" text-anchor="middle">Return</text>
    ${base}${glow}${nodes}</svg>`;
}
/* return — dashboard-style growth: gridlines, growing bars, trend + arrow */
export function gReturn(){
  const g=uid('rg'),base=300,hs=[70,110,152,208],xs=[122,196,270,344],w=42;
  let gl='';[0,60,120,180].forEach(v=>gl+=`<line class="gl" x1="72" y1="${base-v}" x2="402" y2="${base-v}"/>`);
  let bars='';hs.forEach((h,i)=>{const last=i===hs.length-1;
    bars+=`<rect class="gbar" fill="${last?'var(--pink)':`url(#${g})`}" style="animation-delay:${i*.12}s" x="${xs[i]-w/2}" y="${base-h}" width="${w}" height="${h}"/>`;});
  const tl=xs.map((x,i)=>`${x} ${base-hs[i]-16}`).join(' L');
  const ex=xs[3],ey=base-hs[3]-16;
  return `<svg class="gfx" viewBox="62 60 360 252" aria-label="Return growing across engagements">
    <defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="var(--ink)" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="var(--ink)" stop-opacity="0.9"/></linearGradient></defs>
    ${gl}
    <line class="s" x1="72" y1="${base}" x2="402" y2="${base}"/>
    ${bars}
    <path class="p" fill="none" d="M${tl}"/>
    <path class="fill-p" d="M${ex} ${ey-7} L${ex+7} ${ey+5} L${ex-7} ${ey+5} Z"/>
  </svg>`;
}
/* ridgeline — population health signature with highlighted peak */
export function gRidge(){
  const g=uid('gg'),rows=7,top=78,gap=34;let out='';let peak=null;
  for(let r=0;r<rows;r++){const y=top+r*gap,hot=r===3;let d=`M46 ${y}`;let pk={x:46,yv:y};
    for(let x=46;x<=434;x+=14){const n=Math.sin((x/38)+(r*1.3))*.55+Math.sin((x/15)+r*.7)*.45;const yy=y-Math.max(0,n)*22;if(yy<pk.yv){pk={x,yv:yy};}d+=` L${x} ${yy.toFixed(1)}`;}
    d+=` L434 ${y+30} L46 ${y+30} Z`;
    if(hot){out+=`<path d="${d}" fill="url(#${g})" class="pk" style="stroke-width:1.8"/>`;peak=pk;}
    else out+=`<path d="${d}" fill="var(--paper)" class="s"/>`;}
  const marker=peak?`<circle class="dot-p pulse-ring-host" cx="${peak.x}" cy="${peak.yv.toFixed(1)}" r="3.6"/><circle class="pulse-ring" cx="${peak.x}" cy="${peak.yv.toFixed(1)}" r="9"/>`:'';
  return `<svg class="gfx" viewBox="40 60 400 262" aria-label="Population health signature, ranked deviations from a national baseline">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--pink)" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>
    ${out}${marker}
    <line class="scan" style="--sw:388px" x1="46" y1="66" x2="46" y2="316" stroke="var(--pink)" stroke-width="1.4" opacity="0"/>
  </svg>`;
}
/* grid field — density map with a focused, pulsing cluster */
export function gGrid(){
  let dots='',hotdots='';const cols=13,rows=8,x0=60,y0=48,sx=30,sy=36;
  const hc0=8,hc1=11,hr0=2,hr1=5;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=x0+c*sx,y=y0+r*sy;
    const hot=c>=hc0&&c<=hc1&&r>=hr0&&r<=hr1;
    if(hot)hotdots+=`<circle class="dot-p" cx="${x}" cy="${y}" r="3.6"/>`;
    else{const op=(.18+.5*(c/cols)).toFixed(2);dots+=`<circle class="dot" cx="${x}" cy="${y}" r="2.3" opacity="${op}"/>`;}}
  const bx0=x0+hc0*sx-12,by0=y0+hr0*sy-12,bx1=x0+hc1*sx+12,by1=y0+hr1*sy+12,L=10;
  const br=`<path class="p" fill="none" d="M${bx0} ${by0+L} L${bx0} ${by0} L${bx0+L} ${by0} M${bx1-L} ${by0} L${bx1} ${by0} L${bx1} ${by0+L} M${bx1} ${by1-L} L${bx1} ${by1} L${bx1-L} ${by1} M${bx0+L} ${by1} L${bx0} ${by1} L${bx0} ${by1-L}"/>`;
  return `<svg class="gfx" viewBox="44 30 392 288" aria-label="Structured data field with a focused cluster">
    ${dots}${br}<g class="cluster">${hotdots}</g></svg>`;
}
/* ---- polar helpers for dial + radar ---- */
const pol=(cx,cy,r,deg)=>{const a=(deg-90)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];};
function arcPath(cx,cy,r,a0,a1){const[x1,y1]=pol(cx,cy,r,a1),[x0,y0]=pol(cx,cy,r,a0);const large=Math.abs(a1-a0)>180?1:0,sweep=a1>a0?1:0;return`M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`;}

/* funnel — conversion of demand */
export function gFunnel(){
  const g=uid('fn');
  const t:[number,number,number,string][]=[[86,394,72,'Demand'],[128,352,130,'Booked'],[172,308,188,'Attended'],[212,268,246,'Converted']];
  let poly='';t.forEach((row,i)=>{const[xl,xr,y,lbl]=row;const n=t[i+1];const y2=y+46;
    const xl2=n?n[0]:xl+30,xr2=n?n[1]:xr-30,last=i===t.length-1;
    poly+=`<path class="${last?'pk':'s'}" fill="${last?`url(#${g})`:'none'}" d="M${xl} ${y} L${xr} ${y} L${xr2} ${y2} L${xl2} ${y2} Z"/>`;
    poly+=`<text x="240" y="${y+30}" text-anchor="middle">${lbl}</text>`;});
  return `<svg class="gfx" viewBox="40 40 400 300" aria-label="Conversion funnel from demand to converted patients">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pink)" stop-opacity=".3"/><stop offset="1" stop-color="var(--pink)" stop-opacity=".08"/></linearGradient></defs>
    ${poly}<circle class="dot-p drop" style="--dh:150px" cx="240" cy="92" r="4.5"/></svg>`;
}
/* dial — market score / return gauge */
export function gDial(){
  const cx=240,cy=214,r=118,a0=-128,a1=128,val=.72;const av=a0+(a1-a0)*val;
  const full=(Math.PI*r*(a1-a0)/180);
  let ticks='';for(let a=a0;a<=a1;a+=(a1-a0)/10){const[x1,y1]=pol(cx,cy,r+6,a),[x2,y2]=pol(cx,cy,r+14,a);ticks+=`<line class="gl" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;}
  const[nx,ny]=pol(cx,cy,r-22,av);
  return `<svg class="gfx" viewBox="90 70 300 210" aria-label="Gauge showing a strong market score">
    ${ticks}
    <path class="s-soft" fill="none" stroke-width="10" d="${arcPath(cx,cy,r,a0,a1)}"/>
    <path class="arc" fill="none" stroke="var(--pink)" stroke-width="10" stroke-linecap="round" style="--al:${full.toFixed(0)};--ao:${(full*(1-val)).toFixed(0)}" d="${arcPath(cx,cy,r,a0,a1)}"/>
    <line class="s" x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke-width="2.4"/>
    <circle class="dot" cx="${cx}" cy="${cy}" r="6"/>
    <text x="${cx}" y="${cy+34}" text-anchor="middle">Market score</text></svg>`;
}
/* pathway — referral to report, with a travelling token */
export function gPathway(){
  const y=182,xs=[70,168,255,342,430],labs=['Refer','Book','Scan','Report','Sent'];
  let seg='';for(let i=0;i<xs.length-1;i++)seg+=`<line class="${i<3?'p':'s-soft'}" x1="${xs[i]}" y1="${y}" x2="${xs[i+1]}" y2="${y}"/>`;
  let nodes='';xs.forEach((x,i)=>{nodes+=`<circle class="${i<4?'dot-p':'dot'}" cx="${x}" cy="${y}" r="${i===3?7:5}"/><text x="${x}" y="${y+30}" text-anchor="middle">${labs[i]}</text>`;});
  return `<svg class="gfx" viewBox="50 130 400 100" aria-label="Referral to report pathway with a case moving through stages">
    ${seg}${nodes}
    <circle class="dot-p track" style="--tw:360px" cx="70" cy="${y-16}" r="4.5"/></svg>`;
}
/* pitch — sport arena */
export function gPitch(){
  const x=70,y=74,w=340,h=212,mx=x+w/2;
  return `<svg class="gfx" viewBox="50 54 380 252" aria-label="Sports pitch with active attacking zone">
    <rect class="s" fill="none" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
    <line class="s-soft" x1="${mx}" y1="${y}" x2="${mx}" y2="${y+h}"/>
    <circle class="s-soft" fill="none" cx="${mx}" cy="${y+h/2}" r="40"/>
    <rect class="s-soft" fill="none" x="${x}" y="${y+h/2-52}" width="56" height="104"/>
    <rect stroke="none" fill="var(--pink)" fill-opacity=".08" x="${x+w-56}" y="${y+h/2-52}" width="56" height="104"/>
    <circle class="pulse-ring" cx="${mx}" cy="${y+h/2}" r="12"/>
    <circle class="dot-p" cx="${mx}" cy="${y+h/2}" r="4.5"/>
    <circle class="dot track" style="--tw:150px" cx="${mx}" cy="${y+h/2}" r="3.4"/></svg>`;
}
/* ecg — athlete vitals / bloods */
export function gECG(){
  let grid='';for(let x=50;x<=430;x+=20)grid+=`<line class="gl" x1="${x}" y1="120" x2="${x}" y2="248"/>`;
  for(let y=120;y<=248;y+=21)grid+=`<line class="gl" x1="50" y1="${y}" x2="430" y2="${y}"/>`;
  const mid=184;let d=`M50 ${mid}`;
  for(let k=0;k<3;k++){const o=50+k*130;
    d+=` L${o+30} ${mid} L${o+40} ${mid-6} L${o+50} ${mid+6} L${o+58} ${mid} L${o+66} ${mid-46} L${o+74} ${mid+30} L${o+82} ${mid} L${o+100} ${mid} L${o+112} ${mid-10} L${o+124} ${mid}`;}
  return `<svg class="gfx" viewBox="44 108 392 152" aria-label="Athlete vitals waveform">
    ${grid}
    <path class="p drawline" style="--dl:900" fill="none" d="${d}"/>
    <circle class="pulse-ring" cx="182" cy="${mid-46}" r="8"/>
    <line class="scan" style="--sw:372px" x1="50" y1="116" x2="50" y2="252" stroke="var(--pink)" stroke-width="1.2" opacity="0"/></svg>`;
}
/* bracket — tournament knockout */
export function gBracket(){
  const y=[86,140,220,274],midT=113,midB=247,fin=180;
  const H=(x0,x1,yy)=>`<line class="s-soft" x1="${x0}" y1="${yy}" x2="${x1}" y2="${yy}"/>`;
  const V=(x,y0,y1)=>`<line class="s-soft" x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/>`;
  let l=H(80,150,y[0])+H(80,150,y[1])+V(150,y[0],y[1])+H(150,200,midT);
  l+=H(80,150,y[2])+H(80,150,y[3])+V(150,y[2],y[3])+H(150,200,midB)+V(200,midT,midB);
  const win=`<path class="p drawline" style="--dl:520" fill="none" d="M80 ${y[0]} L150 ${y[0]} L150 ${midT} L200 ${midT} L200 ${fin} L300 ${fin}"/>`;
  let seeds='';[y[0],y[1],y[2],y[3]].forEach(yy=>seeds+=`<circle class="dot" cx="80" cy="${yy}" r="4"/>`);
  seeds+=`<circle class="dot" cx="200" cy="${midT}" r="4"/><circle class="dot" cx="200" cy="${midB}" r="4"/>`;
  return `<svg class="gfx" viewBox="60 66 300 228" aria-label="Tournament knockout bracket with the winning path highlighted">
    ${l}${win}${seeds}
    <circle class="pulse-ring" cx="300" cy="${fin}" r="10"/><circle class="dot-p" cx="300" cy="${fin}" r="6.5"/></svg>`;
}
/* area — trend over time */
export function gArea(){
  const g=uid('ar'),base=280,x0=60,x1=430;
  const pts=[];for(let i=0;i<=8;i++){const x=x0+(x1-x0)*i/8;const rise=40+i*22+Math.sin(i*1.5)*10;pts.push([x,base-rise]);}
  let gl='';[0,60,120,180].forEach(v=>gl+=`<line class="gl" x1="${x0}" y1="${base-v}" x2="${x1}" y2="${base-v}"/>`);
  const line='M'+pts.map(p=>`${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(' L');
  const area=line+` L${x1} ${base} L${x0} ${base} Z`;
  const end=pts[pts.length-1];
  return `<svg class="gfx" viewBox="46 60 400 250" aria-label="Revenue trend rising over time">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pink)" stop-opacity=".22"/><stop offset="1" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>
    ${gl}<path fill="url(#${g})" stroke="none" d="${area}"/>
    <path class="p drawline" style="--dl:900" fill="none" d="${line}"/>
    <line class="s" x1="${x0}" y1="${base}" x2="${x1}" y2="${base}"/>
    <circle class="pulse-ring" cx="${end[0]}" cy="${end[1]}" r="9"/><circle class="dot-p" cx="${end[0]}" cy="${end[1]}" r="4.5"/></svg>`;
}
/* radar — 12-dimension market score */
export function gRadar(){
  const g=uid('rd'),cx=240,cy=188,R=128,N=12;
  let rings='';[.34,.62,.9].forEach(f=>{let d='';for(let i=0;i<N;i++){const[x,y]=pol(cx,cy,R*f,i*360/N);d+=(i?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);}rings+=`<path class="gl" fill="none" d="${d}Z"/>`;});
  let axes='';for(let i=0;i<N;i++){const[x,y]=pol(cx,cy,R,i*360/N);axes+=`<line class="gl" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;}
  const vals=[.8,.62,.7,.55,.85,.6,.72,.5,.78,.66,.9,.58];
  let d='';vals.forEach((v,i)=>{const[x,y]=pol(cx,cy,R*v,i*360/N);d+=(i?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);});
  const[sx,sy]=pol(cx,cy,R,0);
  return `<svg class="gfx" viewBox="96 52 288 288" aria-label="Radar chart across twelve market dimensions">
    <defs><radialGradient id="${g}"><stop offset="0" stop-color="var(--pink)" stop-opacity=".26"/><stop offset="1" stop-color="var(--pink)" stop-opacity=".08"/></radialGradient></defs>
    ${rings}${axes}
    <path class="pk grow2" fill="url(#${g})" d="${d}Z"/>
    <g class="sweepg"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="none"/><line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="var(--pink)" stroke-width="1.4" opacity=".5"/></g>
    <circle class="dot" cx="${cx}" cy="${cy}" r="3"/></svg>`;
}
/* layers — whole-journey capture spine (Straight Talking) */
export function gLayers(){
  const y=110,xs=[74,160,246,332,418],labs=['Book','Arrive','Procedure','Report','Follow-up'];
  const spine=`<line class="s" x1="74" y1="${y}" x2="418" y2="${y}"/>`;
  let nodes='',lanes='';
  xs.forEach((x,i)=>{nodes+=`<circle class="dot-p seq" style="animation-delay:${i*.5}s" cx="${x}" cy="${y}" r="5.5"/><text x="${x}" y="${y-16}" text-anchor="middle">${labs[i]}</text>`;
    lanes+=`<line class="gl" x1="${x}" y1="${y+14}" x2="${x}" y2="${y+96}"/>`;
    lanes+=`<circle class="dot seq" style="animation-delay:${i*.5+.15}s" cx="${x}" cy="${y+50}" r="3.4"/>`;
    lanes+=`<circle class="dot seq" style="animation-delay:${i*.5+.3}s" cx="${x}" cy="${y+82}" r="3.4"/>`;});
  return `<svg class="gfx" viewBox="52 78 388 172" aria-label="One capture spine across the whole clinical journey">
    ${lanes}${spine}${nodes}</svg>`;
}
/* wave — wellbeing / prevention flow (continuous horizontal drift) */
export function gWave(){
  const g=uid('wv'),W=640,base=250;
  const wave=(amp,off,ybase)=>{let d=`M0 ${ybase}`;for(let x=0;x<=W;x+=16){const yy=ybase+Math.sin((x/44)+off)*amp;d+=` L${x} ${yy.toFixed(1)}`;}return d;};
  return `<svg class="gfx gfx-clip" viewBox="60 90 360 220" aria-label="Flowing waves representing wellbeing pathways">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pink)" stop-opacity=".18"/><stop offset="1" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>
    <g class="waveg" style="--ww:-276px;--wt:9s"><path class="s-soft" fill="none" d="${wave(20,0,base-46)}"/></g>
    <g class="waveg" style="--ww:-276px;--wt:7s"><path fill="url(#${g})" stroke="none" d="${wave(26,1.6,base)} L${W} 320 L0 320 Z"/><path class="p" fill="none" d="${wave(26,1.6,base)}"/></g></svg>`;
}
/* scatter — data / research with regression + outlier */
export function gScatter(){
  const x0=64,x1=428,base=280;let gl='';
  [0,60,120,180].forEach(v=>gl+=`<line class="gl" x1="${x0}" y1="${base-v}" x2="${x1}" y2="${base-v}"/>`);
  let dots='';const pt=[[.1,.2],[.18,.28],[.26,.22],[.32,.4],[.4,.36],[.46,.5],[.54,.46],[.6,.62],[.68,.58],[.76,.7],[.84,.66],[.92,.8]];
  pt.forEach(([fx,fy])=>{const x=x0+(x1-x0)*fx,y=base-190*fy;dots+=`<circle class="dot" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.4" opacity=".7"/>`;});
  const ox=(x0+(x1-x0)*.5).toFixed(0),oy=(base-190*.82).toFixed(0);
  const outlier=`<circle class="pulse-ring" cx="${ox}" cy="${oy}" r="9"/><circle class="dot-p" cx="${ox}" cy="${oy}" r="4.5"/>`;
  const reg=`<line class="p drawline" style="--dl:420" x1="${x0}" y1="${(base-190*.22).toFixed(0)}" x2="${x1}" y2="${(base-190*.74).toFixed(0)}"/>`;
  return `<svg class="gfx" viewBox="50 60 400 250" aria-label="Scatter of data points with a trend line and an outlier">
    ${gl}<line class="s" x1="${x0}" y1="${base}" x2="${x1}" y2="${base}"/>${reg}${dots}${outlier}</svg>`;
}
export const GFX={catchment:gCatchment,network:gNetwork,return:gReturn,ridge:gRidge,grid:gGrid,funnel:gFunnel,dial:gDial,pathway:gPathway,pitch:gPitch,ecg:gECG,bracket:gBracket,area:gArea,radar:gRadar,layers:gLayers,wave:gWave,scatter:gScatter};
