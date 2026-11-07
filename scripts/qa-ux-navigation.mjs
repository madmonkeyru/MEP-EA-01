import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const directory = 'artifacts/ux-navigation';
fs.mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.FLOW_CHROME_PATH });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:5194';
const server = process.env.FLOW_BASE_URL ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5194', '--strictPort'], { windowsHide: true, stdio: 'ignore' });
const subject = '#/programas/bxm/matematicas?convocatoria=2026-c2';
const report = [];
async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: horizontal overflow`);
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  report.push(`${name}: no horizontal overflow`);
}
try {
  for (let retry = 0; retry < 60; retry++) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for Vite. */ }
    if (retry === 59) throw new Error('Local QA server did not start');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  for (const [name, width, height] of [['desktop', 1600, 1000], ['compact-desktop', 1200, 900], ['tablet', 820, 1180], ['mobile', 390, 844], ['small-mobile', 320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/${subject}`);
    await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).waitFor();
    await capture(`practice-${name}`);
    let nav = page.getByRole('navigation', { name: 'Navegación principal', exact: true });
    if (width < 1200) {
      const trigger = page.getByRole('button', { name: 'Abrir menú', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Menú de navegación', exact: true });
      await dialog.waitFor();
      await capture(`menu-${name}`);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await trigger.evaluate(el => el === document.activeElement), true, 'Escape restores menu focus');
      await trigger.click();
      nav = page.getByRole('navigation', { name: 'Enlaces de navegación', exact: true });
    } else {
      const bounds = await page.locator('.app-header').evaluate(header => {
        const items = [...header.querySelectorAll('.brand-link, .app-primary-nav, .account-trigger')].map(el => el.getBoundingClientRect());
        return { height: header.getBoundingClientRect().height, separated: items[0].right <= items[1].left && items[1].right <= items[2].left };
      });
      assert.ok(bounds.separated, 'Desktop navigation must not overlap brand/profile');
      assert.ok(bounds.height <= 80, 'Header should remain compact');
    }
    await nav.getByRole('link', { name: 'Simulaciones', exact: true }).click();
    await page.getByRole('tab', { name: 'Simulaciones', exact: true }).waitFor();
    assert.equal(await page.getByRole('tab', { name: 'Simulaciones', exact: true }).getAttribute('aria-selected'), 'true');
    await page.getByRole('button', { name: 'Preparar simulación', exact: true }).waitFor();
    await capture(`simulation-${name}`);
    await page.reload();
    await page.getByRole('button', { name: 'Preparar simulación', exact: true }).waitFor();
    await page.goBack();
    await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).click();
    await page.getByRole('heading', { name: 'Pregunta 1 de 10', exact: true }).waitFor();
    await capture(`activity-${name}`);
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
    await page.getByRole('button', { name: 'Sí, entregar', exact: true }).click();
    await page.getByRole('heading', { name: /Tu resultado:/ }).waitFor();
    await capture(`results-${name}`);
    if (width < 640) await page.locator('.activity-context-back').click();
    else await page.locator('.activity-context-trail').getByRole('link', { name: 'Matemáticas', exact: true }).click();
    await page.getByRole('button', { name: 'Iniciar práctica', exact: true }).waitFor();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/#/programas/edad/matematicas?nivel=EDAD_2&convocatoria=2026-c1&seccion=simulation`);
  await page.getByRole('heading', { name: 'Simulación no disponible', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Ver práctica disponible', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Iniciar muestra', exact: true }).count(), 0);
  await capture('simulation-unavailable-mobile');
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Enlaces de navegación', exact: true });
  const progressHref = await menu.getByRole('link', { name: 'Progreso', exact: true }).getAttribute('href');
  assert.ok(progressHref.includes('nivel=EDAD_2') && progressHref.includes('convocatoria=2026-c1'));
  await menu.getByRole('link', { name: 'Calendario', exact: true }).click();
  await page.getByRole('heading', { name: 'Fechas de Educación Abierta', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Programa', { exact: true }).inputValue(), 'edad');
  assert.equal(await page.getByLabel('Convocatoria', { exact: true }).inputValue(), '2026-c1');
  await capture('calendar-context-mobile');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${base}/${subject}&seccion=simulation`);
  await page.getByRole('button', { name: 'Preparar simulación', exact: true }).waitFor();
  await capture('simulation-dark-mobile');
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await capture('menu-dark-mobile');
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${directory}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), checks: report, runtimeErrors: errors }, null, 2));
  console.log(`Passed ${report.length} screenshot/overflow checks, navigation, reload/back, focus, study context, unavailable simulation and activity → results → subject flow.`);
} finally { await browser.close(); server?.kill(); }
