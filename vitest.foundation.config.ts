import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  include: ['packages/**/*.test.ts'], environment: 'node', pool: 'threads', maxWorkers: 1, fsModuleCache: false,
} });
