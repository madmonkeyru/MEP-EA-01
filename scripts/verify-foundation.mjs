import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const chrome = join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe');
const executablePath = process.env.FLOW_CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:4173';
  await page.goto(`${base}/foundation`);
  await page.getByRole('heading', { name: 'Prueba de fundamentos' }).waitFor();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.reload();
  await page.getByText('Pregunta 2 de 3', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio').nth(1).isChecked(), true, 'answer must survive reload');
  await page.getByRole('button', { name: 'Entregar prueba' }).click();
  await page.getByRole('heading', { name: 'Resultado: 1 / 3' }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'Resultado: 1 / 3' }).waitFor();
  await mkdir('artifacts/p0', { recursive: true });
  await page.screenshot({ path: 'artifacts/p0/foundation-result.png', fullPage: true });
  await page.goto(base);
  await page.getByRole('heading').first().waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Prueba de fundamentos' }).count(), 0, 'POC remains the default entry');
  assert.deepEqual(errors, []);
  console.log('Foundation browser lifecycle passed: answer → navigate → reload/resume → submit → reload/result; POC entry preserved.');
} finally { await browser.close(); }
