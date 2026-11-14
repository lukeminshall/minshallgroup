/* =====================================================================
   PLACE — the working pieces of Placeboard, filled in for one town:
   the business request portal, the council's project portal, the
   seasonal year and the live dashboard. Used by the Placeboard demo
   (a fictional town) and by the Petersfield tender page.
   ===================================================================== */

export const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export type Season={span:number,t:string,s:string,m:string,f:string};
export type Place={
  host:string,brand:string,client:string,project:string,
  org?:string,                                   /* who approves: Council (default) or BID */
  biz:[string,string,string],                    /* the request already filled in: business, title, when */
  queue:[string,string,string,string][],         /* waiting: type, label, title, who and when */
  done:[string,string,string],                   /* approved: label, title, who and where */
  tiles:[string,string][],needs:string[],
  plan:[string,string,string][],                 /* state (done, now or blank), milestone, date */
  approvals:[string,string][],approved:[string,string],
  docs:[string,string,string][],reports:[string,string,string][],
  dash:{title:string,kpis:[string,number,string][],bars:number[],mon:string[],visitors:number,outside:string,top:[string,string][],flag:string}
};

/* the business request portal: a business submits, the council approves */
export function requestPortal(P:Place){
  const types=[['event','An event'],['offer','An offer'],['news','News or an opening'],['listing','A listing change']];
  const O=P.org||'Council';
  return `<div class="pf-rp" data-pf-rp data-org="${O}">
  <div class="pf-win pf-biz" data-step="biz">
    <div class="pf-bar"><i></i><i></i><i></i><span>${P.host} · share with us</span></div>
    <form class="pf-form" data-pf-form novalidate>
      <p class="pf-k">For local businesses and partners</p>
      <h3>Share something with ${P.brand}</h3>
      <label class="pf-l">Your business<input name="biz" value="${P.biz[0]}" autocomplete="off"></label>
      <fieldset class="pf-types"><legend class="pf-l">What would you like to share?</legend>
        ${types.map(([v,t],i)=>`<label><input type="radio" name="type" value="${v}"${i?'':' checked'}><span>${t}</span></label>`).join('')}</fieldset>
      <label class="pf-l">Title<input name="title" value="${P.biz[1]}" autocomplete="off"></label>
      <label class="pf-l">When<input name="when" value="${P.biz[2]}" autocomplete="off"></label>
      <label class="pf-check"><input type="checkbox" name="ok" checked><span>We have permission to use any photos we send.</span></label>
      <button class="btn sm" type="submit"><span>Send for approval</span></button>
    </form>
  </div>
  <div class="pf-flow" aria-hidden="true"><i></i><span>Logged and sent to the ${O}</span></div>
  <div class="pf-win pf-council" data-step="council">
    <div class="pf-bar"><i></i><i></i><i></i><span>${O} approvals</span><b class="pf-live"><i></i>Live</b></div>
    <div class="pf-cq">
      <div class="pf-cq-k"><div><span>Awaiting approval</span><b data-pf-wait>${P.queue.length}</b></div><div><span>Approved this month</span><b data-pf-done>14</b></div><div><span>Average turnaround</span><b>1.8 days</b></div></div>
      <ul class="pf-queue" data-pf-queue>
        ${P.queue.map(([type,label,t,s])=>`<li data-state="wait" data-type="${type}"><div><em>${label}</em><b>${t}</b><small>${s}</small></div><div class="pf-acts"><button type="button" data-pf-approve>Approve</button><button type="button" class="ghost" data-pf-change>Ask for changes</button></div></li>`).join('\n        ')}
        <li data-state="done"><div><em>${P.done[0]}</em><b>${P.done[1]}</b><small>${P.done[2]}</small></div><span class="pf-tag ok">Approved</span></li>
      </ul>
      <p class="pf-audit" data-pf-audit role="status">Every request is logged with who sent it, who approved it and where it was published.</p>
    </div>
  </div>
</div>`;
}

