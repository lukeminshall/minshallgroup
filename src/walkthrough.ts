/* =====================================================================
   PLACEBOARD WALKTHROUGH — the product end to end, in numbered stages,
   for running a demo: sign in, set up the board, invite businesses, a
   business sends a request, it lands on the board, the officer checks
   and approves it, copies the website code, sees it appear on their
   website, then opens the results. One stage on screen at a time, with
   Back and Next (and the arrow keys), and #step-N links straight to a
   stage. What is chosen in one stage carries into the next: the colour,
   the channels and the request itself. Set in Ripon with example people,
   businesses and numbers; nothing typed here leaves the page.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';
import {dashboard,esc} from './place';
import {RIPON} from './placeboard';

const HOST='ripon.theplaceboard.com';
const OFFICER={name:'Sam Carter',role:'Town centre manager',email:'sam@example.org'};
const ACCENTS:[string,string][]=[['#FF2E63','Pink'],['#0A6E4F','Green'],['#1D4ED8','Blue'],['#7C3AED','Purple'],['#B45309','Amber']];
const TYPE:Record<string,string>={event:'Event',offer:'Offer',news:'News',listing:'Listing change'};

type Who='officer'|'business'|'web'|'everyone';
const WHO:Record<Who,string>={officer:'Council or BID officer',business:'A local business',web:'Whoever looks after your website',everyone:'The council, the BID and the committee'};
type Stage={t:string,who:Who,p:string,body:string};

const bar=(url:string,live=false)=>`<div class="pf-bar"><i></i><i></i><i></i><span>${url}</span>${live?'<b class="pf-live"><i></i>Live</b>':''}</div>`;
const sw=(name:string,label:string,on:boolean,note='')=>`<label class="wt-sw"><input type="checkbox" name="${name}"${on?' checked':''}><i aria-hidden="true"></i><span>${label}${note?`<small>${note}</small>`:''}</span></label>`;
/* the board's own top bar once signed in */
const appNav=(on:string)=>`<nav class="wt-app-nav" aria-label="Board sections (example)">${['Home','Requests','Calendar','Results','Settings'].map(t=>`<span${t===on?' class="on"':''}>${t}</span>`).join('')}<b class="wt-me" data-wt-me>${OFFICER.name.split(' ').map(w=>w[0]).join('')}</b></nav>`;

