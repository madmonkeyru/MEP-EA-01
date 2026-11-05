import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const startServer = process.argv.includes('--start-server');
const base = process.env.FLOW_BASE_URL || (startServer ? 'http://127.0.0.1:5174' : 'http://127.0.0.1:5173');
const server = startServer ? spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host=127.0.0.1', '--port=5174', '--strictPort'], { stdio: 'ignore', windowsHide: true }) : undefined;
const executablePath = process.env.FLOW_CHROME_PATH || (process.platform === 'win32' ? join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe') : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = []; page.on('pageerror', e => errors.push(e.message));
const path = '/#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje';
const key = 'bxm/matematica/02-2026/geometry/A1.2';
const journal = () => page.evaluate(() => JSON.parse(localStorage.getItem('bxm-mvp-progress:v1:learning:guest')));
await mkdir('artifacts/bxm-integration', { recursive: true });
const checks = [];
try {
  if (server) {
    let ready = false;
    for (let i=0; i<100; i++) {
      try { ready = (await fetch(base)).ok; } catch { /* Server is starting. */ }
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    assert(ready, 'Local verification server did not start');
  }
  await page.goto(base + '/#/programas/bxm/matematicas?convocatoria=2026-c2');
  await page.getByRole('button', { name: 'Abrir aprendizaje guiado', exact: true }).click();
  await page.getByRole('heading', { name: 'Aprendizaje guiado · Matemáticas BXM', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Preparar diagnóstico', exact: true }).click();
  await page.getByRole('dialog', { name: 'Antes de comenzar la actividad' }).getByRole('button', { name: 'Comenzar actividad', exact: true }).click();
  await page.getByRole('button', { name: 'Opción A', exact: true }).click();
  await page.getByRole('button', { name: 'Marcar para revisión', exact: true }).click();
  const original = await journal();
  const deadline = original.active.deadline;
  await page.reload();
  await page.getByRole('button', { name: 'Opción A', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Opción A', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal((await journal()).active.deadline, deadline);
  await page.getByRole('button', { name: 'Desmarcar', exact: true }).waitFor();
  checks.push('Free diagnostic, shuffled drafts/review flags and original deadline survive reload');
  await page.getByRole('button', { name: 'Entregar examen', exact: true }).click();
  await page.getByRole('heading', { name: 'Resultados de la Evaluación BXM', exact: true }).waitFor();
  const resultUrl = page.url();
  await page.reload();
  await page.getByRole('heading', { name: 'Resultados de la Evaluación BXM', exact: true }).waitFor();
  assert.equal(page.url(), resultUrl);
  assert.equal((await journal()).results.length, 1);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bxm-mvp-progress:v1:events')).length), 1);
  checks.push('Completed result persists; unanswered items produce no fabricated responses');
  await page.goto(base + path + '&seccion=temario&evidencia=' + encodeURIComponent(key));
  await page.getByRole('heading', { name: 'Ecuación Canónica y Elementos de la Circunferencia', exact: true }).waitFor();
  assert((await page.locator('.katex').count()) > 0);
  const quiz = page.locator('[data-quiz-id="quiz-geo-01"]');
  await quiz.getByRole('button').first().click();
  await quiz.getByRole('button', { name: 'Comprobar respuesta', exact: true }).click();
  await quiz.getByRole('button', { name: 'Reintentar pregunta', exact: true }).click();
  await quiz.getByRole('button').first().click();
  await quiz.getByRole('button', { name: 'Comprobar respuesta', exact: true }).click();
  assert.deepEqual((await journal()).activities.map(a => a.responseIndex), [0,1]);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bxm-mvp-progress:v1:events')).length), 1);
  await page.getByRole('button', { name: 'Practicar Evidencia', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  checks.push('Free complete sample lesson, real math, activity-only quiz retries, paid practice gate');
  // An isolated test browser enables the existing local prototype tier; no billing request is made.
  await page.getByRole('button', { name: /Modo pruebas: Cambiar a Premium/ }).click();
  await page.getByRole('button', { name: /Cerrar/ }).click();
  await page.goto(base + path + '&seccion=practice');
  await page.getByLabel('Evidencia', { exact: true }).selectOption(key);
  await page.getByRole('button', { name: 'Preparar práctica', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Aceptar actividad limitada', exact: true }).click();
  await page.getByRole('button', { name: 'Opción A', exact: true }).waitFor();
  const correct = (await journal()).active.items[0].correctAnswer;
  await page.getByRole('button', { name: `Opción ${correct === 'A' ? 'B' : 'A'}`, exact: true }).click();
  await page.getByRole('button', { name: 'Verificar respuesta', exact: true }).click();
  await page.getByText(/Respuesta incorrecta/).waitFor();
  await page.getByRole('button', { name: `Opción ${correct}`, exact: true }).click();
  await page.getByRole('button', { name: 'Verificar respuesta', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Reanudar aprendizaje', exact: true }).click();
  assert.equal((await journal()).active.states[0].firstResponse.isCorrect, false);
  assert.equal((await journal()).active.states[0].retryAttempts.length, 1);
  await page.getByRole('button', { name: 'Finalizar sesión', exact: true }).click();
  await page.getByRole('heading', { name: 'Resultados de la Evaluación BXM', exact: true }).waitFor();
  assert.equal((await journal()).results[0].firstResponseCorrectCount, 0);
  checks.push('Explicit partial acceptance, study retries and save/exit/resume preserve first wrong score');
  await page.getByRole('button', { name: 'Mi preparación', exact: true }).click();
  await page.getByRole('heading', { name: 'Panel de Preparación Formativa', exact: true }).waitFor();
  await page.getByRole('button', { name: /Dominio por Evidencia \(71\)/ }).click();
  assert.equal(await page.getByRole('table').count(), 1);
  checks.push('Live premium dashboard receives canonical 71-evidence catalog and persisted history');
  for (const [button, kind] of [['Practicar variantes','evidence_practice'],['Comprobar aprendizaje','mastery_check'],['Preparar retest','retest'],['Simulacro formativo · 20 preguntas','mock_exam']]) {
    await page.getByRole('button', { name: 'Práctica de autor', exact: true }).click();
    await page.getByLabel('Evidencia', { exact: true }).selectOption(key);
    await page.getByRole('button', { name: button, exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: /Comenzar actividad|Aceptar actividad limitada/ }).click();
    await page.getByRole('button', { name: 'Opción A', exact: true }).waitFor();
    const current = (await journal()).active;
    assert.equal(current.policy.kind, kind);
    assert(current.items.every(i => ['authored','generated_isomorph'].includes(i.provenance)));
    if (button === 'Practicar variantes') {
      assert.equal(current.items.length, 5);
      assert.equal(new Set(current.items.map(i => i.familyId)).size, 1);
    }
    await page.getByRole('button', { name: current.policy.mode === 'exam' ? 'Entregar examen' : 'Finalizar sesión', exact: true }).click();
    await page.getByRole('heading', { name: 'Resultados de la Evaluación BXM', exact: true }).waitFor();
  }
  checks.push('Generated practice, mastery check, retest and authored mock use the live bank with distinct policies and provenance');
  await page.getByRole('button', { name: 'Perfil local opcional', exact: true }).click();
  await page.getByLabel('Nombre o apodo', { exact: true }).fill('Perfil de prueba BXM');
  await page.getByRole('button', { name: 'Usar perfil local', exact: true }).click();
  await page.getByText('Aún no hay resultados de aprendizaje.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Revisar aprendizaje', exact: true }).count(), 0);
  checks.push('Switching local learner profiles hides guest attempts and results');
  await page.getByRole('button', { name: 'Diagnóstico', exact: true }).click();
  await page.getByRole('button', { name: 'Examen oficial de referencia · 60 preguntas', exact: true }).click();
  await page.getByRole('heading', { name: 'Pregunta 1 de 60', exact: true }).waitFor();
  const official = await page.evaluate(() => {
    const user = JSON.parse(localStorage.getItem('mep_ea_user'));
    return JSON.parse(localStorage.getItem(`mep_ea_active_session:${user.id}`));
  });
  assert.equal(official.items.length, 60);
  assert.equal(official.deadline - Date.parse(official.startTime), 150 * 60_000);
  assert(!official.items.some(i => String(i.id).startsWith('bxm-authored')));
  await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, entregar', exact: true }).click();
  await page.getByRole('heading', { name: /Tu resultado:/ }).waitFor();
  checks.push('The guided host launches the unchanged 60-item, 150-minute official-reference exam separately');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(base + path + '&seccion=temario&evidencia=' + encodeURIComponent(key));
  await page.getByRole('heading', { name: 'Ecuación Canónica y Elementos de la Circunferencia', exact: true }).waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile lesson overflows');
  assert.equal(await page.locator('.katex-error').count(), 0);
  assert(!(await page.locator('main').innerText()).includes('**'), 'Unrendered emphasis in lesson');
  assert(!(await page.locator('main').innerText()).includes('$'), 'Unrendered math delimiters in lesson');
  await page.screenshot({ path: 'artifacts/bxm-integration/mobile-lesson.png', fullPage: true });
  await page.goto(base + path + '&seccion=temario&evidencia=' + encodeURIComponent('bxm/matematica/02-2026/geometry/A5.3'));
  await page.getByRole('slider', { name: /Distancia del plano al centro/ }).focus();
  await page.keyboard.press('End');
  await page.getByText('No existe sección circular', { exact: true }).waitFor();
  assert.equal(await page.locator('.katex-error').count(), 0);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile sphere lesson overflows');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + path + '&seccion=progress');
  await page.getByRole('heading', { name: 'Panel de Preparación Formativa', exact: true }).waitFor();
  await page.screenshot({ path: 'artifacts/bxm-integration/desktop-dashboard.png', fullPage: true });
  checks.push('320px circle/sphere lessons and desktop dashboard render correctly; exterior sphere-plane case has no section');
  assert.deepEqual(errors, []);
  if (process.argv.includes('--reference')) {
    process.env.FLOW_BASE_URL = base;
    if (executablePath) process.env.FLOW_CHROME_PATH = executablePath;
    await import('../validate-flows.mjs');
    checks.push('Existing reference exams, PDFs, saved results, other programs and responsive layout matrix pass');
  }
  await writeFile('artifacts/bxm-integration/journey-results.json', JSON.stringify({ status: 'passed', checks, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', checks }, null, 2));
} catch (error) {
  await page.screenshot({ path: 'artifacts/bxm-integration/failure.png', fullPage: true }).catch(() => {});
  await writeFile('artifacts/bxm-integration/journey-results.json', JSON.stringify({ status: 'failed', checks, errors, failure: String(error) }, null, 2));
  throw error;
} finally { await browser.close(); server?.kill(); }
