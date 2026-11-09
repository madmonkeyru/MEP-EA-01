#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestSubjectPackage } from '../../packages/content/src/authoring/ingestion';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authoredDir = path.resolve(__dirname, '../../content/authored');

console.log('[content:ingest] Ingesting authored subject packages under:', authoredDir);

function findPackageFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackageFiles(full));
    } else if (entry.name.endsWith('-package.json') || entry.name === 'package.json') {
      results.push(full);
    }
  }
  return results;
}

const packageFiles = findPackageFiles(authoredDir);
let totalIngested = 0;

for (const file of packageFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw.schemaVersion !== '1.0.0' || !raw.subject) continue;

    console.log(`Ingesting subject: ${raw.subject.name} [${raw.subject.id}]...`);
    const ingested = ingestSubjectPackage(raw);
    console.log(`✅ Ingested successfully: ${ingested.nodes.length} nodes, ${ingested.lessons.length} lessons, ${ingested.questions.length} questions, ${ingested.blueprints.length} blueprints.`);
    totalIngested++;
  } catch (err) {
    console.error(`❌ Ingestion error for ${file}:`, err.message);
    process.exit(1);
  }
}

console.log(`\n[content:ingest] ✨ Finished ingesting ${totalIngested} subject package(s).`);
