import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const directory = 'artifacts/ux-remediation';
fs.mkdirSync(directory, { recursive: true });
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:5196';
const browser = await chromium.launch({ headless: true, executablePath: process.env.FLOW_CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const server = process.env.FLOW_BASE_URL ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5196', '--strictPort'], { windowsHide: true, stdio: 'ignore' });
const screenshots = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
const subject = `${base}/#/programas/bxm/matematicas?convocatoria=2026-c2`;
const legacyActive = () => page.evaluate(() => JSON.parse(localStorage.getItem('mep_ea_active_session')));
const journal = () => page.evaluate(() => JSON.parse(localStorage.getItem('bxm-mvp-progress:v1:learning:guest')));
async function capture(name) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(resolve)); });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name);
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true }); screenshots.push(name);
}
async function finishLegacy() {
  await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, entregar', exact: true }).click();
  await page.getByRole('heading', { name: /Tu resultado:/ }).waitFor();
}
async function confirmGuided() {
  await page.getByRole('dialog', { name: 'Antes de comenzar la actividad', exact: true }).getByRole('button', { name: /^(Comenzar actividad|Aceptar actividad limitada)$/ }).click();
}
try {
  for (let retry = 0; retry < 60; retry++) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for Vite. */ }
    if (retry === 59) throw Error('QA server did not start');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  // Start an actual legacy diagnostic; unanswered items must remain actionable.
  await page.goto(subject);
  await page.getByRole('button', { name: 'Diagnóstico Rápido', exact: true }).click();
  await page.getByRole('button', { name: 'Iniciar Diagnóstico (8 ítems)', exact: true }).click();
  await page.getByRole('heading', { name: 'Pregunta 1 de 8', exact: true }).waitFor();
  const originalLegacy = await legacyActive();
  await finishLegacy();
  const legacyRootUrl = page.url();
  await capture('legacy-weak-areas-desktop');
  await page.setViewportSize({ width: 390, height: 844 }); await capture('legacy-weak-areas-mobile');
  await page.getByRole('button', { name: 'Practicar Geometría', exact: true }).click();
  await page.getByRole('heading', { name: /^Pregunta 1 de / }).waitFor();
  let active = await legacyActive();
  assert.ok(active.items.every(item => item.area_id === 'geometry'));
  const targetedIds = active.itemIds;
  for (let index = 0; index < active.items.length; index++) {
    await page.locator(`input[type=radio][value="${active.items[index].correct_answer}"]`).check();
    if (index < active.items.length - 1) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await finishLegacy();
  await page.getByRole('button', { name: 'Comprobar sin ayudas', exact: true }).click();
  await page.getByRole('heading', { name: /^Pregunta 1 de / }).waitFor();
  active = await legacyActive();
  assert.deepEqual(active.itemIds, targetedIds);
  assert.equal(active.config.remediation.stage, 'retest');
  assert.equal(await page.getByRole('button', { name: 'Fórmulas', exact: true }).count(), 0);
  assert.equal(active.config.remediation.rootSessionId, originalLegacy.sessionId);
  await page.locator(`input[type=radio][value="${active.items[0].correct_answer}"]`).check();
  assert.equal(await page.getByRole('button', { name: 'Verificar respuesta y ver explicación', exact: true }).count(), 0);
  await page.reload(); await page.getByRole('heading', { name: /^Pregunta 1 de / }).waitFor();
  assert.equal((await legacyActive()).responses[active.items[0].id].selectedOption, active.items[0].correct_answer);
  for (let index = 0; index < active.items.length; index++) {
    await page.locator(`input[type=radio][value="${active.items[index].correct_answer}"]`).check();
    if (index < active.items.length - 1) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await finishLegacy();
  await page.getByText(/En las mismas .* correctas antes del refuerzo/).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Ver resultado de origen', exact: true }).getAttribute('href'), legacyRootUrl.slice(legacyRootUrl.indexOf('#')));
  await capture('legacy-retest-mobile');

  await page.evaluate(() => localStorage.setItem('mep_ea_subscription_tier', 'premium'));
  await page.goto(`${subject}&pantalla=aprendizaje&seccion=inicio`);
  await page.getByRole('button', { name: /Iniciar evaluación diagnóstica/i }).click();
  await confirmGuided();
  await page.getByRole('button', { name: 'Entregar examen', exact: true }).click();
  await page.waitForURL(/seccion=result/);
  const guidedRoot = (await journal()).results[0];
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture('guided-weak-areas-desktop');
  const targetButton = page.locator('button[data-evidence-key]').last();
  const key = await targetButton.getAttribute('data-evidence-key');
  await targetButton.click(); await confirmGuided();
  await page.getByRole('button', { name: 'Finalizar sesión', exact: true }).waitFor();
  active = (await journal()).active;
  assert.ok(active.items.every(item => item.evidenceId === key));
  assert.equal(active.policy.learningContext.rootSessionId, guidedRoot.sessionId);
  for (let index = 0; index < active.items.length; index++) {
    await page.getByRole('button', { name: `Opción ${active.items[index].correctAnswer}`, exact: true }).click();
    await page.getByRole('button', { name: 'Verificar respuesta', exact: true }).click();
    if (index < active.items.length - 1) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Finalizar sesión', exact: true }).click();
  await page.getByRole('button', { name: 'Comprobar mi avance sin ayudas', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 }); await capture('guided-practice-next-step-mobile');
  await page.getByRole('button', { name: 'Comprobar mi avance sin ayudas', exact: true }).click(); await confirmGuided();
  await page.getByRole('button', { name: 'Entregar examen', exact: true }).waitFor();
  active = (await journal()).active;
  assert.equal(active.policy.kind, 'retest');
  assert.ok(active.items.every(item => item.evidenceId === key));
  assert.equal(await page.getByRole('button', { name: 'Verificar respuesta', exact: true }).count(), 0);
  await page.getByRole('button', { name: `Opción ${active.items[0].correctAnswer}`, exact: true }).click();
  await page.reload(); await page.getByRole('button', { name: 'Entregar examen', exact: true }).waitFor();
  assert.equal((await journal()).active.states[0].draftOption, active.items[0].correctAnswer);
  for (let index = 0; index < active.items.length; index++) {
    await page.getByRole('button', { name: `Opción ${active.items[index].correctAnswer}`, exact: true }).click();
    if (index < active.items.length - 1) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Entregar examen', exact: true }).click();
  await page.getByText(/Un resultado aislado no certifica dominio/).waitFor();
  await capture('guided-retest-mobile');
  const guidedResultUrl = page.url();
  await page.setViewportSize({ width: 320, height: 740 }); await page.emulateMedia({ colorScheme: 'dark' }); await capture('guided-retest-small-dark');
  assert.equal((await journal()).results.length, 3);
  assert.equal((await journal()).results[0].learningContext.rootSessionId, guidedRoot.sessionId);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mep_ea_attempts')).length), 3);
  await page.evaluate(() => localStorage.setItem('mep_ea_user', JSON.stringify({ id: 'other-profile', name: 'Otro perfil', email: 'local@example.test' })));
  await page.reload(); await page.getByRole('heading', { name: 'Este resultado no está disponible', exact: true }).waitFor();
  await page.goto(legacyRootUrl); await page.getByRole('heading', { name: 'Resultado no disponible en este perfil', exact: true }).waitFor();
  await page.evaluate(() => localStorage.removeItem('mep_ea_user'));
  await page.goto(guidedResultUrl); await page.reload(); await page.getByText(/Un resultado aislado no certifica dominio/).waitFor();
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${directory}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), screenshots, runtimeErrors: errors, flows: ['legacy diagnostic → selected weak area → practice → retest → source comparison', 'guided diagnostic → selected plan skill → practice → retest → source comparison', 'reload preserves answers, scope and source', 'both result URLs are unavailable to another profile'] }, null, 2));
  console.log(`UX-09 passed: two complete loops, profile isolation, reload recovery and ${screenshots.length} screenshots without page overflow or runtime errors.`);
} finally { await browser.close(); server?.kill(); }
