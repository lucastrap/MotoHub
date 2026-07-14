import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const htmlPath = path.resolve('docs/rapport-bloc2/rapport-bloc2.html');
const outPath = path.resolve('docs/rapport-bloc2/Rapport_Bloc2_MotoTrack.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log('PDF généré :', outPath);
