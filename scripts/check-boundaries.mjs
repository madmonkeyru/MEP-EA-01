import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';

const allowed = {
  domain: [], validation: [], content: ['domain', 'validation'],
  'learning-runtime': ['domain', 'content', 'validation'], api: ['domain'], analytics: ['domain'], 'design-system': [],
};
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(resolve(directory, e.name)) : resolve(directory, e.name)))).flat();
}
const failures = [];
for (const [name, dependencies] of Object.entries(allowed)) {
  const root = resolve('packages', name);
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  for (const dep of Object.keys(manifest.dependencies ?? {})) {
    if (!dependencies.some(d => dep === `@mep-ea/${d}`)) failures.push(`${name}: forbidden dependency ${dep}`);
  }
  for (const path of (await walk(resolve(root, 'src'))).filter(p => p.endsWith('.ts') && !p.endsWith('.test.ts'))) {
    const source = await readFile(path, 'utf8');
    // Shared foundations use static ESM only; dynamic imports and require are deliberately excluded.
    if (/\b(?:import\s*\(|require\s*\()/.test(source)) failures.push(`${path}: use static ESM dependencies`);
    const imports = source.matchAll(/\b(?:from\s*|import\s*)['"]([^'"]+)['"]/g);
    for (const [, id] of imports) {
      if (id.startsWith('.')) {
        if (relative(root, resolve(dirname(path), id)).startsWith('..')) failures.push(`${path}: import escapes package ${id}`);
      } else if (!dependencies.some(d => id === `@mep-ea/${d}`)) failures.push(`${path}: forbidden import ${id}`);
    }
  }
}
if (failures.length) throw new Error(failures.join('\n'));
console.log('Shared package dependency boundaries passed (7 packages).');
