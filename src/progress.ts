/* =====================================================================
   CHECK PROGRESS — what people watch while a Webmins check runs: a ring
   that fills, a countdown, and the steps ticking off. The real check
   takes 15 to 40 seconds, so the ring eases towards 95% over the expected
   time and only completes when the result arrives.
   ===================================================================== */
export const CHECK_STEPS=['Loading your homepage','Checking it works on phones','Testing speed with Google','Reading what Google and AI search see','Looking for ways to get in touch','Comparing with your sector','Writing your report'];

export function checkProgress(host:HTMLElement,{estimate=30000,steps=CHECK_STEPS,site=''}:{estimate?:number,steps?:string[],site?:string}={}){
  const C=2*Math.PI*52;
  host.innerHTML=`<div class="cp" role="status" aria-live="polite">
    <div class="cp-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="cp-bg"/><circle cx="60" cy="60" r="52" class="cp-fg" style="stroke-dasharray:${C};stroke-dashoffset:${C}"/></svg>
      <div class="cp-mid"><b data-cp-pct>0%</b><span data-cp-left>about ${Math.round(estimate/1000)}s</span></div></div>
    <div class="cp-body"><p class="cp-h">Checking ${site?`<span>${site.replace(/[<>&"]/g,'')}</span>`:'your site'}</p>
      <ol class="cp-steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>
  </div>`;
  const fg=host.querySelector<SVGCircleElement>('.cp-fg'),pct=host.querySelector<HTMLElement>('[data-cp-pct]'),left=host.querySelector<HTMLElement>('[data-cp-left]');
  const lis=[...host.querySelectorAll('li')];const t0=performance.now();let raf=0,stopped=false,shown=0;
  const paint=(p:number)=>{shown=p;fg.style.strokeDashoffset=String(C*(1-p));pct.textContent=Math.round(p*100)+'%';
    const at=Math.min(lis.length-1,Math.floor(p*lis.length));lis.forEach((li,i)=>{li.className=i<at?'done':i===at?'now':'';});};
  const tick=()=>{if(stopped)return;const e=(performance.now()-t0)/estimate;
    /* fast at first, slowing as it nears the end, never past 95% until done */
    paint(Math.min(.95,.04+(1-Math.pow(1-Math.min(e,1),2))*.91));
    const s=Math.max(0,Math.ceil((estimate-(performance.now()-t0))/1000));left.textContent=s>0?`about ${s}s`:'nearly there';
    raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);
  return {
    /* fill to 100% and tick every step, then resolve */
    done:()=>new Promise<void>(res=>{stopped=true;cancelAnimationFrame(raf);const from=shown,a=performance.now();
      const fin=(t:number)=>{const k=Math.min(1,(t-a)/500);paint(from+(1-from)*k);left.textContent='done';if(k<1)requestAnimationFrame(fin);else{lis.forEach(li=>li.className='done');setTimeout(res,350);}};requestAnimationFrame(fin);}),
    stop:()=>{stopped=true;cancelAnimationFrame(raf);}
  };
}
