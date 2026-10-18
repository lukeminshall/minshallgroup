/* =====================================================================
   START A PROJECT — a brief builder for every kind of project. People pick
   the type, tick what is in scope and give the outcome, size, timing and
   budget. A live preview shows the brief as we will read it, and it is
   sent through /api/contact. Small business websites go to the instant
   fixed-price quote on /digitalsme instead.
   ===================================================================== */
import {phead,eyebrow} from './components';

type T={id:string,t:string,d:string,scope:string[],goal:string};
export const START_TYPES:T[]=[
  {id:'strategy',t:'Strategy & consultancy',d:'Business cases, growth plans, market entry and site selection.',goal:'e.g. open two new clinics by next spring',
    scope:['Business or investment case','Growth or commercial strategy','UK market entry','Healthcare site selection or catchment','Due diligence','Operating model or service redesign','Board or funder paper']},
  {id:'data',t:'Data, AI & automation',d:'Dashboards, analytics, AI tools and automating manual work.',goal:'e.g. cut month-end reporting from five days to one',
    scope:['Dashboards and reporting','Data audit and clean-up','Joining up data sources','AI assistant or tool','Automating a manual process','Forecasting or modelling','DataLense access']},
  {id:'digital',t:'Digital & product',d:'Platforms, portals, apps and larger websites.',goal:'e.g. move 60% of bookings online this year',
    scope:['New platform or portal','Customer or patient app','Website over 100 pages','Booking, quote or payment journeys','Integrations with existing systems','Rescue an existing build']},
  {id:'brand',t:'Brand, marketing & growth',d:'Positioning, identity, campaigns and demand.',goal:'e.g. double qualified enquiries by the summer',
    scope:['Positioning and messaging','Visual identity','Website content and copy','Campaign','Lead generation','Launch or rebrand']},
  {id:'website',t:'A small business website',d:'Fixed prices from £495, priced instantly online.',goal:'',scope:[]}
];
const SECTORS=['Health and care','Sport and wellbeing','University or education','Public sector','Growth company','Other'];
const SIZES=['Under 10 people','10 to 49','50 to 249','250 or more'];
const WHEN=['As soon as possible','Within three months','Within six months','Planning ahead'];
const BUDGET=['Under £10k','£10k to £25k','£25k to £50k','£50k to £100k','Over £100k','Not sure yet'];

const radios=(name:string,opts:string[])=>opts.map(o=>`<label class="chk"><input type="radio" name="${name}" value="${o}"><span>${o}</span></label>`).join('');

