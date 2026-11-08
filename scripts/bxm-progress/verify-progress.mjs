#!/usr/bin/env node

/**
 * Verification script for Agent C (BXM Progress, Recommendations, & Product Capabilities).
 * Runs type-checking, linter, and unit/integration test suites for the owned module.
 */

import { execSync, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();

console.log('=== BXM Progress Module Verification (Agent C) ===\n');

// 1. Verify owned directory layout
const requiredDirs = [
  'apps/web/src/features/bxm-progress/domain',
  'apps/web/src/features/bxm-progress/recommendations',
  'apps/web/src/features/bxm-progress/analytics',
  'apps/web/src/features/bxm-progress/capabilities',
  'apps/web/src/features/bxm-progress/storage',
  'apps/web/src/features/bxm-progress/ui',
  'apps/web/src/features/bxm-progress/__tests__',
  'scripts/bxm-progress',
  'project_docs/bxm-mvp/agent-c',
];

console.log('[1/4] Checking required directory structure...');
for (const dir of requiredDirs) {
  if (!existsSync(join(rootDir, dir))) {
    console.error(`Missing directory: ${dir}`);
    process.exit(1);
  }
}
console.log('✓ All owned directories verified.\n');

// 2. Run oxlint check
console.log('[2/4] Running oxlint on codebase...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✓ Linter passed with 0 errors/warnings.\n');
} catch {
  console.error('✗ Linter failed.');
  process.exit(1);
}

// 3. Run tsc check
console.log('[3/4] Running TypeScript compiler check...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ TypeScript compilation passed with 0 errors.\n');
} catch {
  console.error('✗ TypeScript compilation failed.');
  process.exit(1);
}

// 4. Run Vitest suite for bxm-progress
console.log('[4/4] Running Vitest suite for apps/web/src/features/bxm-progress...');
try {
  execFileSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'apps/web/src/features/bxm-progress/', '--pool=threads', '--maxWorkers=1'], { stdio: 'inherit' });
  console.log('✓ Progress module tests passed successfully.\n');
} catch {
  console.error('✗ Vitest tests failed.');
  process.exit(1);
}

console.log('=== Agent C Module Verification Complete ===');