const STAGES:Stage[]=[
{t:'Sign in',who:'officer',
 p:'Each officer has their own login, sent by email, so there are no shared passwords. Everyone is given a role, which sets what they can do.',
 body:`<div class="pf-win">${bar(`${HOST}/sign-in`)}
  <div class="wt-signin">
    <form class="wt-card" data-wt-signin novalidate>
      <span class="wt-logo" data-wt-logo>R</span>
      <h3>Sign in to <span data-wt-board>the Ripon board</span></h3>
      <label class="pf-l">Your work email<input name="email" type="email" value="${OFFICER.email}" autocomplete="off"></label>
      <button class="btn sm" type="submit"><span>Email me a sign-in link</span></button>
      <p class="wt-small" data-wt-signin-msg>We send a one-time link. No password to remember.</p>
    </form>
    <div class="wt-roles"><b>Who can do what</b>
      <ul><li><em>Approver</em>Approves or sends back requests, and signs off plans</li><li><em>Editor</em>Drafts posts and campaign content, but cannot publish</li><li><em>Viewer</em>Sees the plan, the reports and the dashboard, for example the committee</li></ul></div>
  </div></div>`},
{t:'Set up your board',who:'officer',
 p:'Done once, with us, in the set-up session. Name the board, match your colours, choose what businesses can send, who approves it, and where approved posts go.',
 body:`<div class="pf-win">${bar(`${HOST}/settings`)}${appNav('Settings')}
  <form class="wt-setup" data-wt-setup novalidate>
    <div class="wt-col">
      <label class="pf-l">Board name<input name="board" value="the Ripon board" autocomplete="off"></label>
      <fieldset class="wt-fs"><legend class="pf-l">Your colour</legend><div class="wt-swatches">${ACCENTS.map(([c,n],i)=>`<label><input type="radio" name="accent" value="${c}"${i?'':' checked'}><i style="--c:${c}"></i><span class="sr">${n}</span></label>`).join('')}</div></fieldset>
      <fieldset class="wt-fs"><legend class="pf-l">What businesses can send</legend><div class="pf-types wt-multi">${Object.entries(TYPE).map(([v,t])=>`<label><input type="checkbox" name="cat" value="${v}" checked><span>${t}</span></label>`).join('')}</div></fieldset>
      <fieldset class="wt-fs"><legend class="pf-l">Who approves</legend>
        <ul class="wt-people" data-wt-people><li><b>${OFFICER.name}</b><span>${OFFICER.role} · Approver</span></li></ul>
        <div class="wt-add"><input name="person" placeholder="Add a colleague’s email" aria-label="Add a colleague’s email" autocomplete="off"><button type="button" class="btn sm ghost" data-wt-add><span>Add</span></button></div>
      </fieldset>
    </div>
    <div class="wt-col">
      <fieldset class="wt-fs"><legend class="pf-l">Where approved posts go</legend>
        ${sw('web','Your website’s What’s On',true,'The live feed, added in step 7')}
        ${sw('fb','Facebook page',true,'Connected once, by an admin of the page')}
        ${sw('ig','Instagram',true,'Posts and Stories')}
        ${sw('news','Monthly newsletter',false,'Approved items gathered into a draft')}
      </fieldset>
      <div class="wt-preview" data-wt-preview><span class="wt-logo" data-wt-logo>R</span><div><b data-wt-board>the Ripon board</b><small>Your colour is used on the business form and on your website feed.</small></div></div>
    </div>
  </form></div>`},
{t:'Invite your businesses',who:'officer',
 p:'Every business gets the same route in: one link, the same form, the same rules. Share it by email, on social media, in the BID newsletter or on a poster in the window.',
 body:`<div class="pf-win">${bar(`${HOST}/businesses`)}${appNav('Requests')}
  <div class="wt-invite">
    <div class="wt-col">
      <span class="pf-k">Your link for businesses</span>
      <div class="wt-link"><code>${HOST}/share</code><button type="button" class="btn sm ghost" data-pf-copy="https://${HOST}/share"><span>Copy code</span></button></div>
      <div class="wt-email">
        <div class="wt-email-h"><span>To: 38 businesses on your list (example)</span><span>Subject: Share your events and offers with <span data-wt-board>the Ripon board</span></span></div>
        <p>Hello,</p><p>You can now send your events, offers and news to us in one place, and we’ll put them on the town’s What’s On, Facebook and Instagram. It takes two minutes and there’s nothing to install.</p><p><u>${HOST}/share</u></p><p>${OFFICER.name}, ${OFFICER.role}</p>
      </div>
      <button type="button" class="btn sm" data-wt-invite><span>Send the invitations</span></button>
      <p class="wt-small" data-wt-invite-msg>In the demo nothing is sent.</p>
    </div>
    <div class="wt-col">
      <span class="pf-k">Businesses (examples)</span>
      <ul class="wt-biz" data-wt-biz>
        <li><b>Market Square café</b><span class="pf-tag ok">Joined</span></li>
        <li><b>A Kirkgate gift shop</b><span class="pf-tag ok">Joined</span></li>
        <li><b>A cycle shop</b><span class="pf-tag ok">Joined</span></li>
        <li><b>A Westgate pub</b><span class="pf-tag">Invited</span></li>
        <li><b>A bookshop on Fishergate</b><span class="pf-tag">Invited</span></li>
      </ul>
      <div class="wt-poster" style="--c:var(--wt-accent)"><b>Got an event or an offer?</b><span>Share it with <span data-wt-board>the Ripon board</span></span><code>${HOST}/share</code><small>A printable window poster comes with the board</small></div>
    </div>
  </div></div>`},
{t:'A business sends something',who:'business',
 p:'This is what the business sees. No account, no app: a short form on the board’s link. Change anything you like, then send it. It carries through the rest of the demo.',
 body:`<div class="pf-win wt-narrow">${bar(`${HOST}/share`)}
  <form class="pf-form" data-wt-req novalidate>
    <p class="pf-k">For local businesses and partners</p>
    <h3>Share something with <span data-wt-board>the Ripon board</span></h3>
    <label class="pf-l">Your business<input name="biz" value="Market Square café (example)" autocomplete="off"></label>
    <label class="pf-l">Your email<input name="email" value="hello@example.com" autocomplete="off"></label>
    <fieldset class="pf-types" data-wt-types><legend class="pf-l">What would you like to share?</legend>
      ${Object.entries(TYPE).map(([v,t],i)=>`<label data-cat="${v}"><input type="radio" name="type" value="${v}"${i?'':' checked'}><span>${t}</span></label>`).join('')}</fieldset>
    <label class="pf-l">Title<input name="title" value="Supper, then the Hornblower at 9pm" autocomplete="off"></label>
    <label class="pf-l">When<input name="when" value="Thursdays in May, from 6pm" autocomplete="off"></label>
    <label class="pf-l">Link (optional)<input name="link" value="example.com/supper" autocomplete="off"></label>
    <label class="pf-check"><input type="checkbox" name="ok" checked><span>We have permission to use any photos we send.</span></label>
    <button class="btn sm" type="submit"><span>Send for approval</span></button>
    <p class="wt-small" data-wt-req-msg role="status"></p>
  </form></div>`},
{t:'It lands on your board',who:'officer',
 p:'The approver gets an email and sees it on the board straight away, in one queue with everything else that is waiting. Nothing is published yet.',
 body:`<div class="pf-win">${bar(`${HOST}/home`,true)}${appNav('Home')}
  <div class="wt-home">
    <div class="wt-toast" data-wt-toast><b>New request</b><span data-wt-toast-t></span></div>
    <div class="pf-cq-k wt-tiles"><div><span>Waiting for you</span><b data-wt-wait>3</b></div><div><span>Approved this month</span><b data-wt-done>14</b></div><div><span>Average turnaround</span><b>1.8 days</b></div></div>
    <ul class="pf-queue" data-wt-queue>
      <li data-state="wait" class="pf-new" data-wt-mine><div><em data-wt-q-type>Event</em><b data-wt-q-title></b><small data-wt-q-sub></small></div><button type="button" class="btn sm" data-wt-go="6"><span>Open</span></button></li>
      ${RIPON.queue.map(([,label,t,s])=>`<li data-state="wait"><div><em>${label}</em><b>${t}</b><small>${s}</small></div><span class="pf-tag">Waiting</span></li>`).join('')}
    </ul>
  </div></div>`},
{t:'Check and approve',who:'officer',
 p:'One screen shows the request, how it will look on your website and on Facebook, and where it will go. Approve it, or send it back with a comment. Every step is logged.',
 body:`<div class="pf-win">${bar(`${HOST}/requests/1042`)}${appNav('Requests')}
  <div class="wt-review">
    <div class="wt-col">
      <span class="pf-k">The request</span>
      <dl class="wt-dl"><dt>From</dt><dd data-wt-r-biz></dd><dt>Type</dt><dd data-wt-r-type></dd><dt>Title</dt><dd data-wt-r-title></dd><dt>When</dt><dd data-wt-r-when></dd><dt>Photo permission</dt><dd>Confirmed by the business</dd></dl>
      <fieldset class="wt-fs"><legend class="pf-l">Publish to</legend><div data-wt-r-ch></div></fieldset>
      <div class="wt-acts" data-wt-acts>
        <button type="button" class="btn sm" data-wt-approve><span>Approve and publish</span></button>
        <button type="button" class="btn sm ghost" data-wt-back><span>Ask for changes</span></button>
      </div>
      <div class="wt-change" data-wt-change hidden><label class="pf-l">Comment to the business<textarea rows="2">Could you add a photo of the supper menu?</textarea></label><button type="button" class="btn sm ghost" data-wt-send-back><span>Send back</span></button></div>
    </div>
    <div class="wt-col">
      <span class="pf-k">How it will look</span>
      <div class="wt-pv-feed"><span class="wt-d">Just<b>now</b></span><div><em data-wt-pv-type></em><b data-wt-pv-title></b><small data-wt-pv-sub></small></div></div>
      <div class="wt-pv-fb"><div class="wt-pv-fb-h"><span class="wt-logo sm" data-wt-logo>R</span><b data-wt-board>the Ripon board</b><small>Facebook · scheduled</small></div><p data-wt-pv-fb></p><div class="wt-pv-img" aria-hidden="true"></div></div>
      <span class="pf-k">Audit trail</span>
      <ol class="wt-log" data-wt-log></ol>
    </div>
  </div></div>`},
{t:'Copy your website code',who:'web',
 p:'Done once. Two lines go into the What’s On page of the website you already have: WordPress, a council CMS or hand-built. After that it runs itself.',
 body:`<div class="pf-win">${bar(`${HOST}/settings/website`)}${appNav('Settings')}
  <div class="wt-code">
    <div class="wt-col">
      <span class="pf-k">Your website code</span>
      <div class="pb-code"><pre><code data-wt-snippet></code></pre><button type="button" class="btn sm ghost" data-pf-copy="" data-wt-copy><span>Copy code</span></button></div>
      <fieldset class="wt-fs"><legend class="pf-l">Match your website</legend>
        <div class="wt-swatches" data-wt-sw2>${ACCENTS.map(([c,n],i)=>`<label><input type="radio" name="accent2" value="${c}"${i?'':' checked'}><i style="--c:${c}"></i><span class="sr">${n}</span></label>`).join('')}</div>
        ${sw('dark','Dark background',false)}
      </fieldset>
    </div>
    <div class="wt-col">
      <span class="pf-k">On WordPress, for example</span>
      <ol class="wt-howto"><li>Open your What’s On page and choose <b>Edit</b></li><li>Add a <b>Custom HTML</b> block where the listings should go</li><li>Paste the two lines and press <b>Update</b></li></ol>
      <p class="wt-small">No plug-in and no developer. The feed fits any page width, sizes itself to its content and drops past events on its own. If your site is run by a supplier, we send them the code and check it with them.</p>
    </div>
  </div></div>`},
{t:'It appears on your website',who:'everyone',
 p:'This is your own website, with your header and footer. The request you approved in step 6 is already at the top of What’s On. Nobody copied or uploaded anything.',
 body:`<div class="pf-win wt-site">${bar('www.your-website.org.uk/whats-on',true)}
  <div class="wt-site-h"><b>Your website</b><nav aria-hidden="true"><span>Home</span><span class="on">What’s On</span><span>Getting here</span><span>Contact</span></nav></div>
  <div class="wt-site-b"><p class="wt-small" data-wt-site-msg></p><iframe data-wt-embed title="What’s on, the Placeboard feed (demo)"></iframe></div>
  <div class="wt-site-f" aria-hidden="true">Your footer · Accessibility · Privacy</div></div>
  <button type="button" class="btn sm ghost wt-replay" data-wt-replay><span>Show it arriving again</span></button>`},
{t:'See the results',who:'everyone',
 p:'Open any day: who was reached outside the town, which pages they read and how many clicked through to a business. The same numbers go into a two-page report each month for the committee and levy payers.',
 body:`<div class="wt-res">${dashboard(RIPON)}
  <div class="wt-trail"><span class="pf-k">The request from step 4, start to finish</span><ol class="wt-log" data-wt-log2></ol></div></div>`}
];

