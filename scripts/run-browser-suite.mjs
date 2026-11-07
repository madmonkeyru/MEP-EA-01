import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:4189';
const chrome = join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe');
const env = { ...process.env, FLOW_BASE_URL: base, ...(process.env.FLOW_CHROME_PATH ? {} : process.platform === 'win32' && existsSync(chrome) ? { FLOW_CHROME_PATH: chrome } : {}) };
const server = process.argv.includes('--start-server') || !process.env.FLOW_BASE_URL ? spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host=127.0.0.1', `--port=${new URL(base).port}`, '--strictPort'], { stdio: 'inherit', env, windowsHide: true }) : undefined;
const performance = process.argv.includes('--performance');
const entries = performance ? ['scripts/audit-performance.mjs'] : process.argv.includes('--learning-only') ? ['scripts/bxm-integration/validate-learning-journey.mjs'] : ['scripts/validate-ui.mjs', 'scripts/bxm-integration/validate-learning-journey.mjs', 'scripts/audit-core.mjs'];
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { ready = (await fetch(base)).ok; } catch { /* Preview is starting. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('Production preview did not start');
  for (const entry of entries) await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry], { stdio: 'inherit', env, windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${entry} exited with ${code}`)));
  });
} finally { server?.kill(); }