export function startPage(){
  return `
${phead({eyebrow:'Start a project',title:'Build your brief. Get a fixed quote.',lede:'Strategy, data, a digital build or a brand. Tell us the outcome and the shape of the work, and within two working days we send back a short written proposal with a fixed price. No call needed to get started.'})}
<section class="st-sec"><div class="wrap st-grid">
  <form id="start-form" class="st-form" novalidate>
    <p class="hp" hidden aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <fieldset class="st-step"><legend><b>01</b> What kind of project is it?</legend>
      <div class="st-types">${START_TYPES.map(t=>`<label class="st-type"><input type="radio" name="type" value="${t.id}"><span><b>${t.t}</b><small>${t.d}</small></span></label>`).join('')}</div>
    </fieldset>
    <div class="st-web" data-st-web hidden>
      <p><b>Small business websites have their own instant quote.</b> Three fixed packages from £495, priced in two minutes, with a free check of your current site first.</p>
      <a class="btn" href="/digitalsme#quote"><span>Price my website</span></a>
    </div>
    <div data-st-rest>
      <fieldset class="st-step"><legend><b>02</b> What is in scope? <span class="opt">tick all that apply</span></legend>
        <div class="chips-in" data-st-scope><p class="st-hint">Choose a project type first.</p></div>
      </fieldset>
      <div class="st-step"><label class="st-legend" for="st-goal"><b>03</b> The number you want to move</label>
        <p class="st-help">One sentence: the outcome, and the date it has to change by.</p>
        <input id="st-goal" name="goal" type="text" maxlength="300" placeholder="e.g. open two new clinics by next spring"></div>
      <fieldset class="st-step"><legend><b>04</b> Your organisation</legend>
        <p class="st-sub">Sector</p><div class="chips-in">${radios('sector',SECTORS)}</div>
        <p class="st-sub">Size</p><div class="chips-in">${radios('size',SIZES)}</div>
      </fieldset>
      <fieldset class="st-step"><legend><b>05</b> Timing and budget</legend>
        <p class="st-sub">When does it need to start?</p><div class="chips-in">${radios('when',WHEN)}</div>
        <p class="st-sub">Budget range</p><div class="chips-in">${radios('budget',BUDGET)}</div>
        <p class="st-help">This helps us shape the right option. Whatever the range, you get a fixed price.</p>
      </fieldset>
      <div class="st-step"><label class="st-legend" for="st-more"><b>06</b> Anything else? <span class="opt">optional</span></label>
        <p class="st-help">What is in the way, what has been tried, who else is involved.</p>
        <textarea id="st-more" name="more" rows="4" maxlength="3000"></textarea></div>
      <div class="st-step st-you"><p class="st-legend"><b>07</b> Where should we send the proposal?</p>
        <div class="row2">
          <div class="cfield"><label for="st-name">Your name</label><input id="st-name" name="name" type="text" required autocomplete="name"></div>
          <div class="cfield"><label for="st-email">Email</label><input id="st-email" name="email" type="email" required autocomplete="email"></div>
        </div>
        <div class="cfield"><label for="st-org">Organisation <span class="opt">optional</span></label><input id="st-org" name="organisation" type="text" autocomplete="organization"></div>
        <button class="btn mag" type="submit"><span>Send my brief</span></button>
        <p class="cform-status" role="status" aria-live="polite"></p>
        <p class="cform-note">We use your details only to reply. See our <a class="ulink" href="/privacy">privacy notice</a>.</p>
      </div>
    </div>
  </form>
  <aside class="st-prev" aria-label="Your brief so far">
    <div class="st-card">
      ${eyebrow('Your brief')}
      <h2 class="st-title" data-p="title">Choose a project type to begin</h2>
      <dl class="st-dl">
        <div><dt>Outcome</dt><dd data-p="goal">Not set yet</dd></div>
        <div><dt>In scope</dt><dd data-p="scope">Not set yet</dd></div>
        <div><dt>Organisation</dt><dd data-p="org">Not set yet</dd></div>
        <div><dt>Timing</dt><dd data-p="when">Not set yet</dd></div>
        <div><dt>Budget</dt><dd data-p="budget">Not set yet</dd></div>
      </dl>
      <div class="st-meter" aria-hidden="true"><i data-p="meter"></i></div>
      <p class="st-meter-l" data-p="meterl">0 of 6 answered</p>
    </div>
    <div class="st-back">
      ${eyebrow('What you get back')}
      <ol class="next"><li>A short written proposal, scoped to your number, within two working days.</li><li>A fixed price and a timeline, with the stages set out.</li><li>A call only if you want one. Someone senior either way.</li></ol>
    </div>
  </aside>
</div></section>`;
}

