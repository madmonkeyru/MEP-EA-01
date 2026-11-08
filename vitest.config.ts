import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { officialResources } from './scripts/officialResources.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), officialResources()],
  test: {
    globals: true,
    include: ['apps/web/src/**/*.test.{ts,tsx}'],
    // Keep transforms in-process: persisted temp paths are unreliable in Windows sandboxes.
    pool: 'threads',
    fsModuleCache: false,
    maxWorkers: 1,
    environment: 'jsdom',
    setupFiles: './apps/web/src/test/setup.ts',
  },
});
