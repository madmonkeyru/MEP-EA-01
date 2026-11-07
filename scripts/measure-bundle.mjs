import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { basename, join } from 'node:path';
import assert from 'node:assert/strict';
const budget = JSON.parse(await readFile('project_docs/consolidation/bundle-budget.json', 'utf8'));
const html = await readFile('dist/index.html', 'utf8');
const entryFile = basename(html.match(/<script[^>]+src="([^"]+\.js)"/)[1]);
const javascript = [];
for (const file of (await readdir('dist/assets')).filter(file => file.endsWith('.js')).sort()) {
  const bytes = await readFile(join('dist/assets', file));
  javascript.push({ file, bytes: bytes.length, gzipBytes: gzipSync(bytes, { level: 9 }).length });
}
const entry = javascript.find(asset => asset.file === entryFile);
const totalBytes = javascript.reduce((total, asset) => total + asset.bytes, 0);
const report = { entry, totalBytes, baseline: budget, javascript };
await mkdir('artifacts/consolidation', { recursive: true });
await writeFile('artifacts/consolidation/bundle-after.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ entry, totalBytes, entryDeltaBytes: entry.bytes - budget.entryBytes, aggregateDeltaBytes: totalBytes - budget.baselineTotalJavaScriptBytes }, null, 2));
assert(entry.bytes <= budget.entryBytes, 'Entry chunk exceeds Phase 0 byte budget');
assert(entry.gzipBytes <= budget.entryGzipBytes, 'Entry chunk exceeds Phase 0 gzip budget');