export function initStart(){
  const form=document.getElementById('start-form') as HTMLFormElement|null;
  if(!form||form.dataset.wired)return;form.dataset.wired='1';
  const $=(s:string)=>form.closest('section')!.querySelector<HTMLElement>(s)!;
  const scopeBox=form.querySelector<HTMLElement>('[data-st-scope]')!;
  const goal=form.querySelector<HTMLInputElement>('#st-goal')!;
  const esc=(s:string)=>s.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]!));
  const val=(n:string)=>(form.querySelector<HTMLInputElement>(`input[name="${n}"]:checked`)?.value)||'';
  const type=()=>START_TYPES.find(t=>t.id===val('type'));
  const scope=()=>[...form.querySelectorAll<HTMLInputElement>('input[name="scope"]:checked')].map(i=>i.value);

  const setType=()=>{
    const t=type();const web=t?.id==='website';
    form.querySelector<HTMLElement>('[data-st-web]')!.hidden=!web;
    form.querySelector<HTMLElement>('[data-st-rest]')!.hidden=web;
    if(t&&!web){
      scopeBox.innerHTML=[...t.scope,'Not sure yet'].map(s=>`<label class="chk"><input type="checkbox" name="scope" value="${s}"><span>${s}</span></label>`).join('');
      goal.placeholder=t.goal;
    }
  };
  const paint=()=>{
    const t=type();
    const set=(k:string,v:string,empty='Not set yet')=>{const el=$(`[data-p="${k}"]`);el.textContent=v||empty;el.classList.toggle('is-empty',!v);};
    set('title',t?(t.id==='website'?'A small business website':t.t):'','Choose a project type to begin');
    set('goal',goal.value.trim());
    set('scope',scope().join(', '));
    set('org',[val('sector'),val('size')].filter(Boolean).join(', '));
    set('when',val('when'));set('budget',val('budget'));
    const n=[t,goal.value.trim(),scope().length,val('sector')||val('size'),val('when'),val('budget')].filter(Boolean).length;
    $('[data-p="meter"]').style.transform=`scaleX(${n/6})`;$('[data-p="meterl"]').textContent=`${n} of 6 answered`;
  };
  form.addEventListener('change',e=>{if((e.target as HTMLInputElement).name==='type')setType();paint();});
  form.addEventListener('input',paint);

  /* ?type=strategy preselects a type, for links from capability pages */
  const q=new URLSearchParams(location.search).get('type');
  const pre=q&&form.querySelector<HTMLInputElement>(`input[name="type"][value="${CSS.escape(q)}"]`);
  if(pre){pre.checked=true;setType();}
  paint();

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=form.querySelector<HTMLElement>('.cform-status')!;const btn=form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    const say=(m:string,k='')=>{status.textContent=m;status.className='cform-status '+k;};
    const fd=new FormData(form);const t=type();
    const name=String(fd.get('name')||'').trim(),email=String(fd.get('email')||'').trim();
    if(!t){say('Please choose a project type first.','err');form.querySelector('.st-types')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){say('Please add your name and a valid email.','err');return;}
    const lines=[`PROJECT BRIEF: ${t.t}`,'',`Outcome: ${goal.value.trim()||'not given'}`,`In scope: ${scope().join(', ')||'not given'}`,
      `Sector: ${val('sector')||'not given'}`,`Size: ${val('size')||'not given'}`,`Start: ${val('when')||'not given'}`,`Budget: ${val('budget')||'not given'}`];
    const more=String(fd.get('more')||'').trim();if(more)lines.push('','Anything else:',more);
    btn.disabled=true;say('Sending…');
    try{
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        name,email,organisation:String(fd.get('organisation')||'').trim(),interest:`Start a project: ${t.t}`,timeline:val('when'),
        message:lines.join('\n'),'bot-field':String(fd.get('bot-field')||'')})});
      if(!r.ok)throw new Error(String(r.status));
      form.innerHTML=`<div class="st-done" tabindex="-1">${eyebrow('Brief received')}<h2 class="h2">Thank you, ${esc(name.split(' ')[0])}. Your brief is with us.</h2>
        <p>We will read it properly and send a short written proposal with a fixed price to <b>${esc(email)}</b> within two working days. If anything is unclear, we will ask by email first.</p>
        <p><a class="tlink" href="/work">See related work while you wait</a></p></div>`;
      form.querySelector<HTMLElement>('.st-done')?.focus();window.scrollTo({top:form.getBoundingClientRect().top+scrollY-120,behavior:'smooth'});
    }catch{say('Something went wrong sending that. Please try again, or email us directly.','err');btn.disabled=false;}
  });
}
