import { readFile, writeFile } from 'node:fs/promises';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const data = {
  evidence: await read('content/bxm-mvp-learning/evidence-catalog.json'),
  lessons: await read('content/bxm-mvp-learning/lessons-pack.json'),
  authored: await read('content/bxm-mvp-learning/authored-items-pack.json'),
  concepts: (await Promise.all(['geometry', 'algebra', 'statistics'].map(name => read(`content/library/math/${name}_concepts.json`)))).flat(),
};
const path = 'packages/content/src/expansion-data.json';
const output = `${JSON.stringify(data, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (await readFile(path, 'utf8') !== output) throw new Error('Learning catalog is stale: run npm run content:sync');
} else await writeFile(path, output);
console.log('Learning catalog snapshot matches preserved source packs.');
