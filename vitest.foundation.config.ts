import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  include: ['packages/**/*.test.ts', 'apps/service/**/*.test.ts'], environment: 'node', pool: 'threads', maxWorkers: 1, fsModuleCache: false,
} });
