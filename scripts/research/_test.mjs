/* one-off: send the next real first email, unchanged except the subject, to our own address
   node scripts/research/_test.mjs you@example.com   (RAW=1 keeps the real subject) */
import fs from 'node:fs';
import { mailer, graphReady, graphMissing } from './msgraph.mjs';
const DIR='research/raw/outreach', box='hello@minshallgroup.com', to=process.argv[2];
if(!to){console.error('Give the address to send the test to.');process.exit(1);}
if(!graphReady()){console.error(`Microsoft sign-in details missing from the Keychain: ${graphMissing().join(', ')}`);process.exit(1);}
const state=JSON.parse(fs.readFileSync(`${DIR}/state.json`,'utf8'));
let c;for(const l of fs.readFileSync(`${DIR}/queue.jsonl`,'utf8').split('\n')){if(!l)continue;const q=JSON.parse(l);if(q.batch[0]==='A'&&!state.contacts[q.email.toLowerCase()]?.sent?.length){c=q;break;}}
const tx=mailer(box);await tx.verify();
const st=c.steps[0];
const info=await tx.sendMail({from:`Minshall Group <${box}>`,to,subject:process.env.RAW?st.subject:`TEST: ${st.subject}`,text:st.text,replyTo:box,headers:{'List-Unsubscribe':`<mailto:${box}?subject=unsubscribe>`}});
console.log('sent test to',to,'as the email for',c.email,'|',info.response);
