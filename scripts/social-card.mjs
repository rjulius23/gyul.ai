import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import {
  createSignalGeometry,
  projectSignal,
  ringStyle,
  ringPath,
} from '../src/lib/signal.ts';

const sans = await readFile(
  'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  'base64',
);
const serif = await readFile(
  'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
  'base64',
);
const paths = projectSignal(createSignalGeometry())
  .map(
    (ring) =>
      `<path d="${ringPath(ring)}" fill="${ringStyle(ring).fill}" stroke="${ringStyle(ring).stroke}" stroke-width=".72"/>`,
  )
  .join('');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face{font-family:Grotesk;src:url(data:font/woff2;base64,${sans});font-weight:300 700}
    @font-face{font-family:Instrument;src:url(data:font/woff2;base64,${serif});font-style:italic}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f5f3ec;color:#20251f;font-family:Grotesk,Arial,sans-serif;padding:48px 58px;overflow:hidden}
    .brand{font-size:35px;letter-spacing:-3px;font-weight:600}.mark{display:inline-grid;place-items:center;width:29px;height:29px;background:#e8ef61;border-radius:50%;font-size:24px;margin-left:14px;letter-spacing:0}
    .kicker{font:10px monospace;letter-spacing:1px;margin-top:46px}h1{font-size:110px;font-weight:500;line-height:.92;letter-spacing:-8px;margin:24px 0}em{font-family:Instrument,Georgia,serif;font-size:1.14em;font-weight:400;letter-spacing:-4px}.sub{font-size:20px;letter-spacing:-.7px;margin-top:22px;line-height:1.45}
    .art{position:absolute;right:15px;top:32px;width:600px;height:530px}.footer{position:absolute;bottom:36px;left:58px;right:58px;border-top:1px solid #d8d9ce;padding-top:19px;display:flex;justify-content:space-between;font:11px monospace;color:#656a5e}
  </style></head><body><div class="brand">gyul.ai<span class="mark">✳</span></div><div class="kicker">INDEPENDENT THINKING. PRACTICAL AI.</div><h1>Put AI<br>to <em>work.</em></h1><div class="sub">Useful systems. Capable teams.<br>Less theatre.</div><svg class="art" viewBox="0 0 600 530" fill="none"><circle cx="300" cy="265" r="234" stroke="#d8d9ce" stroke-width=".6"/>${paths}</svg><div class="footer"><span>GYULA HALMOS / AI CONSULTANT & BUILDER</span><span>STRATEGY · AGENTS · WORKSHOPS</span></div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const path = resolve('public/social-card.png');
  await page.screenshot({ path });
  console.log(
    `Generated ${path} (1200 × 630). Original procedural artwork; no image model or network requests.`,
  );
} finally {
  await browser.close();
}
