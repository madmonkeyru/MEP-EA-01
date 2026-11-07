import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:4173';
const chrome = await launch({ chromePath: process.env.FLOW_CHROME_PATH, chromeFlags: ['--headless', '--no-sandbox'] });
try {
  const result = await lighthouse(base, { port: chrome.port, onlyCategories: ['performance', 'accessibility'], output: 'json' });
  await mkdir('artifacts/consolidation', { recursive: true });
  await writeFile('artifacts/consolidation/lighthouse-after.json', result.report);
  if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message);
  console.log(JSON.stringify(Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score]))));
} finally { await chrome.kill(); }
