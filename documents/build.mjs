// Transforme les documents (Markdown) en PDF aux couleurs du studio, prêts à envoyer.
// Usage : node documents/build.mjs   → documents/pdf/*.pdf
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { marked } from 'marked';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const C = cfg.couleurs;
const out = path.join(root, 'documents/pdf');
fs.mkdirSync(out, { recursive: true });
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'node_modules', f)).toString('base64');
const icon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'logo/final/logo-horizontal-clair.svg')).toString('base64');

// Documents à envoyer (les autres restent des notes internes)
const docs = [
  { src: 'brief-client.md', pdf: 'brief-client.pdf' },
  { src: 'procedure-client.md', pdf: 'procedure-client.pdf' },
];

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
for (const d of docs) {
  const md = fs.readFileSync(path.join(root, 'documents', d.src), 'utf8').replace(/☐/g, '<span class="box"></span>');
  const body = marked.parse(md);
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
@font-face{font-family:J;font-weight:800;src:url(${font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:I;font-weight:400;src:url(${font('@fontsource/inter/files/inter-latin-400-normal.woff2')})}
@font-face{font-family:I;font-weight:600;src:url(${font('@fontsource/inter/files/inter-latin-600-normal.woff2')})}
@page{size:A4;margin:16mm 16mm 18mm}
body{font:400 10.5pt/1.55 I,sans-serif;color:${C.nuit};margin:0}
header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${C.accent};padding-bottom:10px;margin-bottom:18px}
header img{height:26px}
header span{font:600 9pt I;color:#5b6475}
h1{font:800 26pt/1.05 J,sans-serif;letter-spacing:-.04em;margin:6px 0 10px}
h2{font:800 14pt/1.2 J,sans-serif;letter-spacing:-.02em;margin:22px 0 6px;padding-top:10px;border-top:1px solid #e3dfd6;break-after:avoid}
h2+*{break-before:avoid}
p,li{margin:4px 0}
ul,ol{padding-left:18px}
li{padding-bottom:2px}
li:has(> .box),p:has(> .box){list-style:none}
.box{display:inline-block;width:10px;height:10px;border:1.3px solid ${C.nuit};border-radius:2px;margin:0 4px -1px 6px}
table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:8px 0}
th,td{border:1px solid #e3dfd6;padding:7px 8px;text-align:left;vertical-align:top}
th{background:${C.papier}}
strong{font-weight:600}
code{font-size:9pt;background:${C.papier};padding:1px 4px;border-radius:3px}
footer{margin-top:26px;font-size:8.5pt;color:#5b6475}
</style></head><body><header><img src="${icon}" alt="${cfg.nom}"><span>${cfg.nom} · ${cfg.zone}</span></header>${body}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(out, d.pdf), format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '18mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: `<div style="font:8px sans-serif;color:#8a8f99;width:100%;text-align:center">${cfg.nom} · page <span class="pageNumber"></span>/<span class="totalPages"></span></div>` });
  console.log('OK : documents/pdf/' + d.pdf);
}
await browser.close();
