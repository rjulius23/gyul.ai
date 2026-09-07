import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const url = 'http://127.0.0.1:4387/';
let preview;
let browser;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
async function reachable() {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok;
  } catch {
    return false;
  }
}
async function freePort() {
  const server = createServer();
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  const port = address.port;
  await new Promise((done) => server.close(done));
  return port;
}
try {
  if (!(await reachable())) {
    const pkg = JSON.parse(
      await readFile('node_modules/astro/package.json', 'utf8'),
    );
    preview = spawn(
      process.execPath,
      [
        resolve('node_modules/astro', pkg.bin.astro),
        'preview',
        '--host',
        '127.0.0.1',
        '--port',
        '4387',
      ],
      {
        stdio: 'ignore',
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      },
    );
    for (let attempt = 0; attempt < 40 && !(await reachable()); attempt++)
      await sleep(200);
    if (!(await reachable()))
      throw new Error('Local preview did not start. Run npm run build first.');
  }
  const content = await (await fetch(url)).text();
  if (!content.includes('Gyula Halmos — AI consulting'))
    throw new Error(
      'Port 4387 is serving a different site; refusing to audit it.',
    );
  const port = await freePort();
  browser = await chromium.launch({
    args: [
      `--remote-debugging-port=${port}`,
      '--remote-debugging-address=127.0.0.1',
    ],
  });
  const result = await lighthouse(url, {
    port,
    output: 'html',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    throttlingMethod: 'simulate',
  });
  if (!result) throw new Error('Lighthouse returned no result');
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/lighthouse.html', result.report);
  await writeFile(
    'test-results/lighthouse.json',
    JSON.stringify(result.lhr, null, 2),
  );
  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([key, category]) => [
      key,
      Math.round(category.score * 100),
    ]),
  );
  const metrics = Object.fromEntries(
    [
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'total-blocking-time',
    ].map((key) => [key, result.lhr.audits[key].displayValue]),
  );
  console.log(
    JSON.stringify(
      {
        environment:
          'Local production build, simulated mobile Lighthouse; not field Core Web Vitals.',
        scores,
        metrics,
      },
      null,
      2,
    ),
  );
  if (scores.performance < 90 || scores.accessibility < 95)
    process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (preview) preview.kill('SIGTERM');
}
