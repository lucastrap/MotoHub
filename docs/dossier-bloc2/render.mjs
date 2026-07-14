import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const htmlPath = path.resolve('docs/dossier-bloc2/dossier-bloc2.html');
const outPath = path.resolve('docs/dossier-bloc2/Dossier_Certification_Bloc2_MotoTrack.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });

const footer = `
  <div style="width:100%;font-size:7.5px;color:#94a3b8;font-family:'Segoe UI',Arial,sans-serif;
       padding:0 15mm;display:flex;justify-content:space-between;align-items:center;">
    <span>Dossier de certification Bloc 2 — MotoTrack · Luca Straputicari</span>
    <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: footer,
  margin: { top: '12mm', bottom: '15mm', left: '15mm', right: '15mm' },
});
await browser.close();
console.log('PDF généré :', outPath);
