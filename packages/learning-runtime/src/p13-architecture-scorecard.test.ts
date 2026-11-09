import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe('P13 Automated Architecture Verification & Measurable Scorecard', () => {
  it('runs check:architecture script and verifies 0 structural violations', () => {
    const stdout = execSync('node scripts/check-architecture.mjs', { encoding: 'utf8' });
    expect(stdout).toContain('Subject-specific frontend presentation leakage │ 0');
    expect(stdout).toContain('Forbidden direct DB/backend imports in clients │ 0');
    expect(stdout).toContain('Architecture rule violations                   │ 0');
    expect(stdout).toContain('Architectural verification PASSED');
  });
});
