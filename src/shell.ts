/* =====================================================================
   SHELL — header navigation, mobile menu and footer markup.
   Pure string builders (no DOM access) so the prerenderer can bake them
   into every HTML file; nav.ts wires the behaviour on the client.
   ===================================================================== */
import {CAPS,PRODUCTS,INSIGHTS,INDUSTRIES,LANDINGS,LEGAL,CONTACT} from './content';
import {tile,dot} from './brand';

export const NAV=[
  {label:'Capabilities',href:'/capabilities',mega:'caps'},
  {label:'Websites',href:'/digitalsme',mega:'web'},
  {label:'Products',href:'/products',mega:'products'},
  {label:'Work',href:'/work'},
  {label:'Insights',href:'/insights'},
  {label:'About',href:'/about'}
];

function megaCaps(){
  const latest=INSIGHTS[0];
  return `<div class="mega" role="region" aria-label="Capabilities"><div class="wrap mega-in">
    <div class="mega-grid c4">${CAPS.map(c=>`
      <a class="mega-link" href="/capabilities/${c.slug}"><span class="mn">${c.n}</span><b>${c.t}</b><span>${c.line}</span></a>`).join('')}
    </div>
    <div class="mega-side">
      <span class="eyebrow">By sector</span>
      <ul class="mega-ind">${INDUSTRIES.map(x=>`<li><a href="/industries#${x.id}">${x.t}</a></li>`).join('')}</ul>
      <a class="mega-feature" href="/insights/${latest.slug}"><b>${latest.t}</b><em>Latest thinking · ${latest.mins} min</em></a>
      <div class="mega-links"><a class="tlink" href="/capabilities">All capabilities</a><a class="tlink" href="/approach">How we work</a></div>
    </div></div></div>`;
}
/* websites and digital support for small businesses */
export const WEB_LINKS=[
  {mn:'Free',t:'Website check',d:'Your Webmins Score, fixes and a recommended package in 20 seconds.',h:'/digitalsme'},
  {mn:'From £495',t:'Website packages',d:'Refresh, Rebuild or Grow. Fixed prices, paid in three stages.',h:'/digitalsme#packages'},
  {mn:'£150 a year',t:'Hosting and support',d:'Hosting, your domain secured and pointed, and help after launch.',h:'/digitalsme#support'},
  {mn:'Two minutes',t:'Build your quote',d:'Pick a package and add-ons, and see your price straight away.',h:'/digitalsme#quote'}
];
function megaWeb(){
  return `<div class="mega" role="region" aria-label="Websites"><div class="wrap mega-in">
    <div class="mega-grid c4">${WEB_LINKS.map(l=>`
      <a class="mega-link" href="${l.h}"><span class="mn">${l.mn}</span><b>${l.t}</b><span>${l.d}</span></a>`).join('')}
    </div>
    <div class="mega-side">
      <span class="eyebrow">Bigger projects</span>
      <p>Platforms, portals, apps, data and AI for growing and larger organisations.</p>
      <a class="tlink" href="/digital-consultancy">Digital consultancy</a>
      <a class="tlink" href="/capabilities/digital">Digital &amp; Product practice</a>
      <a class="mega-sme" href="/portal"><b>Already a client?</b> Log in to your project →</a>
    </div></div></div>`;
}
function megaProducts(){
  return `<div class="mega" role="region" aria-label="Products"><div class="wrap mega-in">
    <div class="mega-grid c2">${PRODUCTS.map(p=>`
      <a class="mega-link" href="/products/${p.slug}"><span class="mn">${p.status}</span><b>${p.t}</b><span>${p.line} ${p.d}</span></a>`).join('')}
    </div>
    <div class="mega-side">
      <span class="eyebrow">A Minshall Group company</span>
      <p>Products we own and operate. Each began as client work and became an asset that earns.</p>
      <a class="tlink" href="/products">All products</a>
    </div></div></div>`;
}

export function navMarkup(){
  return NAV.map((g,i)=>g.mega
    ?`<div class="navitem has-mega" data-i="${i}"><a class="navbtn" href="${g.href}" aria-expanded="false" aria-haspopup="true">${g.label}<svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></a>${g.mega==='caps'?megaCaps():g.mega==='web'?megaWeb():megaProducts()}</div>`
    :`<div class="navitem" data-i="${i}"><a class="navbtn" href="${g.href}">${g.label}</a></div>`).join('')
    +`<button class="navbtn head-srch" type="button" data-srch><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><span class="sr">Search</span><kbd aria-hidden="true">⌘K</kbd></button><a class="navbtn head-login" href="/portal">Log in</a><a class="btn sm mag head-cta" href="/contact"><span>Start a project</span></a>`;
}

