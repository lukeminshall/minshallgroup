/* =====================================================================
   TAILOR — the home page asks one question and rebuilds itself around
   the answer. The fifth beat of the opening offers four sectors and a
   free-text line; free text goes to /api/intent to be read. The answer
   is remembered on this device, the dots spell it back, the sections
   reorder (their field first, their work first, their instrument first,
   the call to action in their words), a chip under the opening says
   which view is showing, and the contact page arrives pre-filled.
   Nothing is gated: skipping is one scroll, and without JavaScript the
   page is in its default order.
   ===================================================================== */
import {RM} from './motion';

const KEY='mg-intent';
type Sector=''|'health'|'sport'|'public';
type Job=''|'fund'|'prove'|'build'|'who';
export type Intent={sector:Sector;job:Job;word?:string;text?:string;ts:number};

const WORD:Record<string,string>={health:'health.',sport:'sport.',public:'places.'};
const NAME:Record<string,string>={health:'health',sport:'sport',public:'places and communities'};
const Q2:Record<string,string>={health:'And the job is to',sport:'And the job is to',public:'And the job is to'};
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
  'public/build':{h:'Need a tool built for a town, a BID or a council?',p:'Tell us the job it has to do. Placeboard may already be most of it. Fixed price, written proposal, two working days.'},
};
const JOBLINE:Record<string,string>={fund:'make the case for funding',prove:'prove something worked',build:'build a tool or service',who:'find out who you are'};
const KW:Record<Sector,RegExp>={
  '':/$^/,
  health:/\b(nhs|health|patient|clinic|gp|hospital|trust|icb|care|diagnos|medical|wellbeing|therap|surgery|pharma|dental)/i,
  sport:/\b(sport|club|leisure|active|activity|gym|pitch|stadium|fitness|football|rugby|cricket|swim|athlet|coach|participat|pool|ground)/i,
  public:/\b(town|bid|high street|council|place|community|communities|market|footfall|visitor|centre|center|street|borough|parish|village|city|event)/i,
};
const KWJ:Record<Job,RegExp>={
  '':/$^/,
  fund:/\b(fund|funding|money|bid for|grant|business case|case for|investment|revenue|income|commercial|sponsor|budget|pay for)/i,
  prove:/\b(prove|evidence|measure|impact|evaluat|outcome|report|show|data|track|kpi|return)/i,
  build:/\b(build|website|web|app|tool|platform|system|digital|booking|dashboard|software|site|portal|develop)/i,
  who:/\b(who are you|about you|what do you do|curious|looking around|just looking|browsing)/i,
};

export const readIntent=():Intent|null=>{try{const v=localStorage.getItem(KEY);return v?JSON.parse(v):null;}catch{return null;}};
const save=(i:Intent)=>{try{localStorage.setItem(KEY,JSON.stringify(i));}catch{}};
const forget=()=>{try{localStorage.removeItem(KEY);}catch{}};
const clarity=(...a:any[])=>{const c=(window as any).clarity;if(typeof c==='function'){try{c(...a);}catch{}}};

