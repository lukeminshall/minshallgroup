/* Send social packs to Buffer as drafts.
   Nothing is published: each post lands in Buffer as a draft, and goes out
   only when you schedule or share it from Buffer.

   Usage:
     node scripts/social-buffer.mjs --channels          list your Buffer channels
     node scripts/social-buffer.mjs                     newest article
     node scripts/social-buffer.mjs <slug> [<slug>]     specific articles
     add --dry-run to print what would be sent without sending

   Needs:
     - the Buffer API key in the macOS Keychain (never in a file):
         security add-generic-password -s minshall-buffer -a api -w
     - the pack made first (node scripts/social.mjs <slug>) and the site
       deployed, because Buffer fetches the images from minshallgroup.com. */
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const SITE = 'https://minshallgroup.com';
const API = 'https://api.buffer.com';
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const slugsArg = args.filter(a => !a.startsWith('--'));

function key() {
  try { return execFileSync('security', ['find-generic-password', '-s', 'minshall-buffer', '-a', 'api', '-w'], {encoding: 'utf8'}).trim(); }
  catch { throw new Error('No Buffer key in the Keychain. Add it with: security add-generic-password -s minshall-buffer -a api -w'); }
}

async function gql(query, variables = {}) {
  const res = await fetch(API, {method: 'POST', headers: {Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json'},
    body: JSON.stringify({query, variables})});
  if (res.status === 429) throw new Error(`Buffer rate limit hit; try again in ${res.headers.get('retry-after') || 'a few'} seconds`);
  if (res.status === 401) throw new Error('Buffer rejected the API key (401). Check the key in the Keychain.');
  const body = await res.json();
  if (body.errors?.length) throw new Error('Buffer: ' + body.errors.map(e => `${e.message} (${e.extensions?.code || ''})`).join('; '));
  return body.data;
}

async function channels() {
  const {account} = await gql('query { account { organizations { id name } } }');
  const out = [];
  for (const org of account.organizations) {
    const {channels} = await gql('query($o: OrganizationId!) { channels(input: {organizationId: $o}) { id name service } }', {o: org.id});
    channels.forEach(c => out.push({...c, org: org.name}));
  }
  return out;
}

const CREATE = `mutation($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id } }
    ... on MutationError { message }
  }
}`;

/* newest pack by article date, read from the generated folders via the site content */
async function newestSlug() {
  const {build} = await import('esbuild');
  const {tmpdir} = await import('node:os');
  const {pathToFileURL} = await import('node:url');
  const tmp = join(tmpdir(), 'minshall-buffer-' + process.pid + '.mjs');
  await build({stdin: {contents: "export {INSIGHTS} from './src/content';", resolveDir: '.', loader: 'ts'}, bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'warning'});
  const {INSIGHTS} = await import(pathToFileURL(tmp).href);
  return [...INSIGHTS].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
}

async function live(url) {
  try { return (await fetch(url, {method: 'HEAD'})).ok; } catch { return false; }
}

if (args.includes('--channels')) {
  for (const c of await channels()) console.log(`${c.service.padEnd(12)} ${c.name.padEnd(30)} ${c.org}`);
  process.exit(0);
}

const slugs = slugsArg.length ? slugsArg : [(await newestSlug()).slug];
const chans = dry ? [{id: 'LINKEDIN_CHANNEL', service: 'linkedin', name: '(dry run)'}, {id: 'INSTAGRAM_CHANNEL', service: 'instagram', name: '(dry run)'}] : await channels();
const li = chans.filter(c => c.service === 'linkedin'), ig = chans.filter(c => c.service === 'instagram');
if (!li.length && !ig.length) throw new Error('No LinkedIn or Instagram channel connected in Buffer yet.');

for (const slug of slugs) {
  const dir = join('marketing/social', slug);
  if (!existsSync(join(dir, 'linkedin.txt'))) throw new Error(`No pack for ${slug}. Run: node scripts/social.mjs ${slug}`);
  const liText = readFileSync(join(dir, 'linkedin.txt'), 'utf8').trim();
  const igText = readFileSync(join(dir, 'instagram.txt'), 'utf8').trim();
  const alt = igText.split('\n')[0];
  const liImg = `${SITE}/social/${slug}/linkedin.png`, igImg = `${SITE}/social/${slug}/instagram.png`;
  if (!dry && !(await live(igImg) && await live(liImg))) throw new Error(`The images for ${slug} are not on the live site yet. Push the site first, then run this again.`);

  const posts = [
    ...li.map(c => [c, {text: liText, channelId: c.id, schedulingType: 'automatic', saveToDraft: true,
      assets: [{image: {url: liImg, metadata: {altText: alt}}}]}]),
    ...ig.map(c => [c, {text: igText, channelId: c.id, schedulingType: 'automatic', saveToDraft: true,
      assets: [{image: {url: igImg, metadata: {altText: alt}}}], metadata: {instagram: {type: 'post', shouldShareToFeed: true}}}])
  ];
  for (const [c, input] of posts) {
    if (dry) { console.log(`\n--- ${c.service} draft for ${slug} ---\n` + JSON.stringify(input, null, 2)); continue; }
    const {createPost} = await gql(CREATE, {input});
    if (createPost.message) console.log(`✗ ${c.service} (${c.name}): ${createPost.message}`);
    else console.log(`✓ ${c.service} (${c.name}): draft saved for ${slug}`);
  }
}
if (!dry) console.log('\nOpen Buffer, check the drafts, then schedule or share them.');
