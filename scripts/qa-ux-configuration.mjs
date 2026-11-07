import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const directory = 'artifacts/ux-configuration';
fs.mkdirSync(directory, { recursive: true });
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:5195';
const browser = await chromium.launch({ headless: true, executablePath: process.env.FLOW_CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const server = process.env.FLOW_BASE_URL ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5195', '--strictPort'], { windowsHide: true, stdio: 'ignore' });
const errors = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
const subject = `${base}/#/programas/bxm/matematicas?convocatoria=2026-c2`;
const journal = () => page.evaluate(() => JSON.parse(localStorage.getItem('bxm-mvp-progress:v1:learning:guest')));
async function capture(name) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(resolve)); });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name);
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true }); checks.push(name);
}
try {
  for (let retry = 0; retry < 60; retry++) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for Vite. */ }
    if (retry === 59) throw Error('QA server did not start');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await page.goto(subject);
  await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).waitFor();
  await page.getByLabel('Dificultad', { exact: true }).selectOption('3');
  await page.getByLabel('Cantidad de preguntas', { exact: true }).selectOption('custom');
  await page.getByLabel('Preguntas personalizadas', { exact: true }).fill('7');
  await capture('legacy-desktop');
  await page.setViewportSize({ width: 390, height: 844 }); await capture('legacy-mobile');
  await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).click();
  await page.getByRole('heading', { name: 'Pregunta 1 de 7', exact: true }).waitFor();
  // Use the persisted URL plus rendered count to verify restoration independently of storage-key naming.
  const attemptUrl = page.url();
  await page.getByRole('radio').first().click(); await page.reload();
  await page.getByRole('heading', { name: 'Pregunta 1 de 7', exact: true }).waitFor();
  assert.equal(await page.getByRole('radio').first().isChecked(), true);
  assert.equal(page.url(), attemptUrl);
  await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, entregar', exact: true }).click();
  await page.getByRole('heading', { name: /Tu resultado:/ }).waitFor();
  const savedLegacy = await page.evaluate(() => JSON.parse(localStorage.getItem('mep_ea_attempts'))[0].session);
  assert.equal(savedLegacy.items.length, 7);
  assert.ok(savedLegacy.items.every(item => item.difficulty_tier === 3));
  await page.goto(`${subject}&seccion=simulation`);
  await page.getByRole('button', { name: 'Preparar simulación', exact: true }).click();
  await capture('legacy-official-briefing-mobile');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();

  await page.evaluate(() => localStorage.setItem('mep_ea_subscription_tier', 'premium'));
  await page.goto(`${subject}&pantalla=aprendizaje&seccion=practice`);
  await page.getByLabel('Habilidad', { exact: true }).waitFor();
  await page.getByLabel('Dificultad de práctica', { exact: true }).selectOption('1');
  await page.getByLabel('Cantidad de preguntas', { exact: true }).selectOption('custom');
  await page.getByLabel('Preguntas personalizadas', { exact: true }).fill('2');
  for (const option of await page.getByLabel('Habilidad', { exact: true }).locator('option').all()) {
    await page.getByLabel('Habilidad', { exact: true }).selectOption(await option.getAttribute('value'));
    if ((await page.locator('.learning-configuration [role="status"]').innerText()).startsWith('2 preguntas')) break;
  }
  const evidence = await page.getByLabel('Habilidad', { exact: true }).inputValue();
  await capture('guided-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture('guided-desktop');
  await page.getByRole('button', { name: 'Preparar práctica', exact: true }).click();
  await capture('guided-briefing-desktop');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
  assert.equal(await page.getByLabel('Preguntas personalizadas', { exact: true }).inputValue(), '2');
  await page.getByRole('button', { name: 'Preparar práctica', exact: true }).click();
  await page.getByRole('button', { name: 'Comenzar actividad', exact: true }).click();
  await page.getByText('Pregunta 1 de 2', { exact: true }).waitFor();
  let saved = (await journal()).active;
  assert.equal(saved.items.length, 2);
  assert.ok(saved.items.every(item => item.evidenceId === evidence && item.difficultyTier === 1));
  assert.equal(saved.policy.mode, 'study'); assert.equal(saved.deadline, undefined);
  await page.getByRole('button', { name: 'Opción A', exact: true }).click();
  await page.reload(); await page.getByText('Pregunta 1 de 2', { exact: true }).waitFor();
  saved = (await journal()).active;
  assert.equal(saved.states[0].draftOption, 'A');
  await page.getByRole('button', { name: 'Finalizar sesión', exact: true }).click();
  await page.waitForURL(/seccion=result/);
  assert.equal((await journal()).results.at(-1).totalActualItems, 2);
  // Guided and legacy assessments must remain separate in persistence.
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mep_ea_attempts')).length), 1);
  await page.goto(`${subject}&pantalla=aprendizaje&seccion=practice`);
  await page.getByLabel('Cantidad de preguntas', { exact: true }).selectOption('custom');
  await page.getByLabel('Preguntas personalizadas', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Preparar práctica', exact: true }).click();
  await page.getByRole('button', { name: 'Aceptar actividad limitada', exact: true }).waitFor();
  await page.setViewportSize({ width: 320, height: 740 }); await capture('guided-shortfall-small-mobile');
  const acceptShortfall = page.getByRole('button', { name: 'Aceptar actividad limitada', exact: true });
  await acceptShortfall.scrollIntoViewIfNeeded();
  const actionBounds = await acceptShortfall.boundingBox();
  assert.ok(actionBounds && actionBounds.y >= 0 && actionBounds.y + actionBounds.height <= 740, 'Shortfall acceptance remains reachable inside the mobile dialog');
  await capture('guided-shortfall-actions-small-mobile');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'dark' }); await capture('guided-dark-small-mobile');
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${directory}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), screenshots: checks, runtimeErrors: errors, flows: ['legacy custom difficulty/count → restored answers → result', 'guided custom difficulty/count → cancel → start → restore → result', 'shortfall confirmation', 'separate guided and legacy history'] }, null, 2));
  console.log(`UX-07 passed: both complete flows and ${checks.length} screenshots without horizontal overflow or browser errors.`);
} finally { await browser.close(); server?.kill(); }