export function placeboardWalkthrough(){
  const n=STAGES.length;
  return `
<header class="demo-hero dark wt-hero"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/placeboard">Placeboard</a><span aria-hidden="true">/</span>Step by step</nav>
  <h1 class="display split">${split('From sign-in to results',1)}${dot}</h1>
  <p class="lede rise" style="--i:6">Placeboard start to finish in ${n} steps: set up the board, a business sends an event, you approve it, it appears on your website and you see what it did. Scroll through, or use the arrow keys.</p>
  <p class="demo-flag rise" style="--i:7">A demonstration set in Ripon. The people, businesses and numbers are examples, and nothing you type leaves this page. Ripon City Council, Ripon BID and Visit Ripon are not involved.</p>
</div></header>

<section class="wt-sec" id="steps"><div class="wrap">
  <div class="wt" data-wt>
    <ol class="wt-rail" aria-label="Steps">
      ${STAGES.map((s,i)=>`<li><button type="button" data-wt-to="${i+1}"${i?'':' aria-current="step"'}><i>${i+1}</i><span>${s.t}</span></button></li>`).join('\n      ')}
    </ol>
    <div class="wt-main">
      ${STAGES.map((s,i)=>`<section class="wt-stage" data-wt-stage="${i+1}" aria-labelledby="wt-h${i+1}" id="step-${i+1}">
        <div class="wt-head">
          <div><span class="wt-num">Step ${i+1} of ${n}</span><h2 class="h2" id="wt-h${i+1}">${s.t}</h2></div>
          <span class="wt-who wt-who-${s.who}">${WHO[s.who]}</span>
        </div>
        <p class="wt-p">${s.p}</p>
        <div class="wt-screen">${s.body}</div>
        ${i<n-1?`<button type="button" class="wt-then" data-wt-to="${i+2}"><i aria-hidden="true"></i><span>Then ${i+2} · ${STAGES[i+1].t.toLowerCase()}</span></button>`:''}
      </section>`).join('\n      ')}
    </div>
  </div>
</div></section>

<section class="cta-band"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">Want this set up for your town?</h2><p class="lede">Founding places for 2027 get set-up and training included, and help shape what comes next.</p></div>
  <div class="actions reveal" style="--i:1"><a class="btn mag" href="/contact?interest=Placeboard"><span>Become a founding place</span></a><a class="btn ghost" href="/products/placeboard"><span>About Placeboard</span></a></div></div></section>`;
}

