/* Records a page's self-playing tour (?tour=1) to MP4.
   Needs: npm i puppeteer-core ffmpeg-static (in a scratch folder), Google Chrome.
   Usage: node record-demo.mjs "<page url>?tour=1" out.mp4 [width] [height]
   Chrome streams frames over the DevTools protocol; ffmpeg turns them
   into a constant 30 fps H.264 video. */
import puppeteer from 'puppeteer-core';
import ffmpeg from 'ffmpeg-static';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const [,, url, out, w = '1280', h = '720'] = process.argv;
const dir = fs.mkdtempSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'frames-'));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb', `--window-size=${w},${h}`] });
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 });
const cdp = await page.createCDPSession();
const frames = [];
cdp.on('Page.screencastFrame', async f => {
  const file = path.join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
  fs.writeFileSync(file, Buffer.from(f.data, 'base64')); frames.push([file, f.metadata.timestamp]);
  await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await page.goto(url, { waitUntil: 'networkidle2' });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: +w * 2, maxHeight: +h * 2, everyNthFrame: 1 });
await page.waitForFunction(() => !document.querySelector('[data-tour]')?.hidden, { timeout: 20000 });
await page.waitForFunction(() => document.querySelector('[data-tour]')?.hidden, { timeout: 150000, polling: 250 });
await new Promise(r => setTimeout(r, 1500));
await cdp.send('Page.stopScreencast'); await browser.close();
/* concat list with real frame durations, so motion keeps its true timing */
let list = '';
frames.forEach(([f, t], i) => { const d = i < frames.length - 1 ? Math.max(0.001, frames[i + 1][1] - t) : 1; list += `file '${f}'\nduration ${d.toFixed(4)}\n`; });
list += `file '${frames[frames.length - 1][0]}'\n`;
fs.writeFileSync(path.join(dir, 'list.txt'), list);
execFileSync(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=30,scale=${+w * 2}:${+h * 2}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', out], { stdio: 'ignore' });
fs.rmSync(dir, { recursive: true, force: true });
console.log('saved', out, frames.length, 'frames');