/* read free text: the API when it is there, keywords when it is not or is slow */
async function readText(text:string):Promise<{sector:Sector;job:Job;word:string}>{
  const guess=():{sector:Sector;job:Job;word:string}=>{
    const sector:Sector=(['health','sport','public'] as Sector[]).find(s=>KW[s].test(text))||'';
    const job:Job=(['fund','prove','build','who'] as Job[]).find(j=>KWJ[j].test(text))||'';
    const m=text.match(/\b([a-z][a-z' -]{2,22})\b/i);
    return {sector,job,word:sector?WORD[sector]:(m?m[1].toLowerCase().trim()+'.':'you.')};};
  try{
    const ac=new AbortController();const t=setTimeout(()=>ac.abort(),4500);
    const r=await fetch('/api/intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:ac.signal});
    clearTimeout(t);if(!r.ok)return guess();
    const j=await r.json();
    const ok=(v:any,list:string[])=>list.includes(v)?v:'';
    return {sector:ok(j.sector,['health','sport','public']) as Sector,job:ok(j.job,['fund','prove','build','who']) as Job,word:(typeof j.word==='string'&&j.word.trim()?j.word.trim().toLowerCase().replace(/[.!?]*$/,'')+'.':guess().word)};
  }catch{return guess();}
}

/* reorder the page: their things first, nothing removed */
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
  const q=new URLSearchParams();if(s)q.set('sector',s);if(i.job)q.set('job',i.job);if(i.text)q.set('said',i.text.slice(0,200));
  document.querySelectorAll<HTMLAnchorElement>('a[href="/contact"]').forEach(a=>{a.href='/contact'+(q.toString()?'?'+q:'');});
  const chip=document.querySelector<HTMLElement>('[data-chip]');
  if(chip){chip.hidden=!s;const b=chip.querySelector('b');if(b)b.textContent=NAME[s]||'';}
}

export function initTailor(){
  const sec=document.querySelector<HTMLElement>('[data-open]');if(!sec)return;
  const ask=sec.querySelector<HTMLElement>('[data-ask]'),chip=document.querySelector<HTMLElement>('[data-chip]');if(!ask)return;
  const q=ask.querySelector<HTMLElement>('[data-ask-q]'),s1=ask.querySelector<HTMLElement>('[data-ask-step="1"]'),s2=ask.querySelector<HTMLElement>('[data-ask-step="2"]'),free=ask.querySelector<HTMLFormElement>('[data-ask-free]'),note=ask.querySelector<HTMLElement>('[data-ask-note]');
  let cur:Intent={sector:'',job:'',ts:0};
  const stored=readIntent();
  if(stored){cur=stored;apply(cur);if(stored.sector){q.textContent=`Still here for ${NAME[stored.sector]}?`;s1.querySelector<HTMLElement>(`[data-sector="${stored.sector}"]`)?.classList.add('on');}}
  const spell=(w:string)=>{if(RM)return 0;sec.dispatchEvent(new CustomEvent('mg:spell',{detail:[w]}));return 1900;};
  const finish=async(i:Intent,word:string)=>{
    cur={...i,ts:Date.now()};save(cur);apply(cur);
    clarity('set','intent_sector',cur.sector||'none');clarity('set','intent_job',cur.job||'none');clarity('event',`intent_${cur.sector||'none'}`);
    ask.classList.add('done');
    const wait=spell(word);
    setTimeout(()=>{const to=document.querySelector(cur.sector?`.field[data-field="${cur.sector}"]`:'.with');to?.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
      setTimeout(()=>ask.classList.remove('done'),1200);},wait+200);
  };
  const step2=(sector:Sector)=>{cur={...cur,sector,job:''};s1.querySelectorAll('button').forEach(b=>b.classList.toggle('on',(b as HTMLElement).dataset.sector===sector));
    q.textContent=Q2[sector]||'And the job is to';s1.hidden=true;free.hidden=true;s2.hidden=false;if(note)note.textContent='';s2.querySelector<HTMLElement>('button')?.focus();};
  s1.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-sector]');if(!b)return;
    const sector=(b.dataset.sector||'') as Sector;
    if(!sector){forget();cur={sector:'',job:'',ts:Date.now()};apply(cur);if(chip)chip.hidden=true;q.textContent='No problem. Scroll on.';s1.hidden=true;free.hidden=true;
      setTimeout(()=>document.querySelector('.with')?.scrollIntoView({behavior:RM?'auto':'smooth'}),500);return;}
    step2(sector);});
  s2.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-job]');if(!b)return;
    const job=(b.dataset.job||'') as Job;s2.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    q.textContent='Building your view.';finish({...cur,job},WORD[cur.sector]||'you.');});
  free.addEventListener('submit',async e=>{e.preventDefault();
    const inp=free.querySelector('input') as HTMLInputElement;const text=inp.value.trim().slice(0,200);if(!text)return;
    free.classList.add('busy');q.textContent='Reading that.';if(note)note.textContent='';
    const r=await readText(text);
    free.classList.remove('busy');
    if(!r.sector){q.textContent='Got it. Which of these is closest?';if(note)note.textContent=`“${text}”`;free.hidden=true;cur={...cur,text,job:r.job};return;}
    s1.hidden=true;free.hidden=true;s2.hidden=true;q.textContent='Building your view.';
    finish({sector:r.sector,job:r.job,word:r.word,text,ts:0},r.word);});
  chip?.querySelector('[data-chip-change]')?.addEventListener('click',()=>{forget();cur={sector:'',job:'',ts:0};document.body.dataset.view='';
    q.textContent='What brings you here?';s1.hidden=false;free.hidden=false;s2.hidden=true;s1.querySelectorAll('button').forEach(b=>b.classList.remove('on'));
    sec.scrollIntoView({behavior:RM?'auto':'smooth',block:'end'});});
}
