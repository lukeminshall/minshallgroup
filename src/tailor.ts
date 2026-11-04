/* =====================================================================
   TAILOR — the home page has a short conversation and writes a page.
   The fifth beat of the opening asks what brings you here; /api/intent
   asks at most two natural follow-ups, then writes a short page: a
   headline, a few lines, three things to consider, and an invitation to
   talk properly. The dots spell their words while it is being written.
   Their answers are remembered on this device; any answer can be
   changed and the page is rewritten. The rest of the page reorders too:
   their field first, their work first, their instrument first, the call
   to action in their words, the contact form pre-filled. Nothing is
   gated: skipping is one scroll, and without JavaScript the page is in
   its default order.
   ===================================================================== */
import {RM} from './motion';
import {CASES,PRODUCTS,INSIGHTS} from './content';

const KEY='mg-intent';
type Sector=''|'health'|'sport'|'public';
type Job=''|'fund'|'prove'|'build'|'who';
type Turn={q:string;a:string};
type Page={headline:string;intro:string;points:{t:string;d:string}[];close:string};
export type Intent={sector:Sector;job:Job;word:string;turns:Turn[];page?:Page|null;ts:number};

const Q0='What brings you here?';
const NAME:Record<string,string>={health:'health',sport:'sport',public:'places and communities'};
const CTA:Record<string,{h:string;p:string}>={
  'health':{h:'Have a health service that needs to prove its worth?',p:'Tell us what it is for and who it is for. We will send a short written proposal, with a fixed price, within two working days.'},
  'health/fund':{h:'Need the case for a health service, with the numbers to back it?',p:'Tell us the service and the decision it is waiting on. We will send a written proposal, fixed price, within two working days.'},
  'health/prove':{h:'Need to show a health service changed something?',p:'Tell us what the service does and who it is for. We will set out how to measure it, with a fixed price, within two working days.'},
  'health/build':{h:'Need a tool built for a health service?',p:'Tell us the job it has to do. We will send a short written proposal, with a fixed price, within two working days.'},
  'sport':{h:'Have a sport or activity service that needs to prove its worth?',p:'Tell us what it is for and who it is for. We will send a short written proposal, with a fixed price, within two working days.'},
  'sport/fund':{h:'Need the commercial case for sport, with the numbers to back it?',p:'Tell us the programme and the decision it is waiting on. We will send a written proposal, fixed price, within two working days.'},
  'sport/prove':{h:'Need to show a sport programme changed something?',p:'Tell us what it does and who it is for. We will set out how to measure it, with a fixed price, within two working days.'},
  'sport/build':{h:'Need a tool built for sport or physical activity?',p:'Tell us the job it has to do. We will send a short written proposal, with a fixed price, within two working days.'},
  'public':{h:'Have a place that needs to prove it is alive?',p:'Tell us the town, the BID or the council, and what it is trying to change. We will send a written proposal, fixed price, within two working days.'},
  'public/fund':{h:'Need the case for a place, with the numbers to back it?',p:'Tell us the place and the decision it is waiting on. We will send a written proposal, fixed price, within two working days.'},
  'public/prove':{h:'Need to show a place changed something?',p:'Tell us the town or the scheme, and who it is for. We will set out how to measure it, with a fixed price, within two working days.'},
  'public/build':{h:'Need a website or a tool built for a place, or a business on its high street?',p:'Tell us the job it has to do. Placeboard may already be most of it. Fixed price, written proposal, two working days.'},
};
const KW:Record<string,RegExp>={
  health:/\b(nhs|health|patient|clinic|gp|hospital|trust|icb|care|diagnos|medical|wellbeing|therap|surgery|pharma|dental)/i,
  sport:/\b(sport|club|leisure|active|activity|gym|pitch|stadium|fitness|football|rugby|cricket|swim|athlet|coach|participat|pool|ground)/i,
  public:/\b(town|bid|high street|council|place|community|communities|market|footfall|visitor|centre|center|street|borough|parish|village|city|event|cafe|café|shop)/i,
};