export function mobileNavMarkup(){
  /* big numbered items; the two groups open in place rather than making one long list */
  const groups:[string,string,[string,string][]?][]=[
    ['Capabilities','/capabilities',CAPS.map(c=>[c.t,'/capabilities/'+c.slug] as [string,string])],
    ['Websites','/digitalsme',WEB_LINKS.map(l=>[l.t,l.h] as [string,string])],
    ['Work','/work'],['Industries','/industries'],['Products','/products'],['Approach','/approach'],['Insights','/insights'],['About','/about']];
  return `<div class="mnav-in"><nav aria-label="Mobile"><ol class="mn-list">${groups.map(([t,h,subs],i)=>`
    <li class="mn-item" style="--i:${i}"><div class="mn-row"><a class="mn-a" href="${h}"><span class="mn-n">0${i+1}</span>${t}</a>${subs?`<button class="mn-tog" type="button" aria-expanded="false" aria-label="Show ${t} pages"><i></i></button>`:''}</div>
      ${subs?`<ul class="mn-sub" hidden>${subs.map(([st,sh])=>`<li><a href="${sh}">${st}</a></li>`).join('')}</ul>`:''}</li>`).join('')}</ol></nav>
    <div class="mn-foot" style="--i:${groups.length}">
      <a class="btn mn-cta" href="/contact"><span>Start a project</span></a>
      <div class="mn-links"><a href="/digitalsme">Free website check</a><a href="/portal">Client login</a><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></div>
    </div></div>`;
}

export function footerMarkup(){
  return `<div class="foot-cta"><div class="wrap">
      <span class="eyebrow on-dark">Start a conversation</span>
      <a class="foot-big" href="/contact"><span>Let’s move</span> <span class="nw"><em>the number</em>${dot}<span class="foot-arrow" aria-hidden="true">→</span></span></a>
      <div class="foot-forms">
        <form class="enq-form foot-form" novalidate aria-labelledby="fq-h">
          <h2 class="fh" id="fq-h">Quick enquiry</h2>
          <p class="hp" hidden aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
          <input type="hidden" name="interest" value="Quick enquiry">
          <div class="fq-row"><label class="sr" for="fq-name">Your name</label><input id="fq-name" name="name" required autocomplete="name" placeholder="Your name"><label class="sr" for="fq-email">Email</label><input id="fq-email" name="email" type="email" required autocomplete="email" placeholder="Email"></div>
          <label class="sr" for="fq-msg">What do you need?</label><textarea id="fq-msg" name="message" rows="2" required placeholder="The number you want to move, in a sentence"></textarea>
          <div class="fq-foot"><button class="btn sm" type="submit"><span>Send enquiry</span></button><p class="cform-status" role="status" aria-live="polite"></p></div>
        </form>
        <form class="sub-form foot-sub" data-source="footer" novalidate aria-labelledby="fn-h">
          <h2 class="fh" id="fn-h">Newsletter</h2>
          <p class="fn-p">Practical ideas on strategy, websites and growth, once a month.</p>
          <p class="hp" hidden aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
          <div class="sub-row"><label class="sr" for="fn-email">Email address</label><input id="fn-email" name="email" type="email" required autocomplete="email" placeholder="you@company.co.uk"><button class="btn sm" type="submit"><span>Subscribe</span></button></div>
          <label class="sub-consent"><input type="checkbox" name="consent" required> <span>Yes, send me emails from Minshall Group. See our <a href="/privacy">privacy notice</a>.</span></label>
          <p class="sub-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div></div>
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <a class="lockup rev" href="/">${tile()}<span class="wm"><b>minshall</b><i>GROUP</i></span></a>
        <p>Strategy, digital, data and brand, under one roof and measured by the return.</p>
        <p><a class="ulink" href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
      </div>
      <div><h2 class="fh">Capabilities</h2><ul>${CAPS.map(c=>`<li><a href="/capabilities/${c.slug}">${c.t}</a></li>`).join('')}</ul></div>
      <div><h2 class="fh">Industries</h2><ul>${INDUSTRIES.map(x=>`<li><a href="/industries#${x.id}">${x.t}</a></li>`).join('')}</ul>
        <h2 class="fh foot-h2">Consultancy</h2><ul>${LANDINGS.map(L=>`<li><a href="/${L.slug}">${L.eyebrow}</a></li>`).join('')}<li><a href="/digitalsme">Websites for small businesses, from £495</a></li></ul></div>
      <div><h2 class="fh">Group</h2><ul><li><a href="/work">Case studies</a></li><li><a href="/approach">Approach</a></li><li><a href="/insights">Insights</a></li><li><a href="/about">About us</a></li><li><a href="/contact">Contact</a></li><li><a href="/portal">Client login</a></li>${PRODUCTS.map(p=>`<li><a href="/products/${p.slug}">${p.t}</a></li>`).join('')}</ul></div>
    </div>
    <div class="wrap foot-base"><span>© ${new Date().getFullYear()} ${LEGAL.trading}. Formerly Knexu. <a href="/privacy">Privacy</a> · <a href="/privacy#cookies" data-cookie-settings>Cookie settings</a></span><span>${LEGAL.trading} is a trading name of ${LEGAL.company}, registered in ${LEGAL.reg.replace('&','&amp;')}, company no. ${LEGAL.number}. Registered office: ${LEGAL.office}.</span></div>`;
}
