/* =====================================================================
   WEBMINS SCORE — shared scoring used by /digitalsme and /tools/prospect.
   Pillars and signals come from api/audit.js; weights, grades and sector
   essentials from SCORE in content.ts.
   ===================================================================== */
import {SCORE} from './content';

export const essOk=(sig,k)=>k==='bookOrOrder'?!!(sig.booking||sig.ecommerce):k==='tel'?!!sig.tel:!!sig[k];
export function score(j,ind){
  const I=SCORE.industries.find(x=>x.id===ind)||SCORE.industries[SCORE.industries.length-1];
  const ess=I.ess.map(([k,t])=>({t,ok:essOk(j.signals,k)}));
  const fit=Math.round(ess.filter(e=>e.ok).length/ess.length*100);
  const p={...j.pillars,industry:fit};
  const total=Math.round(Object.entries(SCORE.weights).reduce((s,[k,w])=>s+(p[k]||0)*(w as number),0));
  const grade=SCORE.grades.find(([min])=>total>=(min as number))[1] as string;
  return {I,ess,fit,p,total,grade};
}
