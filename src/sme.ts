/* =====================================================================
   DIGITAL SME OFFER — instant site check + live quote builder on
   /digitalsme. Runs after each page render; does nothing elsewhere.
   The check posts to /api/audit; the quote is sent through /api/contact.
   ===================================================================== */
import {SME,SCORE} from './content';

const gbp=n=>'£'+Math.round(n).toLocaleString('en-GB');
let lastCheck=null;

export function initSme(){
  const form=document.getElementById('sme-form') as HTMLFormElement;
  if(!form)return;
  lastCheck=null;
  wireCheck();wireQuote(form);
}

/* ---------- instant check ---------- */
const LOADING=['Fetching your site…','Running Google’s mobile speed test…','Checking search basics…','Looking for enquiry forms and contact details…','Scoring accessibility…','Nearly there…'];
function ring(label,v){
  const c=2*Math.PI*42,val=v===null?0:v,cls=v===null?'na':v>=90?'good':v>=50?'mid':'poor';
  return `<div class="score ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="sc-bg"/><circle cx="50" cy="50" r="42" class="sc-fg" style="stroke-dasharray:${c};--off:${c*(1-val/100)}"/></svg><b>${v===null?'–':v}</b><span>${label}</span></div>`;
}
function wireCheck(){
  const f=document.getElementById('sme-check') as HTMLFormElement,sec=document.getElementById('sme-results');
  const pre=new URLSearchParams(location.search).get('url');
  if(pre){(f.elements.namedItem('url') as HTMLInputElement).value=pre;setTimeout(()=>f.requestSubmit(),400);}
  const q=s=>sec.querySelector(s) as HTMLElement;
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const url=(f.elements.namedItem('url') as HTMLInputElement).value.trim();if(!url){(f.elements.namedItem('url') as HTMLInputElement).focus();return;}
    const btn=f.querySelector('button');btn.disabled=true;
    sec.hidden=false;q('[data-loading]').hidden=false;q('[data-out]').hidden=true;q('[data-err]').hidden=true;
    sec.scrollIntoView({behavior:'smooth',block:'start'});
    let i=0;const msg=q('[data-loading-msg]');msg.textContent=LOADING[0];
    const iv=setInterval(()=>{i=Math.min(i+1,LOADING.length-1);msg.textContent=LOADING[i];},3500);
    try{
      const r=await fetch('/api/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
      const j=await r.json().catch(()=>({error:'Something went wrong. Please try again.'}));
      if(!r.ok||j.error&&!j.checks)throw new Error(j.error||'We could not check that site.');
      lastCheck=j;render(j,q);
      const site=document.getElementById('qb-site') as HTMLInputElement;if(site&&!site.value)site.value=j.url;
    }catch(err){q('[data-err]').textContent=err.message||'We could not check that site.';q('[data-err]').hidden=false;}
    finally{clearInterval(iv);q('[data-loading]').hidden=true;btn.disabled=false;}
  });
}
/* ---------- Minshall Score ---------- */
const essOk=(sig,k)=>k==='bookOrOrder'?!!(sig.booking||sig.ecommerce):k==='tel'?!!sig.tel:!!sig[k];
function score(j,ind){
  const I=SCORE.industries.find(x=>x.id===ind)||SCORE.industries[SCORE.industries.length-1];
  const ess=I.ess.map(([k,t])=>({t,ok:essOk(j.signals,k)}));
  const fit=Math.round(ess.filter(e=>e.ok).length/ess.length*100);
  const p={...j.pillars,industry:fit};
  const total=Math.round(Object.entries(SCORE.weights).reduce((s,[k,w])=>s+(p[k]||0)*(w as number),0));
  const grade=SCORE.grades.find(([min])=>total>=(min as number))[1];
  return {I,ess,fit,p,total,grade};
}
function bigDial(v,grade){
  const c=2*Math.PI*46,cls=v>=85?'good':v>=70?'okay':v>=50?'mid':'poor';
  return `<div class="ms-ring ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" class="sc-bg"/><circle cx="50" cy="50" r="46" class="sc-fg" style="stroke-dasharray:${c};--off:${c*(1-v/100)}"/></svg><div class="ms-num"><b>${v}</b><span>out of 100</span></div></div><p class="ms-label"><span class="eyebrow">Minshall Score</span><b>${grade}</b></p>`;
}
function paintScore(j,q,ind){
  const r=score(j,ind);
  q('[data-mscore]').innerHTML=bigDial(r.total,r.grade);
  q('[data-pillars]').innerHTML=[...SCORE.pillars.map(x=>({...x,v:r.p[x.id]})),{id:'industry',t:'Sector fit',d:`Against what customers expect from a ${r.I.t.toLowerCase()} website`,v:r.fit}]
    .map(x=>`<div class="pl"><div class="pl-top"><b>${x.t}</b><em>${x.v}</em></div><div class="pl-bar"><i style="--w:${x.v}%" class="${x.v>=70?'good':x.v>=50?'mid':'poor'}"></i></div><small>${x.d}</small></div>`).join('');
  q('[data-ess-title]').textContent=`What customers expect from a ${r.I.t.toLowerCase()} website: ${r.ess.filter(e=>e.ok).length} of ${r.ess.length}`;
  q('[data-ess]').innerHTML=r.ess.map(e=>`<li class="${e.ok?'ok':'no'}"><i aria-hidden="true"></i>${e.t}<em class="sr">${e.ok?'Found':'Missing'}</em></li>`).join('');
  requestAnimationFrame(()=>q('[data-out]').classList.add('in'));
  lastCheck.mscore={total:r.total,grade:r.grade,industry:r.I.t,fit:r.fit,pillars:r.p};
}
function render(j,q){
  const s=j.scores;
  q('[data-out-url]').textContent=j.url;
  q('[data-out-title]').textContent=j.title?`How ${j.title.slice(0,60)} is doing.`:'Here is how your site is doing.';
  const sel=q('[data-industry]') as HTMLSelectElement;
  if(j.pillars){sel.value=j.industry||'other';paintScore(j,q,sel.value);sel.onchange=()=>paintScore(j,q,sel.value);}
  q('[data-scores]').innerHTML=s?[ring('Speed (mobile)',s.performance),ring('Search basics',s.seo),ring('Accessibility',s.accessibility),ring('Best practice',s.bestPractices)].join(''):'';
  const note=q('[data-psi-note]');note.hidden=!!s;note.textContent=s?'':(j.psiError?`${j.psiError} Your Minshall Score above does not depend on it.`:'Google’s scores are not available right now.');
  q('[data-checks]').innerHTML=j.checks.map(c=>`<li class="${c.ok?'ok':'no'}"><i aria-hidden="true"></i><span>${c.label}${c.detail?`<small>${esc(c.detail)}</small>`:''}</span><em class="sr">${c.ok?'Passed':'Needs work'}</em></li>`).join('');
  q('[data-fixes]').innerHTML=j.suggestions.length?j.suggestions.map(x=>`<li>${esc(x)}</li>`).join(''):'<li>Your site covers the basics well. A refresh would focus on content and design.</li>';
  const pk=SME.packages.find(p=>p.id===j.recommended)||SME.packages[0];
  q('[data-rec]').innerHTML=`<span class="eyebrow">We recommend</span><b>${pk.name} · from ${gbp(pk.price)}</b><p>${pk.for}</p><a class="btn" href="#quote" data-pick="${pk.id}"><span>Build my quote</span></a>`;
  q('[data-out]').hidden=false;
  requestAnimationFrame(()=>q('[data-scores]').classList.add('in'));
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- domains ---------- */
/* cheapest live registrar offer in pounds, else the fixed table */
function domainPrice(r){
  const live=(r.offers||[]).map(o=>({provider:o.provider,gbp:Math.ceil(o.currency==='GBP'?o.amount:o.currency==='USD'?o.amount*SME.usdToGbp:NaN)+SME.domainAdmin})).filter(o=>Number.isFinite(o.gbp)).sort((a,b)=>a.gbp-b.gbp)[0];
  if(live)return live;
  const end=Object.keys(SME.domains).filter(e=>r.domain.endsWith(e)).sort((a,b)=>b.length-a.length)[0];
  return end?{provider:'table',gbp:SME.domains[end]+SME.domainAdmin}:null;
}
function wireDomains(form:HTMLFormElement,calc){
  const have=form.querySelector<HTMLElement>('[data-dhave]'),need=form.querySelector<HTMLElement>('[data-dneed]');
  const input=form.querySelector('#qb-dname') as HTMLInputElement,msg=form.querySelector('[data-dmsg]'),list=form.querySelector('[data-dres]');
  const mode=()=>{const m=(form.querySelector('input[name=dmode]:checked') as HTMLInputElement).value;have.hidden=m!=='have';need.hidden=m!=='need';calc();};
  form.querySelectorAll('input[name=dmode]').forEach(r=>r.addEventListener('change',mode));
  const run=async()=>{
    const name=input.value.trim();if(!name){input.focus();return;}
    msg.textContent='Checking…';list.innerHTML='';
    try{
      const r=await fetch('/api/domain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'We could not check that name.');
      const any=j.results.some(x=>x.available);
      msg.textContent=any?'Pick the one you want. Prices are for the first year and confirmed on your quote.':'None of these are free. Try a different name, such as adding your town.';
      list.innerHTML=j.results.map((x,i)=>{
        if(x.available===true){const p=domainPrice(x);return `<li class="ok"><label><input type="radio" name="dpick" value="${esc(x.domain)}" data-gbp="${p?p.gbp:''}" data-src="${p?esc(p.provider):''}"${i===j.results.findIndex(y=>y.available)?' checked':''}><b>${esc(x.domain)}</b><em>${p?`${gbp(p.gbp)} first year`:'Price on request'}</em></label></li>`;}
        return `<li class="${x.available===false?'no':'unk'}"><b>${esc(x.domain)}</b><em>${x.available===false?'Taken':'Could not check'}</em></li>`;
      }).join('');
      calc();
    }catch(e){msg.textContent=e.message||'We could not check that name.';}
  };
  form.querySelector('[data-dcheck]').addEventListener('click',run);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
  mode();
}

/* ---------- quote builder ---------- */
function wireQuote(form:HTMLFormElement){
  const pages=form.querySelector('#qb-pages') as HTMLInputElement,num=form.querySelector('#qb-pages-num') as HTMLInputElement;
  /* keep the slider and the number box in step */
  pages.addEventListener('input',()=>{num.value=pages.value;});
  num.addEventListener('input',()=>{const v=Math.max(1,Math.min(250,Math.round(+num.value||1)));pages.value=String(v);});
  num.addEventListener('blur',()=>{num.value=pages.value;});
  const calc=()=>{
    const fd=new FormData(form);
    const pk=SME.packages.find(p=>p.id===fd.get('package'))||SME.packages[1];
    const n=+pages.value;const extraP=Math.max(0,n-pk.pages);
    form.querySelector('[data-pages-out]').textContent=n>1?'pages':'page';
    const hint=form.querySelector('[data-pages-hint]');
    const next=SME.packages.find(p=>p.price>pk.price&&n<=p.pages);
    hint.textContent=extraP?`${pk.name} includes ${pk.pages} pages, so ${extraP} extra at ${gbp(SME.extraPage)} each.${next&&pk.price+extraP*SME.extraPage>=next.price?` ${next.name} would cost the same or less.`:''}`:`Included in ${pk.name} (up to ${pk.pages} pages).`;
    const lines:[string,number][]=[[`${pk.name} package`,pk.price]];
    if(extraP)lines.push([`${extraP} extra page${extraP>1?'s':''}`,extraP*SME.extraPage]);
    form.querySelectorAll<HTMLElement>('[data-addon]').forEach(el=>{
      const a=SME.addons.find(x=>x.id===el.dataset.addon),cb=el.querySelector('input') as HTMLInputElement,inc=a.in.includes(pk.id);
      cb.disabled=inc;if(inc)cb.checked=true;else if(el.classList.contains('inc'))cb.checked=false;
      el.classList.toggle('inc',inc);el.querySelector('[data-addon-price]').textContent=inc?'Included':`+${gbp(a.price)}`;
      if(cb.checked&&!inc)lines.push([a.t,a.price]);
    });
    const total=lines.reduce((t,l)=>t+l[1],0);
    const third=Math.round(total/3),parts=[third,third,total-2*third];
    /* domain (if we secure one) goes on the first invoice; hosting is yearly */
    const dmode=(form.querySelector('input[name=dmode]:checked') as HTMLInputElement)?.value||'have';
    const pick=form.querySelector('input[name=dpick]:checked') as HTMLInputElement;
    const domain=dmode==='need'&&pick?{name:pick.value,gbp:pick.dataset.gbp?+pick.dataset.gbp:null,src:pick.dataset.src||''}:null;
    if(domain&&domain.gbp)parts[0]+=domain.gbp;
    const extra:[string,string][]=[];
    if(domain)extra.push([`Domain ${domain.name}, first year`,domain.gbp?`${gbp(domain.gbp)} on first invoice`:'Price on request']);
    else if(dmode==='need')extra.push(['Domain','Check availability above']);
    extra.push(['Hosting',`${gbp(SME.hosting)} a year`]);
    form.querySelector('[data-extra]').innerHTML=extra.map(l=>`<li><span>${esc(l[0])}</span><b>${l[1]}</b></li>`).join('');
    form.querySelector('[data-lines]').innerHTML=lines.map(l=>`<li><span>${l[0]}</span><b>${gbp(l[1])}</b></li>`).join('');
    form.querySelector('[data-total]').textContent=gbp(total);
    form.querySelector('[data-stages]').innerHTML=SME.stages.map((s,i)=>`<li><span>${s.t}${i===0&&domain?.gbp?' + domain':''}</span><b>${gbp(parts[i])}</b></li>`).join('');
    return {pk,n,extra:extra,extraPages:extraP,lines,total,parts,domain,dmode};
  };
  form.addEventListener('input',calc);form.addEventListener('change',calc);calc();
  wireDomains(form,calc);

  /* "Choose X" / "Build my quote" buttons pick a package */
  document.getElementById('app').addEventListener('click',e=>{
    const b=(e.target as HTMLElement).closest<HTMLElement>('[data-pick]');if(!b)return;
    const r=form.querySelector<HTMLInputElement>(`input[name=package][value="${b.dataset.pick}"]`);if(r){r.checked=true;calc();}
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=form.querySelector('.cform-status'),btn=form.querySelector<HTMLButtonElement>('button[type=submit]');
    const set=(m,c='')=>{status.textContent=m;status.className='cform-status'+(c?' '+c:'');};
    if(!form.checkValidity()){const bad=form.querySelector<HTMLElement>(':invalid');bad?.focus();set('Please add your name, email, business name, and tick that you have read the terms.','err');return;}
    const q=calc(),fd=new FormData(form);
    const ms=lastCheck?.mscore?`\nMinshall Score: ${lastCheck.mscore.total}/100 (${lastCheck.mscore.grade}), sector ${lastCheck.mscore.industry}, sector fit ${lastCheck.mscore.fit}. Pillars: ${Object.entries(lastCheck.mscore.pillars).map(([k,v])=>`${k} ${v}`).join(', ')}.`:'';
    const check=lastCheck?ms+`\nSite check (${lastCheck.url}): `+(lastCheck.scores?`speed ${lastCheck.scores.performance}, SEO ${lastCheck.scores.seo}, accessibility ${lastCheck.scores.accessibility}, best practice ${lastCheck.scores.bestPractices}`:'no Google scores')+`; recommended ${lastCheck.recommended}.`:'';
    const message=['WEBSITE REFRESH QUOTE REQUEST',
      ...q.lines.map(l=>`- ${l[0]}: ${gbp(l[1])}`),
      `Pages: ${q.n}`,`Build total: ${gbp(q.total)} (ex VAT)`,
      q.dmode==='need'?`Domain: please secure ${q.domain?`${q.domain.name} (${q.domain.gbp?gbp(q.domain.gbp)+' first year, on first invoice':'price on request'}; priced via ${q.domain.src==='table'?'our price table':q.domain.src||'n/a'})`:'(no domain picked yet)'}`:`Domain: has own domain ${fd.get('domain')||'(not given)'}`,
      `Hosting: ${gbp(SME.hosting)} a year`,
      `Payments: ${SME.stages.map((s,i)=>`${s.t} ${gbp(q.parts[i])}`).join(' / ')}`,
      `Current website: ${fd.get('website')||'not given'}`,check,
      `Notes: ${fd.get('notes')||'none'}`,'Terms accepted: yes'].filter(Boolean).join('\n');
    btn.disabled=true;set('Sending…');
    try{
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        name:fd.get('name'),email:fd.get('email'),organisation:fd.get('organisation'),
        interest:`Website refresh – ${q.pk.name}`,timeline:'',message,'bot-field':fd.get('bot-field')||''})});
      if(!r.ok)throw new Error();
      set(`Thank you. Your quote for ${gbp(q.total)} is with us, and we will confirm it and your dates within one working day.`,'ok');
    }catch{set('Something went wrong sending that. Please try again in a moment.','err');}
    finally{btn.disabled=false;}
  });
}
