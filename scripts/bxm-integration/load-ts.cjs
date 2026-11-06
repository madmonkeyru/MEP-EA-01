// Small local CLI bridge for non-UI TypeScript validation on Node 22.
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');
require.extensions['.ts'] = (module, filename) => {
  const names = [];
  const code = stripTypeScriptTypes(fs.readFileSync(filename, 'utf8'), { mode: 'transform' })
    .replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g, (_, bindings, target) =>
      `const {${bindings.replace(/\s+as\s+/g, ':')}} = require(${JSON.stringify(target)});`)
    .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, (_, binding, target) => `const ${binding} = require(${JSON.stringify(target)});`)
    .replace(/export\s+(async\s+)?(class|function|const|let)\s+(\w+)/g, (_, asyncPrefix, kind, name) => { names.push(name); return `${asyncPrefix || ''}${kind} ${name}`; })
    .replace(/export\s*\{\s*\};?/g, '');
  module._compile(`${code}\nObject.assign(exports, {${names.join(',')}});`, filename);
};
module.exports = name => require(path.resolve(__dirname, '../..', name));
