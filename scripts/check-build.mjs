import assert from 'node:assert/strict';
import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const output = resolve('dist');
const html = await readFile(resolve(output, 'index.html'), 'utf8');
const ids = [...html.matchAll(/(?<![\w:-])id="([^"]+)"/g)].map(
  (match) => match[1],
);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
assert.equal(
  [...html.matchAll(/<h1(?:\s|>)/g)].length,
  1,
  'Exactly one primary heading',
);
assert.ok(
  html.includes('href="https://gyul.ai/"'),
  'Canonical must use the root custom domain',
);
assert.ok(
  !html.includes('/Users/'),
  'No machine-local paths in published HTML',
);
assert.ok(
  !html.includes('fonts.googleapis.com'),
  'Fonts must remain self-hosted',
);
assert.ok(
  !/<form\b/i.test(html),
  'Contact composer must not introduce an implicit form submission',
);
assert.equal(
  (await readFile(resolve(output, 'CNAME'), 'utf8')).trim(),
  'gyul.ai',
);

let checkedReferences = 0;
for (const [, href] of html.matchAll(/(?<![\w:-])(?:src|href)="([^"]+)"/g)) {
  if (href.startsWith('#')) {
    assert.ok(ids.includes(href.slice(1)), `Missing fragment ${href}`);
    continue;
  }
  if (!href.startsWith('/') || href.startsWith('//')) continue;
  const pathname = decodeURIComponent(
    new URL(href, 'https://gyul.ai').pathname,
  );
  const path = resolve(
    output,
    `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`,
  );
  assert.ok(path.startsWith(`${output}/`), 'Asset must stay inside dist');
  assert.ok((await stat(path)).isFile(), `Missing built asset: ${href}`);
  checkedReferences++;
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(path) : [path]));
  }
  return files;
}
const files = await walk(output);
const scripts = files.filter((path) => extname(path) === '.js');
let javascriptBytes = 0,
  javascriptGzipBytes = 0;
for (const path of scripts) {
  const content = await readFile(path);
  javascriptBytes += content.length;
  javascriptGzipBytes += gzipSync(content).length;
}
assert.ok(
  javascriptGzipBytes < 100 * 1024,
  'Client JavaScript must stay below 100 KiB gzip',
);
const card = await readFile(resolve(output, 'social-card.png'));
assert.equal(card.subarray(1, 4).toString(), 'PNG', 'Social card must be PNG');
assert.equal(card.readUInt32BE(16), 1200);
assert.equal(card.readUInt32BE(20), 630);

const summary = {
  checkedReferences,
  htmlBytes: Buffer.byteLength(html),
  htmlGzipBytes: gzipSync(html).length,
  javascriptBytes,
  javascriptGzipBytes,
  javascriptFiles: scripts.length,
  socialCard: '1200 × 630 PNG',
};
await mkdir('test-results', { recursive: true });
await writeFile(
  'test-results/build-summary.json',
  JSON.stringify(summary, null, 2) + '\n',
);
console.log(JSON.stringify(summary, null, 2));
