import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

/** Serve the source PDFs in development and emit the same URLs for production.
 * Their source directories contain '#', which cannot be used as import URLs.
 */
export function officialResources(): Plugin {
  const moduleId = 'virtual:official-resources';
  const resolvedId = '\0' + moduleId;
  let files: { source: string; key: string; output: string; size?: number }[] = [];
  let base = '/';
  let isBuild = false;
  return {
    name: 'official-education-resources',
    async configResolved(config) {
      base = config.base;
      isBuild = config.command === 'build';
      const root = path.resolve(import.meta.dirname, '../project_docs/program_official_pdfs');
      const entries = await readdir(root, { recursive: true });
      files = entries.filter(entry => entry.toLowerCase().endsWith('.pdf')).sort().map(entry => {
        const key = entry.replaceAll('\\', '/');
        return { source: path.join(root, entry), key,
          output: `official-resources/${createHash('sha256').update(key).digest('hex').slice(0, 16)}.pdf` };
      });
      await Promise.all(files.map(async file => { file.size = (await stat(file.source)).size; }));
    },
    resolveId(id) { if (id === moduleId) return resolvedId; },
    load(id) {
      if (id === resolvedId) return `export const sizes = ${JSON.stringify(Object.fromEntries(files.map(file => [file.key, file.size])))}; export default ${JSON.stringify(Object.fromEntries(files.map(file => [file.key, `${base}${file.output}`])))};`;
    },
    async buildStart() {
      // Tests use development URLs; only production builds need emitted assets.
      if (!isBuild) return;
      for (const file of files) this.emitFile({ type: 'asset', fileName: file.output, source: await readFile(file.source) });
    },
    configureServer(server) {
      const byUrl = new Map(files.map(file => [`/${file.output}`, file.source]));
      server.middlewares.use((req, res, next) => {
        const source = byUrl.get((req.url || '').split('?')[0]);
        if (!source) return next();
        res.setHeader('Content-Type', 'application/pdf');
        const stream = createReadStream(source);
        stream.on('error', () => { res.statusCode = 500; res.end(); });
        stream.pipe(res);
      });
    },
  };
}
