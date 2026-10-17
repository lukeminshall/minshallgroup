/* =====================================================================
   COMPONENTS — reusable markup builders shared across pages.
   Everything returns a string, so pages can be prerendered in Node.
   ===================================================================== */
import {GFX} from './graphics';
import {CAPS,INDUSTRIES} from './content';
import {dot} from './brand';

export const capBySlug=s=>CAPS.find(c=>c.slug===s);
export const indById=s=>INDUSTRIES.find(i=>i.id===s);
export const gfx=(k)=>GFX[k]?GFX[k]():'';

/* split a headline into masked words so it can rise in, word by word.
   Words may contain inline markup (e.g. <em>return</em>) as long as the
   tag does not span a space. */
export function split(text,start=0){
  return text.split(' ').map((w,i)=>`<span class="w"><span style="--i:${i+start}">${w}</span></span>`).join(' ');
}

export const eyebrow=(t)=>`<span class="eyebrow">${t}</span>`;

/* split into words AND letters, for the variable-font hero that responds
   to the cursor. Supports a single <em>…</em> wrapper per word. */
export function splitLetters(text,start=0){
  return text.split(' ').map((w,i)=>{
    const m=w.match(/^<em>(.*?)<\/em>(.*)$/);
    const chars=(t)=>[...t].map(c=>`<span class="ch">${c}</span>`).join('');
    const inner=m?`<em>${chars(m[1])}</em>${chars(m[2])}`:chars(w);
    return `<span class="w"><span style="--i:${i+start}">${inner}</span></span>`;
  }).join(' ');
}

export function shead(o){
  return `<div class="shead${o.center?' center':''}">
    <div class="reveal">${o.eyebrow?eyebrow(o.eyebrow):''}<h2 class="h2">${o.h}</h2></div>
    ${o.p||o.link?`<div class="shead-r reveal" style="--i:1">${o.p?`<p>${o.p}</p>`:''}${o.link?`<a class="tlink" href="${o.link[1]}">${o.link[0]}</a>`:''}</div>`:''}
  </div>`;
}

/* navy page header with animated backdrop */
export function phead(o){
  return `<header class="phead dark${o.tall?' tall':''}">
    <div class="grain" aria-hidden="true"></div>
    <div class="wrap phead-in${o.gfx?' with-gfx':''}">
      <div>
        ${o.crumb?`<nav class="crumb rise" style="--i:0" aria-label="Breadcrumb">${o.crumb}</nav>`:''}
        ${o.kicker?`<h1 class="eyebrow kicker rise" style="--i:0">${o.kicker}</h1>`:o.eyebrow?`<span class="eyebrow rise" style="--i:0">${o.eyebrow}</span>`:''}
        <${o.kicker?'p':'h1'} class="display split">${split(o.title.replace(/\.$/,''),1)}${dot}</${o.kicker?'p':'h1'}>
        ${o.lede?`<p class="lede rise" style="--i:4">${o.lede}</p>`:''}
        ${o.actions?`<div class="actions rise" style="--i:5">${o.actions}</div>`:''}
        ${o.meta?`<div class="phead-meta rise" style="--i:6">${o.meta}</div>`:''}
      </div>
      ${o.gfx?`<div class="phead-gfx rise" style="--i:3">${gfx(o.gfx)}</div>`:''}
    </div>
  </header>`;
}

export const btn=(t,h,ghost=false)=>`<a class="btn mag${ghost?' ghost':''}" href="${h}"><span>${t}</span></a>`;

export function cards(items,cols=3){
  return `<div class="cards c${cols}">${items.map((c,i)=>`
    <${c.href?`a href="${c.href}"`:'div'} class="card reveal" style="--i:${i%cols}">
      ${c.n?`<span class="card-n">${c.n}</span>`:''}
      <h3>${c.t}</h3><p>${c.d}</p>
      ${c.foot?`<span class="card-foot">${c.foot}</span>`:''}
      ${c.href?`<span class="card-arrow" aria-hidden="true">→</span>`:''}
    </${c.href?'a':'div'}>`).join('')}</div>`;
}

export function returnsRow(rs){
  return `<div class="returns">${rs.map((r,i)=>`
    <div class="ret reveal" style="--i:${i}">
      <span class="ret-n">${r.n}</span>
      ${r.gfx?`<div class="ret-gfx">${gfx(r.gfx)}</div>`:''}
      <h3>${r.t}</h3><p>${r.d}</p>
    </div>`).join('')}</div>`;
}

export const capTags=(caps)=>caps.map(s=>{const c=capBySlug(s);return c?`<a class="chip" href="/capabilities/${c.slug}">${c.short}</a>`:''}).join('');

export function caseCard(c,i=0){
  const ind=indById(c.ind);
  return `<article class="case reveal" style="--i:${i%3}" data-caps="${c.caps.join(' ')}" data-ind="${c.ind}">
    <div class="case-gfx">${gfx(c.gfx)}</div>
    <div class="case-body">
      <span class="case-meta">${c.client}${ind?` · ${ind.t}`:''}</span>${c.status?`<span class="case-status">${c.status}</span>`:''}
      <h3>${c.head}</h3>
      <p>${c.ch}</p>
      <details class="case-more"><summary>What we did and the return</summary>
        <p><b>What we did.</b> ${c.ap}</p>
        <p class="case-ret"><b>The return.</b> ${c.ret}</p>
      </details>
      <div class="chips">${capTags(c.caps)}</div>
    </div>
  </article>`;
}

export function marquee(items){
  const row=items.map(t=>`<span>${t}</span><i aria-hidden="true"></i>`).join('');
  return `<div class="marquee" aria-label="Selected clients"><div class="marquee-track"><div class="marquee-row">${row}</div><div class="marquee-row" aria-hidden="true">${row}</div></div></div>`;
}

export function insightCard(a,i=0){
  const d=new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  return `<a class="icard reveal" data-cursor="Read" style="--i:${i%3}" href="/insights/${a.slug}">
    <span class="icard-tag">${a.tag}</span>
    <h3>${a.t}</h3><p>${a.d}</p>
    <span class="icard-meta">${d} · ${a.mins} min read</span>
  </a>`;
}

export function ctaBand(h,p?,links?){
  return `<section class="cta-band"><div class="wrap cta-in">
    <div class="reveal"><h2 class="h1">${h}${dot}</h2>${p?`<p class="lede">${p}</p>`:''}</div>
    <div class="actions reveal" style="--i:1">${links||`${btn('Start a conversation','/contact')}${btn('See the work','/work',true)}`}</div>
  </div></section>`;
}