export const readIntent=():Intent|null=>{try{const v=localStorage.getItem(KEY);const i=v?JSON.parse(v):null;return i&&Array.isArray(i.turns)?i:null;}catch{return null;}};
const save=(i:Intent)=>{try{localStorage.setItem(KEY,JSON.stringify(i));}catch{}};
const forget=()=>{try{localStorage.removeItem(KEY);}catch{}};
const clarity=(...a:any[])=>{const c=(window as any).clarity;if(typeof c==='function'){try{c(...a);}catch{}}};
const esc=(s:string)=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* one turn of the conversation: the API when it is there, a plain fallback when it is not */
async function converse(turns:Turn[]):Promise<{sector:Sector;job:Job;word:string;question?:string;page?:Page}>{
  const plain=():{sector:Sector;job:Job;word:string;question?:string;page?:Page}=>{
    const text=turns.map(t=>t.a).join(' ');
    const sector=((['health','sport','public'] as Sector[]).find(s=>KW[s].test(text))||'') as Sector;
    const fq=['What is it for, and who is it for?','Where are you, and what would need to be true in a year for it to have worked?'];
    if(turns.length-1<2)return {sector,job:'',word:sector||'you',question:fq[turns.length-1]};
    return {sector,job:'',word:sector||'you',page:{headline:'Where to start',intro:'A quick sketch from what you have told us. The point of anything we build or plan with you is the same: that the people it is for feel the difference, and that you can show it.',
      points:[{t:'Start with the outcome',d:'One sentence on what should be different in a year, for whom. Everything else is designed backwards from that.'},{t:'Count the right thing',d:'Not visits, likes or logins. Whether anyone got there sooner, moved more, or came back.'},{t:'Keep it small to begin',d:'A fixed-price first piece that proves the idea, before anything bigger is committed.'}],
      close:'This is a sketch, not a proposal. The useful next step is a conversation.'}};};
  try{
    const ac=new AbortController();const t=setTimeout(()=>ac.abort(),24000);
    const r=await fetch('/api/intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turns}),signal:ac.signal});
    clearTimeout(t);if(!r.ok)return plain();
    const j=await r.json();
    const ok=(v:any,list:string[])=>list.includes(v)?v:'';
    const out:any={sector:ok(j.sector,['health','sport','public']),job:ok(j.job,['fund','prove','build','who']),word:(typeof j.word==='string'&&j.word.trim())?j.word.trim().toLowerCase():''};
    if(typeof j.question==='string'&&j.question.trim())out.question=j.question.trim();
    else if(j.page&&typeof j.page.headline==='string')out.page=j.page;
    else return plain();
    if(!out.word)out.word=out.sector||'you';
    return out;
  }catch{return plain();}
}

/* reorder the rest of the page: their things first, nothing removed */
function apply(i:Intent){
  const s=i.sector;
  document.body.dataset.view=s||'';
  const first=(parent:Element|null,sel:string)=>{if(!parent)return;const el=parent.querySelector(sel);if(el)parent.prepend(el);};
  const sortBy=(list:Element|null,score:(el:Element)=>number)=>{if(!list)return;[...list.children].map((el,k)=>({el,k,sc:score(el)})).sort((a,b)=>b.sc-a.sc||a.k-b.k).forEach(x=>list.appendChild(x.el));};
  if(s){
    first(document.querySelector('.fields'),`.field[data-field="${s}"]`);
    sortBy(document.querySelector('.ledger'),el=>(el as HTMLElement).dataset.ind===s?1:0);
    const inst:Record<string,string[]>={health:['datalense','straight-talking','placeboard'],sport:['datalense','straight-talking','placeboard'],public:['placeboard','datalense','straight-talking']};
    sortBy(document.querySelector('.instr'),el=>3-inst[s].indexOf((el as HTMLElement).dataset.slug||''));
    sortBy(document.querySelector('.windex'),el=>KW[s].test(((el as HTMLElement).dataset.kw||''))?1:0);
  }
  const cta=document.querySelector<HTMLElement>('[data-cta]');
  const c=CTA[`${s}/${i.job}`]||CTA[s];
  if(cta&&c){const h=cta.querySelector('h2'),p=cta.querySelector('p');if(h)h.innerHTML=c.h;if(p)p.textContent=c.p;}
  const said=i.turns.map(t=>t.a).join(' / ').slice(0,300);
  const q=new URLSearchParams();if(s)q.set('sector',s);if(i.job)q.set('job',i.job);if(said)q.set('said',said);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/contact"]').forEach(a=>{a.href='/contact'+(q.toString()?'?'+q:'');});
  const chip=document.querySelector<HTMLElement>('[data-chip]');
  if(chip){chip.hidden=!s;const b=chip.querySelector('b');if(b)b.textContent=NAME[s]||'';}
}

/* the page written for them, under the opening */
function renderPage(i:Intent){
  const y=document.querySelector<HTMLElement>('[data-yours]');if(!y)return;
  const p=i.page;if(!p){y.hidden=true;return;}
  y.querySelector('[data-y-h]')!.innerHTML=esc(p.headline)+'<span class="dot" aria-hidden="true"></span>';
  y.querySelector('[data-y-intro]')!.textContent=p.intro;
  y.querySelector('[data-y-pts]')!.innerHTML=p.points.map(x=>`<li><b>${esc(x.t)}</b><p>${esc(x.d)}</p></li>`).join('');
  y.querySelector('[data-y-close]')!.textContent=p.close;
  /* the site searches itself for them: their work, their instrument, the writing that matches */
  const s=i.sector,said=i.turns.map(t=>t.a).join(' ').toLowerCase();
  const kw=s==='public'?/\b(town|high street|bid|council|footfall|visitor|place|places|community|communities|market town)/i:(s?KW[s]:/$^/);
  const cases=CASES.filter((c:any)=>c.ind===s).slice(0,2).map((c:any)=>({k:'Work',t:c.head,d:c.ret,h:`/work/${c.id}`}));
  const prodSlug=s==='public'?'placeboard':(i.job==='prove'?'straight-talking':'datalense');
  const prod=PRODUCTS.filter((x:any)=>x.slug===prodSlug).map((x:any)=>({k:'Instrument',t:x.t,d:x.line,h:`/products/${x.slug}`}));
  const ins=INSIGHTS.filter((a:any)=>kw.test((a.t+' '+(a.d||'')).toLowerCase())||/website|web/.test(said)&&/website/i.test(a.t)).slice(0,2).map((a:any)=>({k:'Writing',t:a.t,d:'',h:`/insights/${a.slug}`}));
  const picks=[...cases.slice(0,1),...prod,...(ins[0]?[ins[0]]:cases.slice(1,2))].slice(0,3);
  const from=y.querySelector<HTMLElement>('[data-y-from]'),list=y.querySelector<HTMLElement>('[data-y-list]');
  if(from&&list){list.innerHTML=picks.map(x=>`<li><a href="${x.h}"><small>${esc(x.k)}</small><b>${esc(x.t)}</b>${x.d?`<span>${esc(x.d)}</span>`:''}</a></li>`).join('');from.hidden=!picks.length;}
  y.hidden=false;
}

export function initTailor(){
  const sec=document.querySelector<HTMLElement>('[data-open]');if(!sec)return;
  const ask=sec.querySelector<HTMLElement>('[data-ask]'),chip=document.querySelector<HTMLElement>('[data-chip]'),yours=document.querySelector<HTMLElement>('[data-yours]');if(!ask)return;
  const q=ask.querySelector<HTMLElement>('[data-ask-q]')!,opts=ask.querySelector<HTMLElement>('[data-ask-step="1"]')!,free=ask.querySelector<HTMLFormElement>('[data-ask-free]')!,input=free.querySelector('input') as HTMLInputElement,log=ask.querySelector<HTMLElement>('[data-ask-log]')!,note=ask.querySelector<HTMLElement>('[data-ask-note]')!;
  let cur:Intent=readIntent()||{sector:'',job:'',word:'',turns:[],ts:0};
  let pending=Q0,busy=false;

  const toAsk=()=>{sec.scrollIntoView({behavior:RM?'auto':'smooth',block:'end'});};
  const spell=(w:string)=>{if(RM)return;sec.dispatchEvent(new CustomEvent('mg:spell',{detail:[w.replace(/[.!?]*$/,'')+'.']}));};
  const showLog=()=>{log.innerHTML=cur.turns.map((t,k)=>`<li><span class="al-q">${esc(t.q)}</span><span class="al-a">${esc(t.a)} <button type="button" data-edit="${k}">change</button></span></li>`).join('');log.hidden=!cur.turns.length;};
  const setQ=(text:string,withOpts:boolean)=>{pending=text;q.textContent=text;opts.hidden=!withOpts;free.hidden=false;input.value='';input.placeholder=withOpts?'Or say it in your own words':'Type your answer';note.textContent='';};
  const settle=()=>{showLog();apply(cur);renderPage(cur);
    if(cur.page){setQ('Your page is below. Change an answer above, or say something new.',false);}
    else if(cur.turns.length)setQ(pending,false);else setQ(Q0,true);};

  /* a return visit */
  if(cur.turns.length){settle();if(!cur.page){pending=cur.turns.length?'Where were we? Say a little more.':Q0;q.textContent=pending;}}

  const send=async(answer:string)=>{
    if(busy||!answer)return;busy=true;
    const turns=[...cur.turns,{q:pending,a:answer}];
    cur={...cur,turns,page:null};showLog();
    ask.classList.add('thinking');opts.hidden=true;free.hidden=true;
    q.textContent=turns.length===1?'Reading that.':'Give us a moment.';
    const r=await converse(turns);
    ask.classList.remove('thinking');
    cur={...cur,sector:r.sector,job:r.job,word:r.word,ts:Date.now()};
    if(r.question){cur.page=null;save(cur);apply(cur);setQ(r.question,false);input.focus();busy=false;return;}
    cur.page=r.page||null;save(cur);
    clarity('set','intent_sector',cur.sector||'none');clarity('set','intent_job',cur.job||'none');clarity('event',`intent_${cur.sector||'none'}`);
    q.textContent='Writing your page.';spell(cur.word);
    setTimeout(()=>{settle();yours?.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});busy=false;},RM?100:2000);
  };

  opts.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-sector]');if(!b)return;send(b.textContent!.trim());});
  free.addEventListener('submit',e=>{e.preventDefault();send(input.value.trim().slice(0,400));});
  log.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-edit]');if(!b||busy)return;
    const k=Number(b.dataset.edit);const t=cur.turns[k];cur={...cur,turns:cur.turns.slice(0,k),page:cur.page};save(cur);showLog();
    setQ(t.q,k===0);input.value=t.a;input.focus();});
  yours?.querySelector('[data-y-edit]')?.addEventListener('click',()=>{toAsk();setTimeout(()=>input.focus({preventScroll:true}),700);});
  chip?.querySelector('[data-chip-change]')?.addEventListener('click',()=>{forget();cur={sector:'',job:'',word:'',turns:[],page:null,ts:0};document.body.dataset.view='';
    if(yours)yours.hidden=true;if(chip)chip.hidden=true;showLog();setQ(Q0,true);toAsk();});
}
