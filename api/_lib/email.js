/* Branded email layout for everything clients receive.
   brandEmail({ preheader, eyebrow, heading, greeting, paras, list, quote, button, after, reason })
   returns { html, text }. Table layout with inline styles so it holds up in
   Outlook, Gmail and Apple Mail; the plain-text version goes alongside.
   Anything a person typed (names, messages) is escaped here. */
const SITE = 'https://minshallgroup.com';
const C = { navy: '#0A1A3F', pink: '#FF2E63', pinkD: '#D6164B', ink: '#14171A', muted: '#5D6578', line: '#E2E5EE', soft: '#F3F4F8' };
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');

export const FROM = 'Minshall Group <hello@minshallgroup.com>';
export const FOOTER_TEXT = ['Minshall Group', 'hello@minshallgroup.com · minshallgroup.com', 'Minshall Group Limited, registered in England and Wales, company 17529393. Registered office: 66 Paul Street, London EC2A 4NA.'];

export function brandEmail({ preheader = '', eyebrow = '', heading = '', greeting = '', paras = [], score = null, list = [], listTitle = '', quote = '', button = null, after = [], reason = '' }) {
  const p = t => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink}">${t}</p>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:${C.soft}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.soft}">${esc(preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft}"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
    <tr><td style="background:${C.navy};border-radius:18px 18px 0 0;padding:26px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:12px"><img src="${SITE}/apple-touch-icon.png" width="40" height="40" alt="" style="display:block;border:0;border-radius:9px"></td>
        <td style="vertical-align:middle;font-family:${SANS};line-height:1">
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">minshall</div>
          <div style="font-size:9px;font-weight:700;letter-spacing:3.6px;color:${C.pink};padding-top:4px">GROUP</div>
        </td></tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;padding:36px 32px 12px">
      ${eyebrow ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.pinkD}">${esc(eyebrow)}</p>` : ''}
      ${heading ? `<h1 style="margin:0 0 22px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.2;color:${C.navy}">${esc(heading)}</h1>` : ''}
      ${greeting ? p(esc(greeting)) : ''}
      ${paras.map(t => p(esc(t))).join('')}
      ${score ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px;background:${C.navy};border-radius:14px"><tr><td style="padding:22px 24px">
        <div style="font-family:${SANS};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.pink}">Webmins Score</div>
        <div style="font-family:${SERIF};font-size:54px;line-height:1.05;color:#ffffff;padding:6px 0 2px">${esc(score.total)}<span style="font-size:22px;color:#9AA3BC">/100</span></div>
        ${score.grade ? `<div style="font-family:${SANS};font-size:15px;font-weight:700;color:#ffffff;padding-bottom:12px">${esc(score.grade)}</div>` : ''}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${(score.rows || []).map(([t, v]) => `<tr><td style="padding:7px 0;border-top:1px solid rgba(255,255,255,.14);font-family:${SANS};font-size:14px;color:#D5DAE6">${esc(t)}</td><td align="right" style="padding:7px 0;border-top:1px solid rgba(255,255,255,.14);font-family:${SANS};font-size:14px;font-weight:800;color:#ffffff">${esc(v)}</td></tr>`).join('')}</table>
      </td></tr></table>` : ''}
      ${listTitle && list.length ? `<p style="margin:6px 0 4px;font-family:${SANS};font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.navy}">${esc(listTitle)}</p>` : ''}
      ${list.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px">${list.map((t, i) => `<tr><td style="width:30px;vertical-align:top;padding:9px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:13px;font-weight:800;color:${C.pinkD}">${String(i + 1).padStart(2, '0')}</td><td style="padding:9px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink}">${esc(t)}</td></tr>`).join('')}</table>` : ''}
      ${quote ? `<div style="margin:4px 0 22px;padding:16px 20px;background:${C.soft};border-left:3px solid ${C.pink};border-radius:0 10px 10px 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">${nl(quote)}</div>` : ''}
      ${button ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:${C.pink}"><a href="${esc(button.url)}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:16px;font-weight:800;color:${C.navy};text-decoration:none;border-radius:999px">${esc(button.label)} &rarr;</a></td></tr></table>` : ''}
      ${after.map(t => `<p style="margin:0 0 14px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted}">${esc(t)}</p>`).join('')}
      <p style="margin:18px 0 26px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink}">Best wishes,<br><b>The Minshall Group team</b></p>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:0 0 18px 18px;padding:0 32px 28px">
      <div style="border-top:1px solid ${C.line};padding-top:18px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted}">
        <a href="mailto:hello@minshallgroup.com" style="color:${C.navy};font-weight:700;text-decoration:none">hello@minshallgroup.com</a> &nbsp;·&nbsp; <a href="${SITE}" style="color:${C.navy};font-weight:700;text-decoration:none">minshallgroup.com</a><br>
        Minshall Group Limited, registered in England and Wales, company 17529393. Registered office: 66 Paul Street, London EC2A 4NA.
        ${reason ? `<br><br>${esc(reason)}` : ''}
      </div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
  const text = [heading, '', greeting, greeting ? '' : null, ...paras.flatMap(t => [t, '']), score ? `Webmins Score: ${score.total}/100${score.grade ? ' (' + score.grade + ')' : ''}\n${(score.rows || []).map(([t, v]) => `  ${t}: ${v}`).join('\n')}\n` : null, listTitle && list.length ? listTitle + ':' : null, ...list.map((t, i) => `${i + 1}. ${t}`), list.length ? '' : null,
    quote ? quote + '\n' : null, button ? `${button.label}: ${button.url}\n` : null, ...after.flatMap(t => [t, '']), 'Best wishes,', 'The Minshall Group team', '', ...FOOTER_TEXT, reason ? '\n' + reason : null]
    .filter(x => x !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { html, text };
}
