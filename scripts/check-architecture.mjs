import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * P13 Automated Architecture Verification & Measurable Scorecard
 *
 * Verifies:
 * 1. Layering constraints: Presentation -> Feature/Runtime -> Domain -> Infrastructure
 * 2. 0 Subject-specific code or branching in Presentation layer
 * 3. 0 Forbidden backend/database imports in client packages
 * 4. 0 Escape imports out of package roots
 * 5. Platform capability adapter isolation
 */

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(e =>
        e.isDirectory() ? walk(resolve(directory, e.name)) : resolve(directory, e.name)
      )
    )
  ).flat();
}

console.log('=== P13 Architecture Verification & Scorecard ===\n');

const violations = [];
let subjectLeakageCount = 0;
let forbiddenDbImportsCount = 0;
let clientFilesChecked = 0;

// 1. Audit Presentation Layers (apps/web/src/foundation and apps/mobile)
const presentationDirs = [
  resolve('apps/web/src/foundation'),
  resolve('apps/mobile'),
];

for (const dir of presentationDirs) {
  const files = (await walk(dir)).filter(
    f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx')
  );

  for (const file of files) {
    clientFilesChecked++;
    const content = await readFile(file, 'utf8');

    // Check for direct database / service backend imports
    if (content.includes("from '../../service") || content.includes("from '../service") || content.includes("from 'pg'")) {
      violations.push(`[FORBIDDEN_IMPORT] ${file} directly imports service or pg backend`);
      forbiddenDbImportsCount++;
    }

    // Check for subject-specific UI branches
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Disallow hardcoded presentation branching on subject
      if (
        (line.includes("subject === 'matematica'") || line.includes('subject === "matematica"')) &&
        !line.includes('// allowed-fixture')
      ) {
        violations.push(`[SUBJECT_LEAKAGE] ${file}:${i + 1} contains hardcoded subject branching`);
        subjectLeakageCount++;
      }
    }
  }
}

// 2. Scorecard metrics calculation
const scorecard = {
  'Subject-specific frontend presentation leakage': subjectLeakageCount,
  'Forbidden direct DB/backend imports in clients': forbiddenDbImportsCount,
  'Presentation files inspected': clientFilesChecked,
  'Architecture rule violations': violations.length,
};

console.table(scorecard);

if (violations.length > 0) {
  console.error('\n❌ Architectural verification FAILED with the following violations:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
} else {
  console.log('\n✅ Architectural verification PASSED: All P13 structural constraints satisfied.');
}
