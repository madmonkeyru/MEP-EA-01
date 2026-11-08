import { defineConfig } from 'vite';
export default defineConfig({ build: { ssr: 'apps/service/src/main.ts', outDir: 'dist-service',
  rollupOptions: { output: { entryFileNames: 'main.js' } } }, ssr: { noExternal: [/^@mep-ea\//] } });