/* the council's own project portal */
export function councilPortal(P:Place){
  const tabs=['Overview','Plan','Approvals','Documents','Reports'];
  const stages=['Mobilise','Plan','Brand toolkit','Deliver','Review'];
  const O=P.org||'Council';
  const docs=(d:[string,string,string][])=>d.map(([i,b,s])=>`<li><i>${i}</i><b>${b}</b><small>${s}</small></li>`).join('\n          ');
  return `<div class="pf-win pf-cp" data-pf-cp data-step="cp">
  <div class="pf-bar"><i></i><i></i><i></i><span>minshallgroup.com/portal · ${P.client}</span></div>
  <div class="pf-cp-in">
    <nav class="pf-cp-nav" role="tablist" aria-label="Portal sections">${tabs.map((t,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-pf-tab="${i}">${t}</button>`).join('')}</nav>
    <div class="pf-cp-body">
      <section class="pf-cp-p" data-pf-panel="0">
        <p class="pf-k">Client portal · Digital marketing</p><h3 class="pf-cp-h">${P.project}</h3>
        <ol class="pf-stages">${stages.map((s,i)=>`<li class="${i<1?'done':i===1?'now':''}"><i></i><span>${s}</span></li>`).join('')}</ol>
        <div class="pf-tiles">${P.tiles.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
        <div class="pf-needs"><b>What needs you</b>${P.needs.map(n=>`<span>${n}</span>`).join('')}</div>
      </section>
      <section class="pf-cp-p" data-pf-panel="1" hidden>
        <p class="pf-k">Plan and milestones</p>
        <ul class="pf-plan">
          ${P.plan.map(([c,b,d])=>`<li${c?` class="${c}"`:''}><i></i><b>${b}</b><span>${d}</span></li>`).join('\n          ')}
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="2" hidden>
        <p class="pf-k">Waiting for ${O} sign-off</p>
        <ul class="pf-apr">
          ${P.approvals.map(([b,s])=>`<li><div><b>${b}</b><small>${s}</small></div><button type="button" data-pf-ok>Approve</button></li>`).join('\n          ')}
          <li class="ok"><div><b>${P.approved[0]}</b><small>${P.approved[1]}</small></div><span class="pf-tag ok">Approved</span></li>
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="3" hidden>
        <p class="pf-k">Documents</p>
        <ul class="pf-docs">
          ${docs(P.docs)}
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="4" hidden>
        <p class="pf-k">Monthly reports</p>
        <ul class="pf-docs">
          ${docs(P.reports)}
        </ul>
        <p class="pf-note">Each report covers headline numbers, what worked, what did not, business participation, paid spend and next month’s plan.</p>
      </section>
    </div>
  </div>
</div>`;
}

/* the live dashboard the council can open at any time */
export function dashboard(P:Place){
  const D=P.dash;
  return `<div class="pf-dash" data-step="dash">
  <div class="pf-dash-top"><b>${D.title}</b><span class="pf-live"><i></i>Updated daily</span></div>
  <div class="pf-dk">
    ${D.kpis.map(([k,v,s])=>`<div><span>${k}</span><b data-pf-count="${v}" aria-hidden="true">0</b><span class="sr">${v.toLocaleString('en-GB')}</span><small>${s}</small></div>`).join('\n    ')}
  </div>
  <div class="pf-dg">
    <div class="pf-chart"><span class="pf-dh">Share of reach from day-trip catchments</span>
      <div class="pf-bars">${D.bars.map((v,i)=>`<div><i style="--h:${v}%"></i><span>${D.mon[i]}</span><b>${v}%</b></div>`).join('')}</div></div>
    <div class="pf-split"><span class="pf-dh">Audience this month</span>
      <div class="pf-donut" style="--v:${D.visitors}"><b>${D.visitors}%</b><span>visitors</span></div>
      <ul><li><i class="v"></i>${D.outside}</li><li><i></i>Local residents</li></ul></div>
    <div class="pf-top"><span class="pf-dh">Top pages</span>
      <ol>${D.top.map(([t,v])=>`<li>${t}<b>${v}</b></li>`).join('')}</ol></div>
  </div>
  <p class="pf-flag">${D.flag}</p>
</div>`;
}

/* the year: seasonal campaigns across a December to November strip */
export const MONTHS=['Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];
export function year(seasons:Season[]){
  let mi=0;
  return `<div class="pf-year reveal" data-pf-year>
    <div class="pf-months" aria-hidden="true">${MONTHS.map(m=>`<span>${m}</span>`).join('')}</div>
    <div class="pf-camps" role="tablist" aria-label="Seasonal campaigns">${seasons.map((s,i)=>{const b=`<button type="button" role="tab" aria-selected="${!i}" data-pf-s="${i}"${s.span===1?' class="n1"':''} style="grid-column:${mi+1} / span ${s.span}"><b>${s.s}</b><span>${s.m}</span></button>`;mi+=s.span;return b;}).join('')}</div>
    <div class="pf-camp-card">${seasons.map((s,i)=>`<div data-pf-sp="${i}"${i?' hidden':''}><div><span class="pf-k">${s.m}</span><h3>${s.t}</h3><p>${s.f}</p></div>
      <ul class="pf-every"><li>Hero content</li><li>A way for businesses to join in</li><li>A paid social burst where it adds value</li><li>A website landing page or feature</li></ul></div>`).join('')}</div>
  </div>`;
}

/* ---------------- behaviour ---------------- */
let TID=0;
export function tabs(root:HTMLElement,btnAttr:string,panelAttr:string){
  const bs=[...root.querySelectorAll<HTMLButtonElement>(`[${btnAttr}]`)],ps=[...root.querySelectorAll<HTMLElement>(`[${panelAttr}]`)];
  const key=(a:string)=>a.replace(/^data-/,'').replace(/-(\w)/g,(_,c)=>c.toUpperCase());
  const pan=(b:HTMLButtonElement)=>ps.find(p=>p.dataset[key(panelAttr)]===b.dataset[key(btnAttr)]);
  bs.forEach(b=>{const p=pan(b),id=`pft${++TID}`;b.id=id;b.tabIndex=b.getAttribute('aria-selected')==='true'?0:-1;
    if(p){p.id=id+'p';b.setAttribute('aria-controls',p.id);p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',id);p.tabIndex=0;}});
  bs.forEach(b=>b.addEventListener('click',()=>{
    bs.forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1;});
    ps.forEach(p=>{const on=p===pan(b);p.hidden=!on;if(on){p.classList.remove('pf-in');void p.offsetWidth;p.classList.add('pf-in');}});
  }));
  bs.forEach((b,i)=>b.addEventListener('keydown',e=>{
    const step:Record<string,number>={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1};
    let j:number;if(e.key in step)j=(i+step[e.key]+bs.length)%bs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=bs.length-1;else return;
    e.preventDefault();bs[j].focus();bs[j].click();}));
}

/* "Approve" alone is ambiguous to a screen reader, so name the item; and keep focus when a button is replaced */
const nameActs=(li:HTMLElement)=>{const t=li.querySelector('b')?.textContent||'';li.querySelectorAll('button').forEach(b=>b.setAttribute('aria-label',`${b.textContent}: ${t}`));};
const swapForTag=(el:Element,html:string)=>{const t=document.createElement('template');t.innerHTML=html;const tag=t.content.firstElementChild as HTMLElement;tag.tabIndex=-1;el.replaceWith(tag);tag.focus();};

function wirePortal(root:HTMLElement){
  const form=root.querySelector<HTMLFormElement>('[data-pf-form]'),q=root.querySelector<HTMLElement>('[data-pf-queue]');
  const wait=root.querySelector<HTMLElement>('[data-pf-wait]'),done=root.querySelector<HTMLElement>('[data-pf-done]'),audit=root.querySelector<HTMLElement>('[data-pf-audit]');
  const flow=root.querySelector<HTMLElement>('.pf-flow'),O=root.dataset.org||'Council';
  const count=()=>{wait.textContent=String(q.querySelectorAll('[data-state="wait"]').length);};
  const TYPE:Record<string,string>={event:'Event',offer:'Offer',news:'News',listing:'Listing change'};
  const WHERE:Record<string,string>={event:'What’s On and Facebook events',offer:'Instagram Stories and the offers page',news:'Facebook, Instagram and the blog',listing:'the business directory'};
  q.querySelectorAll<HTMLElement>('li').forEach(nameActs);
  q.addEventListener('click',e=>{
    const b=(e.target as HTMLElement).closest('button');if(!b)return;
    const li=b.closest('li') as HTMLElement;const t=li.dataset.type||'event';
    if(b.hasAttribute('data-pf-approve')){
      li.dataset.state='done';swapForTag(li.querySelector('.pf-acts'),'<span class="pf-tag ok">Approved</span>');
      const sm=li.querySelector('small');sm.textContent=sm.textContent.replace(/ · .*$/,'')+` · approved, scheduled for ${WHERE[t]||'What’s On'}`;
      done.textContent=String(+done.textContent+1);
      audit.innerHTML=`<b>Logged:</b> approved by the ${O} officer just now, and scheduled for ${WHERE[t]||'What’s On'}.`;
      /* the direct feed: the approval goes straight to the embedded What's On on the council's own site */
      const parts=(sm.textContent||'').split(' · ');
      document.querySelector<HTMLIFrameElement>('[data-pf-embed]')?.contentWindow?.postMessage({placeboard:'approved',type:t,title:li.querySelector('b')?.textContent||'',biz:li.dataset.biz||parts[0],when:li.dataset.when??''},location.origin);
    }else if(b.hasAttribute('data-pf-change')){
      li.dataset.state='change';swapForTag(li.querySelector('.pf-acts'),'<span class="pf-tag">Changes asked</span>');
      audit.innerHTML=`<b>Logged:</b> sent back to the business with the ${O}’s comments.`;
    }
    count();
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);const type=String(d.get('type')||'event');
    const biz=esc(String(d.get('biz')||'').trim()||'Your business'),title=esc(String(d.get('title')||'').trim()||'Untitled request'),when=esc(String(d.get('when')||'').trim());
    if(!d.get('ok')){audit.innerHTML='<b>Held:</b> the business needs to confirm photo permission before this can be sent.';return;}
    const li=document.createElement('li');li.dataset.state='wait';li.dataset.type=type;li.className='pf-new';li.dataset.biz=String(d.get('biz')||'').trim();li.dataset.when=String(d.get('when')||'').trim();
    li.innerHTML=`<div><em>${TYPE[type]}</em><b>${title}</b><small>${biz}${when?` · ${when}`:''} · just now</small></div><div class="pf-acts"><button type="button" data-pf-approve>Approve</button><button type="button" class="ghost" data-pf-change>Ask for changes</button></div>`;
    nameActs(li);
    flow.classList.remove('go');void flow.offsetWidth;flow.classList.add('go');
    setTimeout(()=>{q.prepend(li);count();audit.innerHTML=`<b>Logged:</b> “${title}” from ${biz}, received just now. Waiting for ${O} approval.`;},650);
    const btn=form.querySelector<HTMLButtonElement>('button[type=submit] span');btn.textContent='Sent. Send another?';setTimeout(()=>{btn.textContent='Send for approval';},2600);
  });
}

function wireCouncil(root:HTMLElement){
  tabs(root,'data-pf-tab','data-pf-panel');
  root.querySelectorAll<HTMLElement>('.pf-apr li').forEach(nameActs);
  root.querySelectorAll<HTMLButtonElement>('[data-pf-ok]').forEach(b=>b.addEventListener('click',()=>{
    const li=b.closest('li');li.classList.add('ok');li.querySelector('small').textContent='Approved just now';swapForTag(b,'<span class="pf-tag ok">Approved</span>');
  }));
}

function wireCounts(root:HTMLElement){
  const els=[...root.querySelectorAll<HTMLElement>('[data-pf-count]')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){root.classList.add('pf-on');els.forEach(el=>{el.textContent=(+el.dataset.pfCount).toLocaleString('en-GB');});return;}
  const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();root.classList.add('pf-on');const t0=performance.now();
    const f=(t:number)=>{const k=Math.min(1,(t-t0)/1400),ease=1-Math.pow(1-k,3);els.forEach(el=>{el.textContent=Math.round(+el.dataset.pfCount*ease).toLocaleString('en-GB');});if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);},{threshold:.3});
  io.observe(root);
}

export function initPlace(){
  const yr=document.querySelector<HTMLElement>('[data-pf-year]');if(yr)tabs(yr,'data-pf-s','data-pf-sp');
  const rp=document.querySelector<HTMLElement>('[data-pf-rp]');if(rp)wirePortal(rp);
  const cp=document.querySelector<HTMLElement>('[data-pf-cp]');if(cp)wireCouncil(cp);
  const dash=document.querySelector<HTMLElement>('.pf-dash');if(dash)wireCounts(dash);
  /* the embedded feed reports its height, so it shows in full without its own scrollbar */
  const fr=document.querySelector<HTMLIFrameElement>('[data-pf-embed]');
  if(fr)addEventListener('message',e=>{if(e.source===fr.contentWindow&&e.data?.placeboard==='height'){fr.style.height=`${+e.data.h||520}px`;fr.style.minHeight='0';}});
  document.querySelectorAll<HTMLButtonElement>('[data-pf-copy]').forEach(b=>b.addEventListener('click',()=>{
    const sp=b.querySelector('span');navigator.clipboard?.writeText(b.dataset.pfCopy||'').then(()=>{sp.textContent='Copied';setTimeout(()=>{sp.textContent='Copy code';},2000);},()=>{});
  }));
}
