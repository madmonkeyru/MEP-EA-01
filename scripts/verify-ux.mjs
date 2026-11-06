import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../artifacts/ux-quality/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.UX_BASE_URL || 'http://localhost:5174/';
const learning = '#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje&seccion=';
const report = [];
try {
  for (const width of (process.env.UX_ONLY_JOURNEY ? [] : [390, 1280])) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.goto(base);
      await page.evaluate(value => localStorage.setItem('mep_ea_01_theme', value), theme);
      await page.reload();
      await page.waitForFunction(value => document.documentElement.classList.contains('dark') === (value === 'dark'), theme);
      for (const tab of ['inicio', 'temario', 'practice', 'simulation']) {
        await page.goto(base + learning + tab);
        await page.waitForURL(url => url.hash.includes('seccion=' + tab));
        await page.getByRole('navigation', { name: 'Aprendizaje BXM' }).waitFor();
        const activeLabel = {inicio: 'Inicio', temario: 'Aprender', practice: 'Practicar', simulation: 'Simular'}[tab];
        await page.getByRole('button', {name: activeLabel, exact: true}).and(page.locator('[aria-current=page]')).waitFor();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        if (overflow) throw new Error(`Horizontal overflow: ${width}/${theme}/${tab}`);
        await page.screenshot({ path: new URL(`${width}-${theme}-${tab}.png`, output).pathname.replace(/^\/([A-Za-z]:)/, '$1'), fullPage: tab === 'inicio' });
        report.push({ width, theme, tab, overflow });
      }
    }
  }
  await page.goto(base + learning + 'inicio');
  await page.getByRole('button', { name: 'Perfil', exact: true }).click();
  await page.getByRole('dialog', { name: 'Perfil y preferencias' }).waitFor();
  await page.getByLabel('Tema', { exact: true }).selectOption('system');
  await page.keyboard.press('Escape');
  if (await page.getByRole('dialog').count()) throw new Error('Escape did not close profile');
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Perfil');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('dialog', { name: 'Menú de navegación' }).waitFor();
  await page.keyboard.press('Escape');
  await page.goto(base + learning + 'temario');
  await page.getByRole('searchbox', { name: 'Buscar tema o concepto' }).fill('zzzzzz');
  await page.getByRole('heading', { name: 'No encontramos ese tema' }).waitFor();
  await page.getByRole('button', { name: 'Ver todos los temas' }).click();
  await page.locator('.curriculum-row').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => location.hash.includes('evidencia='));
  await page.goto(base + learning + 'inicio');
  await page.getByRole('button', { name: 'Iniciar evaluación diagnóstica', exact: true }).click();
  await page.getByRole('dialog', { name: 'Antes de comenzar la actividad' }).locator('button.primary-button').click();
  await page.getByRole('button', { name: 'Opción A', exact: true }).click();
  const shortcutSizes = await page.locator('.assessment-question-rail button').evaluateAll(buttons => buttons.map(button => { const box = button.getBoundingClientRect(); return [box.width, box.height]; }));
  if (shortcutSizes.some(([width, height]) => width < 44 || height < 44)) throw new Error('Question shortcut touch target is too small');
  await page.screenshot({ path: new URL('390-question.png', output).pathname.replace(/^\/([A-Za-z]:)/, '$1'), fullPage: false });
  await page.getByRole('button', { name: 'Entregar examen', exact: true }).click();
  await page.getByRole('heading', { name: 'Tu resultado', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Recomendado para ti', exact: true }).waitFor();
  await page.screenshot({ path: new URL('390-results.png', output).pathname.replace(/^\/([A-Za-z]:)/, '$1'), fullPage: false });
  if (errors.length) throw new Error(errors.join('\n'));
  await writeFile(new URL(process.env.UX_ONLY_JOURNEY ? 'journey-report.json' : 'report.json', output), JSON.stringify({ screens: report, profileEscapeAndFocus: true, themeSystem: true, mobileMenu: true, searchRecovery: true, keyboardLesson: true, diagnosticToResults: true, pageErrors: errors }, null, 2));
  console.log(`Verified ${report.length} screen/theme/viewport combinations plus profile, menu, search and keyboard lesson flow.`);
} finally { await browser.close(); }

