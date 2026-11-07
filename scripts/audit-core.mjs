import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:4173';
const recording = process.argv.includes('--record-only');
const label = recording ? 'before' : 'after';
const server = process.argv.includes('--start-server') ? spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host=127.0.0.1', `--port=${new URL(base).port || 4173}`, '--strictPort'], { stdio: ['ignore', 'ignore', 'inherit'], windowsHide: true }) : undefined;
if (server) {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { ready = (await fetch(base)).ok; } catch { /* Server is starting. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) { server.kill(); throw new Error('Production preview did not start'); }
}
const browser = await chromium.launch({ executablePath: process.env.FLOW_CHROME_PATH, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const reports = [];
const errors = [];
await mkdir('artifacts/consolidation/screenshots', { recursive: true });
page.on('pageerror', error => errors.push(error.message));
const learning = '/#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje';
const routes = [
  ['entry', '/#/', 'h1'],
  ['programs', '/#/programas', 'h1'],
  ['subject', '/#/programas/bxm/matematicas?convocatoria=2026-c2', 'h1'],
  ['learning', learning, '.learning-nav'],
  ['temario', learning + '&seccion=temario', '.curriculum-list'],
  ['progress', learning + '&seccion=progress', 'h1'],
  ['resources', '/#/programas/bxm/espanol?seccion=resources', '.official-resources'],
  ['calendar', '/#/calendario', '.calendar-event-grid'],
];
try {
  for (const [name, path, ready] of routes) {
    await page.goto(base + path);
    await page.locator(ready).first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const theme of recording ? ['light'] : ['light', 'dark']) for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(theme => { document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.colorScheme = theme; }, theme);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      reports.push({ name, width, theme, overflow, violations: result.violations });
      if (!recording) await page.screenshot({ path: `artifacts/consolidation/screenshots/${name}-${width}-${theme}.png`, fullPage: true });
    }
  }
  await page.goto(base + learning);
  await page.getByRole('button', { name: 'Hacer diagnóstico', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Comenzar actividad', exact: true }).click();
  await page.locator('.assessment-workspace').waitFor();
  for (const theme of recording ? ['light'] : ['light', 'dark']) for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(theme => { document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.colorScheme = theme; }, theme);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    reports.push({ name: 'diagnostic', width, theme, overflow, violations: result.violations });
    if (!recording) await page.screenshot({ path: `artifacts/consolidation/screenshots/diagnostic-${width}-${theme}.png`, fullPage: true });
  }
  await mkdir('artifacts/consolidation', { recursive: true });
  await writeFile(`artifacts/consolidation/axe-${label}.json`, JSON.stringify({ reports, errors }, null, 2));
  const serious = reports.flatMap(report => report.violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => `${report.name}/${report.width}/${report.theme}: ${v.id} (${v.nodes.length})`));
  console.log(JSON.stringify({ serious, overflow: reports.filter(r => r.overflow).map(r => `${r.name}/${r.width}`), errors }, null, 2));
  if (process.argv.includes('--lighthouse')) {
    const { default: lighthouse } = await import('lighthouse');
    const { launch } = await import('chrome-launcher');
    const chrome = await launch({ chromePath: process.env.FLOW_CHROME_PATH, chromeFlags: ['--headless', '--no-sandbox'] });
    try {
      const result = await lighthouse(base, { port: chrome.port, onlyCategories: ['performance', 'accessibility'], output: 'json' });
      await writeFile(`artifacts/consolidation/lighthouse-${label}.json`, result.report);
      console.log(JSON.stringify(Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score]))));
    } finally { await chrome.kill(); }
  }
  if (!recording) {
    assert.deepEqual(serious, [], 'Serious/critical axe violations');
    assert.equal(reports.some(report => report.overflow), false, 'Horizontal page overflow');
    assert.deepEqual(errors, [], 'Runtime errors');
  }
} finally {
  await browser.close();
  server?.kill();
}
