/* =====================================================================
   PORTAL PROPOSAL — a private page for one project (for example the
   proposal and plan), written by our team in Markdown in Admin and shown
   only to people on the project. The renderer escapes everything first and
   only allows a small set of Markdown: headings, paragraphs, bold, links,
   bullet and numbered lists, tables and rules.
   ===================================================================== */
import {S,esc} from './core';

export function parseFront(md:string){
  const m=/^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(md||'');
  const meta:Record<string,string>={};
  if(m)for(const line of m[1].split('\n')){const i=line.indexOf(':');if(i>0)meta[line.slice(0,i).trim()]=line.slice(i+1).trim();}
  return {meta,body:m?md.slice(m[0].length):md||''};
}

const safeHref=(u:string)=>/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u)?u:'#';
function inline(s:string){
  let h=esc(s);
  h=h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,t,u)=>{const href=safeHref(u.replace(/&amp;/g,'&'));const ext=/^https?:\/\//i.test(href)&&!/^https?:\/\/(www\.)?minshallgroup\.com/i.test(href);
    return `<a class="ulink" href="${esc(href)}"${ext?' target="_blank" rel="noopener"':''}>${t}</a>`;});
  h=h.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');
  return h;
}

export function renderMarkdown(md:string){
  const lines=md.replace(/\r/g,'').split('\n');const out:string[]=[];let i=0;
  const isTable=(l:string)=>/^\s*\|.*\|\s*$/.test(l);
  while(i<lines.length){
    const l=lines[i];
    if(!l.trim()){i++;continue;}
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(l)){out.push('<hr>');i++;continue;}
    const h=/^(#{1,4})\s+(.*)$/.exec(l);
    if(h){const tag=h[1].length<=2?'h3':'h4';out.push(`<${tag} class="pr-h">${inline(h[2].replace(/\.$/,''))}</${tag}>`);i++;continue;}
    if(isTable(l)&&lines[i+1]&&/^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])){
      const cells=(r:string)=>r.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=cells(l);i+=2;const rows:string[][]=[];while(i<lines.length&&isTable(lines[i]))rows.push(cells(lines[i++]));
      out.push(`<div class="pr-table"><table class="pp-table"><thead><tr>${head.map(c=>`<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue;}
    if(/^\s*[-*]\s+/.test(l)){const items:string[]=[];while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i]))items.push(lines[i++].replace(/^\s*[-*]\s+/,''));out.push(`<ul class="pr-ul">${items.map(t=>`<li>${inline(t)}</li>`).join('')}</ul>`);continue;}
    if(/^\s*\d+[.)]\s+/.test(l)){const items:string[]=[];while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i]))items.push(lines[i++].replace(/^\s*\d+[.)]\s+/,''));out.push(`<ol class="pr-ol">${items.map(t=>`<li>${inline(t)}</li>`).join('')}</ol>`);continue;}
    const para:string[]=[];while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|\s*[-*]\s+|\s*\d+[.)]\s+|\s*\|)/.test(lines[i])&&!/^\s*-{3,}\s*$/.test(lines[i]))para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

export function viewProposal(el:HTMLElement){
  const p=S.current;const {meta,body}=parseFront(p.page_md||'');
  /* the first heading becomes the page title */
  const m=/^#\s+(.+)$/m.exec(body);const title=m?m[1].replace(/\.$/,''):meta.title||p.business_name;const rest=m?body.replace(m[0],''):body;
  const facts=[['Prepared for',meta.prepared_for],['Prepared by',meta.prepared_by],['Version',meta.version],['Date',meta.date&&/^\d{4}-\d{2}-\d{2}$/.test(meta.date)?new Date(meta.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):meta.date]].filter(([,v])=>v);
  el.innerHTML=`<article class="pr">
    <header class="pr-head"><span class="eyebrow">${esc(meta.client||p.business_name)}</span><h2 class="display pr-title">${esc(title)}<span class="dot">.</span></h2>
      ${facts.length?`<dl class="pr-facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''}</header>
    <div class="pr-body">${renderMarkdown(rest)}</div></article>`;
}
