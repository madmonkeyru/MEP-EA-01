import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
const chrome = join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe');
const executablePath = process.env.FLOW_CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const context = await browser.newContext(); const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:4173';
  await page.goto(`${base}/learn`);
  await page.getByRole('combobox').nth(0).selectOption('bxm');
  await page.getByRole('combobox').nth(1).selectOption('matematica');
  const evidence = page.getByLabel('Evidencia', { exact: true });
  await evidence.waitFor();
  assert.equal(await evidence.locator('option').count(), 72);
  await evidence.selectOption('bxm/matematica/02-2026/geometry/A1.1');
  await page.getByText('Evidencia scaffolded: lección no disponible todavía.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Practicar esta evidencia' }).isDisabled(), true);
  for (const [key, title] of [
    ['geometry/A1.2', 'Ecuación Canónica y Elementos de la Circunferencia'],
    ['geometry/A5.3', ''], ['functions/A2.3', ''], ['statistics/A1.2', ''],
  ]) {
    await evidence.selectOption(`bxm/matematica/02-2026/${key}`);
    await page.getByRole('heading', { name: 'Ejemplo resuelto', exact: true }).waitFor();
    if (title) await page.getByRole('heading', { name: title }).waitFor();
  }
  await evidence.selectOption('bxm/matematica/02-2026/geometry/A5.3');
  await mkdir('artifacts/p2', { recursive: true });
  await page.screenshot({ path: 'artifacts/p2/lesson.png', fullPage: true });
  await page.getByRole('button', { name: 'Practicar esta evidencia' }).click();
  await page.getByText('Pregunta 1 de 3', { exact: true }).waitFor();
  // A5.3 starts with geo-006, not the first question in the geometry domain.
  await page.getByText('Una esfera de radio', { exact: false }).first().waitFor();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.reload();
  await page.getByText('Pregunta 2 de 3', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio').nth(1).isChecked(), true);
  await page.getByRole('button', { name: 'Entregar prueba' }).click();
  await page.getByRole('heading', { name: 'Resultado: 1 / 3' }).waitFor();
  await page.getByRole('heading', { name: 'Diagnóstico inicial' }).waitFor();
  await page.getByRole('heading', { name: 'Plan de refuerzo' }).waitFor();
  await page.getByText('Ver solución paso a paso').first().click();
  await page.screenshot({ path: 'artifacts/p2/learner-result.png', fullPage: true });
  await page.close(); const reopened = await context.newPage();
  await reopened.goto(`${base}/learn`);
  await reopened.getByRole('heading', { name: 'Resultado: 1 / 3' }).waitFor();
  await reopened.getByRole('button', { name: 'Estudiar evidencia geometry A5.3', exact: true }).click();
  await reopened.getByRole('heading', { name: 'Ejemplo resuelto', exact: true }).waitFor();
  await reopened.getByRole('button', { name: 'Comenzar diagnóstico' }).click();
  await reopened.getByText('Pregunta 1 de 30', { exact: true }).waitFor();
  await reopened.getByRole('button', { name: 'Entregar prueba' }).click();
  await reopened.getByRole('heading', { name: 'Resultado: 0 / 30' }).waitFor();
  await reopened.getByRole('button', { name: 'Iniciar nueva evaluación' }).click();
  await reopened.getByText('Pregunta 1 de 30', { exact: true }).waitFor();
  assert.equal(await reopened.getByRole('radio').first().isChecked(), false);
  await reopened.goto(`${base}/foundation`);
  await reopened.getByText('Pregunta 1 de 30', { exact: true }).waitFor();
  await reopened.setViewportSize({ width: 375, height: 812 });
  assert.equal(await reopened.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await reopened.screenshot({ path: 'artifacts/p2/learner-mobile-web.png', fullPage: true });
  await reopened.getByRole('button', { name: 'Entregar prueba' }).click();
  await reopened.getByRole('button', { name: 'Volver al catálogo' }).click();
  await reopened.getByLabel('Evidencia', { exact: true }).selectOption('bxm/matematica/02-2026/geometry/A1.2');
  assert.equal(await reopened.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await reopened.screenshot({ path: 'artifacts/p2/lesson-mobile-web.png', fullPage: true });
  await reopened.goto(base);
  await reopened.getByRole('heading').first().waitFor();
  assert.equal(await reopened.getByRole('heading', { name: 'Mi ruta de aprendizaje' }).count(), 0);
  assert.deepEqual(errors, []);
  console.log('P2 browser passed: 71 evidence nodes, unavailable handling, four lessons, evidence-scoped practice, resume, scoring, remediation-to-lesson, 30-item diagnostic, new attempt and responsive layouts.');
} finally { await browser.close(); }
