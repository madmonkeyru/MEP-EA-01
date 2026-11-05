import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import katex from 'katex';
import { verifyAuthoredAnswers } from './verify-math.mjs';

const read = name => JSON.parse(fs.readFileSync(path.resolve(name), 'utf8'));
const dir = 'content/bxm-mvp-learning';
const catalog = read(`${dir}/evidence-catalog.json`).evidences;
const items = read(`${dir}/authored-items-pack.json`).items;
const lessons = read(`${dir}/lessons-pack.json`).lessons;
const templates = read(`${dir}/isomorphic-templates.json`).templates;
const spec = read('content/programs/bxm/matematica/specs/02-2026.json');
const canonical = spec.blocks.flatMap(b => b.affirmations.flatMap(a => a.evidences.map(e => [`bxm/matematica/02-2026/${b.areaId}/${e.code}`, e.desc])));
assert.deepEqual(catalog.map(e => [e.key, e.evidenceDesc]), canonical);
assert.equal(catalog.length, 71);
assert.equal(new Set(items.map(i => i.id)).size, items.length);
const keys = new Set(catalog.map(e => e.key));
const concepts = new Set(['geometry','algebra','statistics'].flatMap(d => read(`content/library/math/${d}_concepts.json`).map(c => c.id)));
for (const domain of ['geometry','functions','statistics']) {
  assert(items.filter(i => i.domain === domain).length >= 10);
  assert(lessons.some(l => l.domain === domain));
}
for (const item of items) {
  assert(keys.has(item.evidenceKey)); assert(concepts.has(item.conceptId)); assert(item.familyId);
  assert.deepEqual(Object.keys(item.options).sort(), ['A','B','C','D']);
  assert.equal(new Set(Object.values(item.options)).size,4, `Duplicate choices: ${item.id}`);
  assert(item.options[item.correctOption]);
  for (const letter of ['A','B','C','D']) if (letter !== item.correctOption) assert(item.distractorRationale[letter]);
}
let mathCount = 0;
function checkMath(value, label) {
  if (Array.isArray(value)) return value.forEach((v, i) => checkMath(v, `${label}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).forEach(([k,v]) => {
    if (k === 'latex') { katex.renderToString(v, { throwOnError: true, strict: 'ignore' }); mathCount++; }
    else checkMath(v, `${label}.${k}`);
  });
  if (typeof value !== 'string') return;
  // Parse block delimiters before inline delimiters; do not reinterpret prose as math.
  const pattern = /\$\$([\s\S]*?)\$\$|\$([^$]*?)\$/g;
  const remaining = value.replace(pattern, (_, block, inline) => {
    katex.renderToString(block ?? inline, { throwOnError: true, strict: 'ignore' }); mathCount++; return '';
  });
  assert(!remaining.includes('$'), `Unmatched math delimiter: ${label}`);
}
for (const lesson of lessons) {
  assert(keys.has(lesson.evidenceKey)); assert(lesson.microQuiz.length);
  for (const quiz of lesson.microQuiz) assert(quiz.options[quiz.correctOption]);
}
for (const template of templates) { assert(keys.has(template.evidenceKey)); assert(template.templateVersion); }
checkMath(items,'items'); checkMath(lessons,'lessons');
const checked = verifyAuthoredAnswers(items);
console.log(`PASS: 71 canonical evidences, ${items.length} items (${checked} answer checks), ${lessons.length} lessons, ${templates.length} templates, ${mathCount} parsed math expressions.`);
console.log('Human mathematical review remains pending. This validator does not certify content or provenance.');