/* ---------------- behaviour ---------------- */
export function initWalkthrough(){
  const root=document.querySelector<HTMLElement>('[data-wt]');if(!root||root.dataset.wtOn)return;root.dataset.wtOn='1';
  const n=STAGES.length,$=<T extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<T>(s),$$=(s:string)=>[...root.querySelectorAll<HTMLElement>(s)];
  const time=(m=0)=>{const d=new Date(Date.now()+m*60000);return d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});};
  const S={board:'the Ripon board',accent:ACCENTS[0][0],dark:false,ch:{web:true,fb:true,ig:true,news:false} as Record<string,boolean>,cats:new Set(Object.keys(TYPE)),
    req:{biz:'Market Square café (example)',type:'event',title:'Supper, then the Hornblower at 9pm',when:'Thursdays in May, from 6pm'},sent:false,sentAt:'',approved:false,approvedAt:'',returned:false};
  let cur=1;

  /* ---- what carries between stages ---- */
  const CH:Record<string,string>={web:'Website What’s On',fb:'Facebook',ig:'Instagram',news:'Monthly newsletter'};
  function paint(){
    root.style.setProperty('--wt-accent',S.accent);
    $$('[data-wt-board]').forEach(e=>{e.textContent=S.board;});
    const ini=(S.board.replace(/^the\s+/i,'').trim()[0]||'P').toUpperCase();$$('[data-wt-logo]').forEach(e=>{e.textContent=ini;});
    $$('[data-wt-types] label').forEach(l=>{l.hidden=!S.cats.has(l.dataset.cat||'');});
    const R=S.req,sub=[R.biz,R.when].filter(Boolean).join(' · ');
    /* stage 5 */
    const mine=$('[data-wt-mine]');mine.hidden=!S.sent;
    $('[data-wt-q-type]').textContent=TYPE[R.type];$('[data-wt-q-title]').textContent=R.title;$('[data-wt-q-sub]').textContent=`${R.biz} · ${S.sentAt?`received ${S.sentAt}`:'just now'}`;
    $('[data-wt-wait]').textContent=String(2+(S.sent&&!S.approved&&!S.returned?1:0));$('[data-wt-done]').textContent=String(14+(S.approved?1:0));
    const toast=$('[data-wt-toast]');toast.hidden=!S.sent;$('[data-wt-toast-t]').textContent=`${R.biz}: “${R.title}”`;
    const goBtn=mine.querySelector('[data-wt-go] span');if(goBtn)goBtn.textContent=S.approved?'Approved':'Open';
    /* stage 6 */
    $('[data-wt-r-biz]').textContent=R.biz;$('[data-wt-r-type]').textContent=TYPE[R.type];$('[data-wt-r-title]').textContent=R.title;$('[data-wt-r-when]').textContent=R.when||'Not given';
    $('[data-wt-r-ch]').innerHTML=Object.keys(CH).filter(k=>S.ch[k]).map(k=>sw('pub-'+k,CH[k],true)).join('')||'<p class="wt-small">No channels switched on in step 2.</p>';
    $('[data-wt-pv-type]').textContent=TYPE[R.type];$('[data-wt-pv-title]').textContent=R.title;$('[data-wt-pv-sub]').textContent=sub;
    $('[data-wt-pv-fb]').textContent=`${R.title}${R.when?`. ${R.when}`:''}, at ${R.biz.replace(/\s*\(example\)$/,'')}.`;
    const acts=$('[data-wt-acts]');
    if(S.approved){acts.innerHTML='<span class="pf-tag ok">Approved and published</span>';}
    else if(S.returned){acts.innerHTML='<span class="pf-tag">Sent back to the business</span>';}
    const log:[string,string][]=[];
    if(S.sent)log.push([S.sentAt,`Received from ${R.biz}`]);
    if(S.sent)log.push([S.sentAt,`Email to ${OFFICER.name}, approver`]);
    if(S.approved){log.push([S.approvedAt,`Approved by ${OFFICER.name}`]);if(S.ch.web)log.push([S.approvedAt,'Published to the website What’s On']);
      const day=new Date().getHours()>=17?'tomorrow ':'';
      if(S.ch.fb)log.push([S.approvedAt,`Scheduled for Facebook, ${day}6pm`]);if(S.ch.ig)log.push([S.approvedAt,`Scheduled for Instagram Stories, ${day}6pm`]);log.push([S.approvedAt,`Email to ${R.biz}: approved`]);}
    if(S.returned)log.push([S.approvedAt,`Sent back to ${R.biz} with a comment`]);
    const li=log.length?log.map(([t,s])=>`<li><time>${t}</time><span>${esc(s)}</span></li>`).join(''):'<li><span>Nothing yet. Send the request in step 4.</span></li>';
    $('[data-wt-log]').innerHTML=li;$('[data-wt-log2]').innerHTML=li+(S.approved?'<li><time>Next day</time><span>Counted in the dashboard: feed views and clicks to the business’s own site</span></li>':'');
    /* stage 7 */
    const code=`<div data-placeboard="ripon"${S.accent!==ACCENTS[0][0]?` data-accent="${S.accent}"`:''}${S.dark?' data-theme="dark"':''}></div>\n<script src="https://theplaceboard.com/embed.js" async></script>`;
    $('[data-wt-snippet]').textContent=code;$('[data-wt-copy]').dataset.pfCopy=code;
    $$('[data-wt-sw2] input').forEach(i=>{(i as HTMLInputElement).checked=(i as HTMLInputElement).value===S.accent;});
    $$('[data-wt-setup] input[name=accent]').forEach(i=>{(i as HTMLInputElement).checked=(i as HTMLInputElement).value===S.accent;});
    /* stage 8 */
    $('[data-wt-site-msg]').textContent=!S.ch.web?'The website feed is switched off in step 2, so approvals are not sent here.':S.approved?'':'Approve the request in step 6 and it will appear here.';
  }

  /* ---- the embedded feed on "your website" ----
     Loaded ahead of time (from step 7), so arriving at step 8 never shows a blank
     frame. An approval is handed to the frame that is already there, so the new
     listing drops in while you watch; the frame reloads only if the colour or
     theme changed. */
  const fr=$<HTMLIFrameElement>('[data-wt-embed]');
  addEventListener('message',e=>{if(e.source===fr.contentWindow&&e.data?.placeboard==='height'){fr.style.height=`${+e.data.h||560}px`;}});
  let frSrc='',frReady=false,shown=false;
  const want=()=>{const q=new URLSearchParams();if(S.accent!==ACCENTS[0][0])q.set('accent',S.accent);if(S.dark)q.set('theme','dark');return `/embed/ripon${q.toString()?'?'+q:''}`;};
  const post=()=>{if(S.approved&&S.ch.web&&frReady&&!shown){shown=true;fr.contentWindow?.postMessage({placeboard:'approved',...S.req},location.origin);}};
  function loadSite(force=false){
    const src=want();if(src===frSrc&&!force)return;frSrc=src;frReady=false;shown=false;
    fr.onload=()=>{frReady=true;if(cur>=8&&!gliding)setTimeout(post,500);};
    fr.src=src;
  }

  /* ---- moving between stages ----
     One continuous page: the rail follows the scroll, and moving on glides to the
     next stage. While a glide is running the rail does not follow the scroll, so
     it moves straight to the new number instead of flicking through the ones passed. */
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gliding=0;
  function mark(k:number){
    if(k===cur)return;cur=k;
    $$('.wt-rail [data-wt-to]').forEach(b=>{const k2=+(b.dataset.wtTo||0);if(k2===cur)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.classList.toggle('seen',k2<cur);
      if(k2===cur&&innerWidth<=1000){const r=b.closest('.wt-rail') as HTMLElement;r.scrollTo({left:b.offsetLeft-r.clientWidth/2+b.offsetWidth/2,behavior:RM()?'auto':'smooth'});}});
    if(cur>=7)loadSite();if(cur>=8&&!gliding)post();
    history.replaceState(null,'',`#step-${cur}`);
  }
  function go(k:number,focus=true){
    k=Math.max(1,Math.min(n,k));const st=root.querySelector<HTMLElement>(`[data-wt-stage="${k}"]`);
    if(k>=7)loadSite();
    const top=st.getBoundingClientRect().top+scrollY-(innerWidth<=1000?150:96);
    clearTimeout(gliding);
    const done=()=>{clearTimeout(gliding);gliding=0;removeEventListener('scrollend',done);if(k>=8)setTimeout(post,250);};
    gliding=window.setTimeout(done,Math.min(1600,300+Math.abs(scrollY-top)/2));addEventListener('scrollend',done,{once:true});
    scrollTo({top,behavior:RM()?'auto':'smooth'});
    st.classList.add('wt-seen');st.classList.remove('wt-arrive');void st.offsetWidth;st.classList.add('wt-arrive');
    if(focus){const h=st.querySelector<HTMLElement>('h2');h.tabIndex=-1;h.focus({preventScroll:true});}
    mark(k);
  }
  /* stages fade up the first time they come into view */
  root.classList.add('wt-js');
  const vis=new Map<number,number>();
  const io=new IntersectionObserver(es=>{es.forEach(e=>vis.set(+((e.target as HTMLElement).dataset.wtStage||0),e.isIntersecting?e.intersectionRect.height:0));
    if(gliding)return;let best=cur,h=-1;vis.forEach((v,k)=>{if(v>h){h=v;best=k;}});if(h>0)mark(best);},{rootMargin:'-30% 0px -40% 0px',threshold:[0,.1,.25,.5,.75,1]});
  const seen=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('wt-seen');seen.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});
  $$('[data-wt-stage]').forEach(st=>{io.observe(st);seen.observe(st);});
  root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-wt-to],[data-wt-go]');if(b)go(+(b.dataset.wtTo||b.dataset.wtGo||1));});
  addEventListener('keydown',e=>{
    if(!document.body.contains(root))return;
    const t=e.target as HTMLElement;if(t.closest('input,textarea,select,[contenteditable]')||e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==='ArrowRight'){e.preventDefault();go(cur+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1);}
  });

  /* 1 · sign in */
  const si=$<HTMLFormElement>('[data-wt-signin]');
  si.addEventListener('submit',e=>{e.preventDefault();const m=$('[data-wt-signin-msg]');
    m.innerHTML='Link sent. <b>Opening it…</b>';setTimeout(()=>{m.innerHTML=`Signed in as <b>${OFFICER.name}</b>, ${OFFICER.role} (example) · Approver`;si.querySelector('button span').textContent='Signed in';setTimeout(()=>{if(cur===1)go(2);},800);},900);});

  /* 2 · set up */
  const setup=$<HTMLFormElement>('[data-wt-setup]');
  setup.addEventListener('input',()=>{const d=new FormData(setup);
    S.board=String(d.get('board')||'').trim()||'the board';S.accent=String(d.get('accent')||S.accent);
    S.cats=new Set(d.getAll('cat').map(String));if(!S.cats.size)S.cats.add('event');
    for(const k of Object.keys(CH))S.ch[k]=d.get(k)==='on';
    if(cur>=7)loadSite();
    if(!S.cats.has(S.req.type)){S.req.type=[...S.cats][0];const r=root.querySelector<HTMLInputElement>(`[data-wt-req] input[name=type][value=${S.req.type}]`);if(r)r.checked=true;}
    paint();});
  const people=$('[data-wt-people]'),pin=setup.querySelector<HTMLInputElement>('input[name=person]');
  const addPerson=()=>{const v=pin.value.trim();if(!v)return;const li=document.createElement('li');li.innerHTML=`<b>${esc(v)}</b><span>Invited · Editor</span>`;people.append(li);pin.value='';};
  $('[data-wt-add]').addEventListener('click',addPerson);
  pin.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addPerson();}});

  /* 3 · invite */
  $('[data-wt-invite]').addEventListener('click',e=>{
    $('[data-wt-invite-msg]').innerHTML='<b>Sent to 38 businesses.</b> In the demo nothing is sent.';
    (e.currentTarget as HTMLElement).querySelector('span').textContent='Invitations sent';
    $$('[data-wt-biz] .pf-tag:not(.ok)').forEach(t=>{t.textContent='Invited today';});
  });

  /* 4 · a business sends a request */
  const rq=$<HTMLFormElement>('[data-wt-req]');
  rq.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(rq),m=$('[data-wt-req-msg]');
    if(!d.get('ok')){m.innerHTML='<b>Held:</b> tick photo permission before sending.';return;}
    S.req={biz:String(d.get('biz')||'').trim()||'Your business',type:String(d.get('type')||'event'),title:String(d.get('title')||'').trim()||'Untitled',when:String(d.get('when')||'').trim()};
    S.sent=true;S.sentAt=time();S.approved=false;S.returned=false;
    $('[data-wt-acts]').innerHTML='<button type="button" class="btn sm" data-wt-approve><span>Approve and publish</span></button><button type="button" class="btn sm ghost" data-wt-back><span>Ask for changes</span></button>';
    m.innerHTML='<b>Sent.</b> The business gets an email now, and another when it has been looked at.';
    rq.querySelector('button[type=submit] span').textContent='Sent';paint();
    setTimeout(()=>{if(cur===4)go(5);},900);
  });

  /* 6 · approve or send back */
  root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest('button');if(!b)return;
    if(b.hasAttribute('data-wt-approve')){
      if(!S.sent){S.sent=true;S.sentAt=time(-6);}
      root.querySelectorAll<HTMLInputElement>('[data-wt-r-ch] input').forEach(i=>{S.ch[i.name.replace('pub-','')]=i.checked;});
      S.approved=true;S.returned=false;S.approvedAt=time();shown=false;paint();if(S.ch.web){loadSite();setTimeout(()=>{if(cur===6)go(8);},1000);}
    }else if(b.hasAttribute('data-wt-back')){$('[data-wt-change]').hidden=false;}
    else if(b.hasAttribute('data-wt-send-back')){S.returned=true;S.approvedAt=time();$('[data-wt-change]').hidden=true;paint();}
    else if(b.hasAttribute('data-wt-replay')){loadSite(true);}
  });

  /* 7 · code options */
  $('.wt-code').addEventListener('change',e=>{const t=e.target as HTMLInputElement;
    if(t.name==='accent2')S.accent=t.value;if(t.name==='dark')S.dark=t.checked;paint();loadSite();});
  /* 6 · channel switches are kept as they are flicked, so nothing resets them */
  $('[data-wt-r-ch]').addEventListener('change',e=>{const t=e.target as HTMLInputElement;S.ch[t.name.replace('pub-','')]=t.checked;});

  paint();
  cur=0;mark(1);
  const m=/^#step-(\d+)$/.exec(location.hash);if(m)setTimeout(()=>go(+m[1],false),50);
  /* load "your website" quietly once the page is idle, so it is ready and the right height long before step 8 */
  const pre=()=>{if(document.body.contains(root))loadSite();};
  if('requestIdleCallback' in window)requestIdleCallback(pre,{timeout:3000});else setTimeout(pre,1500);
}
