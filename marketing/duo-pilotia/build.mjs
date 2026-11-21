// Visuels Instagram « Nayas Visuals × Pilotia » : annonce (publication 4:5) et story (9:16).
// Message : chacun apporte son expertise (ne pas écrire « même fondateur », choix de Nasser).
// Usage : node marketing/duo-pilotia/build.mjs  → marketing/duo-pilotia/out/*.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const { papier: P, nuit: N, accent: A } = cfg.couleurs;
const CYAN = '#4FD1E8'; // accent de la charte Pilotia
const out = path.join(root, 'marketing/duo-pilotia/out');
fs.mkdirSync(out, { recursive: true });
const b64 = (f, type) => `data:${type};base64,` + fs.readFileSync(path.join(root, f)).toString('base64');
const font = (f) => b64('node_modules/' + f, 'font/woff2');
const nyLogo = fs.readFileSync(path.join(root, 'logo/final/logo-horizontal-fonce.svg'), 'utf8').replace('<svg', '<svg class="nylogo"');
const pilotia = b64('site/src/img/pilotia-logo-clair.png', 'image/png');
const ig = '@' + cfg.contact.instagram;

const col = (tag, color, title, items) => `<div class="col" style="--c:${color}"><span class="tag">${tag}</span><h3>${title}</h3><ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul></div>`;
const css = `
@font-face{font-family:J;font-weight:800;src:url(${font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:I;font-weight:500;src:url(${font('@fontsource/inter/files/inter-latin-500-normal.woff2')})}
@font-face{font-family:I;font-weight:600;src:url(${font('@fontsource/inter/files/inter-latin-600-normal.woff2')})}
@font-face{font-family:H;font-weight:700;src:url(${font('@fontsource/caveat/files/caveat-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:var(--w);height:var(--h);background:radial-gradient(120% 70% at 50% 28%,#121c33,${N} 58%,#060a14);color:${P};font-family:I;position:relative;overflow:hidden}
.grain{position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;pointer-events:none}
.page{position:absolute;inset:0;padding:var(--pad);display:flex;flex-direction:column;justify-content:center}
.logos{display:flex;align-items:center;justify-content:center;gap:28px}
.nylogo{height:var(--logo);width:auto;color:${P}}
.logos img{height:calc(var(--logo) * .9);width:auto}
.x{font:800 calc(var(--logo) * .8)/1 J;background:linear-gradient(90deg,${A},${CYAN});-webkit-background-clip:text;color:transparent}
h1{margin-top:var(--h1top);font:800 var(--h1)/.95 J;letter-spacing:-.05em;text-align:center}
h1 em{font-style:normal;background:linear-gradient(90deg,${A},${CYAN});-webkit-background-clip:text;color:transparent}
.lead{margin:24px auto 0;max-width:860px;text-align:center;font:500 var(--lead)/1.35 I;color:#c3cad8}
.cols{display:grid;grid-template-columns:var(--cols);gap:22px;margin-top:var(--ctop)}
.col{border-radius:26px;padding:28px 30px;background:rgba(245,243,238,.05);border:2px solid color-mix(in srgb,var(--c) 55%,transparent)}
.tag{display:inline-block;font:600 20px/1 I;letter-spacing:.12em;text-transform:uppercase;color:var(--c)}
.col h3{font:800 var(--h3)/1.05 J;letter-spacing:-.03em;margin-top:12px}
.col ul{list-style:none;padding:0;margin-top:16px;display:grid;gap:10px}
.col li{font:500 var(--li)/1.3 I;color:#dfe3ea;padding-left:26px;position:relative}
.col li::before{content:"";position:absolute;left:0;top:.5em;width:12px;height:12px;border-radius:50%;background:var(--c)}
.note{margin-top:var(--ntop);text-align:center;font:700 var(--note)/1.1 H;transform:rotate(-2deg)}
.note span{background:linear-gradient(transparent 60%, ${A}99 60%);padding:0 6px}
.contact{margin-top:20px;text-align:center;font:800 var(--contact)/1 J;letter-spacing:-.02em}
`;
const grain = `<svg class="grain" width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const body = `
<div class="page">
  <div class="logos">${nyLogo}<span class="x">×</span><img src="${pilotia}" alt="Pilotia"></div>
  <h1>Deux expertises,<br><em>une seule exigence.</em></h1>
  <p class="lead">${cfg.nom} et Pilotia collaborent : chacun apporte son expertise pour un résultat de qualité, de la stratégie aux visuels.</p>
  <div class="cols">
    ${col('Pilotia', CYAN, 'Vous accompagne', ['Diagnostic de votre activité', 'Organisation et démarches', 'Stratégie de présence en ligne'])}
    ${col(cfg.nom, A, 'Crée votre image', ['Logo et identité visuelle', 'Site web pensé pour le téléphone', 'Visuels pour vos réseaux'])}
  </div>
  <p class="note"><span>Commencez par l'un ou l'autre : tout reste cohérent</span></p>
  <p class="contact">${ig}</p>
</div>`;

const formats = {
  publication: { w: 1080, h: 1350, vars: '--pad:70px 64px 64px;--logo:54px;--h1:104px;--h1top:56px;--lead:29px;--cols:1fr 1fr;--ctop:44px;--h3:40px;--li:25px;--note:44px;--contact:44px;--ntop:64px' },
  story: { w: 1080, h: 1920, vars: '--pad:170px 64px 240px;--logo:60px;--h1:118px;--h1top:80px;--lead:34px;--cols:1fr;--ctop:60px;--h3:46px;--li:30px;--note:50px;--contact:52px;--ntop:80px' },
};
const req = createRequire(import.meta.url);
const { chromium } = req(req.resolve('playwright', { paths: [root, '/opt/node-tools/node_modules'] }));
const browser = await chromium.launch();
for (const [name, f] of Object.entries(formats)) {
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
  await page.setContent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>:root{--w:${f.w}px;--h:${f.h}px;${f.vars}}${css}</style></head><body>${grain}${body}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `nayas-x-pilotia-${name}.jpg`), type: 'jpeg', quality: 92 });
  await page.close();
  console.log(`OK : marketing/duo-pilotia/out/nayas-x-pilotia-${name}.jpg (${f.w}×${f.h})`);
}
await browser.close();
