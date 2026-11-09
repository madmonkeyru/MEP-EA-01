#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSubjectPackage } from '../../packages/content/src/authoring/validator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authoredDir = path.resolve(__dirname, '../../content/authored');

console.log('[content:validate] Validating authored subject packages under:', authoredDir);

if (!fs.existsSync(authoredDir)) {
  console.log('[content:validate] No authored packages directory found. Creating...');
  fs.mkdirSync(authoredDir, { recursive: true });
}

function findPackageFiles(dir) {
  const results = [];
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
if (packageFiles.length === 0) {
  console.log('[content:validate] No package files found to validate.');
  process.exit(0);
}

let totalErrors = 0;
for (const file of packageFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw.schemaVersion !== '1.0.0' || !raw.subject) {
      continue;
    }
    console.log(`\nValidating: ${path.relative(process.cwd(), file)} (${raw.subject.name})...`);
    const report = validateSubjectPackage(raw);
    if (!report.valid) {
      console.error(`❌ Validation failed with ${report.errors.length} error(s):`);
      for (const err of report.errors) {
        console.error(`  - ${err}`);
      }
      totalErrors += report.errors.length;
    } else {
      console.log(`✅ Valid! (${report.stats.domainsCount} domains, ${report.stats.evidencesCount} evidences, ${report.stats.questionsCount} questions, ${report.stats.blueprintsCount} blueprints)`);
    }
  } catch (err) {
    console.error(`❌ Failed to parse ${file}:`, err.message);
    totalErrors++;
  }
}

if (totalErrors > 0) {
  console.error(`\n[content:validate] ❌ Validation finished with ${totalErrors} error(s).`);
  process.exit(1);
} else {
  console.log('\n[content:validate] ✨ All subject packages validated successfully.');
}
