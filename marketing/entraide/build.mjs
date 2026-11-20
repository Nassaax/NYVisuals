// Visuel « Partage de compte » (entraide Instagram) : publication 4:5 et story 9:16.
// Usage : node marketing/entraide/build.mjs  → marketing/entraide/out/*.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const { papier: P, nuit: N, accent: A } = cfg.couleurs;
const AMBRE = '#FFB23E', ROSE = '#FF3D7F';
const out = path.join(root, 'marketing/entraide/out');
fs.mkdirSync(out, { recursive: true });
const b64 = (f, type) => `data:${type};base64,` + fs.readFileSync(path.join(root, f)).toString('base64');
const font = (f) => b64('node_modules/' + f, 'font/woff2');
const avatar = b64('logo/final/profil/profil-c-eclat.png', 'image/png');
const ig = '@' + cfg.contact.instagram;

const swash = `<svg viewBox="0 0 400 40" preserveAspectRatio="none" class="swash"><path d="M4 26c60-12 140-17 230-15 60 1 110 6 162 13-50 3-120 3-190 6-70 2-140 4-198 6z" fill="${A}"/></svg>`;
const arrow = `<svg viewBox="0 0 160 120" class="arrow"><path d="M8 18c40-6 86 4 112 36 9 11 14 24 16 40" fill="none" stroke="${P}" stroke-width="4.5" stroke-linecap="round"/><path d="M118 82l18 16 12-22" fill="none" stroke="${P}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ico = {
  follow: `<svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="3.6"/><path d="M3.5 19.5c.8-3.4 3.4-5.2 6.5-5.2s5.7 1.8 6.5 5.2M18.5 7.5v6M15.5 10.5h6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10z"/></svg>`,
  swap: `<svg viewBox="0 0 24 24"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>`,
};
const steps = [
  ['01', ico.follow, `Abonne-toi à <b>${ig}</b>`],
  ['02', ico.heart, 'Like et commente ce post : <b>présente ton activité</b> en une phrase'],
  ['03', ico.swap, 'Je passe sur ton compte : <b>abonnement et like</b> en retour'],
];

const css = `
@font-face{font-family:J;font-weight:800;src:url(${font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:I;font-weight:500;src:url(${font('@fontsource/inter/files/inter-latin-500-normal.woff2')})}
@font-face{font-family:I;font-weight:600;src:url(${font('@fontsource/inter/files/inter-latin-600-normal.woff2')})}
@font-face{font-family:H;font-weight:700;src:url(${font('@fontsource/caveat/files/caveat-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:var(--w);height:var(--h);background:${N};color:${P};font-family:I;position:relative;overflow:hidden}
.grain{position:absolute;inset:0;opacity:.14;mix-blend-mode:overlay;pointer-events:none;z-index:9}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(245,243,238,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(245,243,238,.06) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 20%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 20%,transparent 80%)}
.page{position:absolute;inset:0;padding:var(--pad);display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.pill{display:inline-flex;align-items:center;gap:12px;padding:12px 20px 12px 16px;border:2px solid rgba(245,243,238,.2);border-radius:99px;font:600 24px/1 I;letter-spacing:.08em;text-transform:uppercase}
.pill i{width:12px;height:12px;border-radius:50%;background:${A}}
.sticker{font:700 40px/1 H;color:${N};background:${AMBRE};padding:10px 22px 14px;border-radius:12px;transform:rotate(5deg);box-shadow:0 10px 20px -10px rgba(0,0,0,.6)}
h1{margin-top:var(--h1top);font:800 var(--h1)/.9 J;letter-spacing:-.055em}
h1 .hl{position:relative;display:inline-block;z-index:0;color:${N};margin-left:.14em;padding:0 .04em}
h1 .hl .bg{position:absolute;inset:.06em -.08em .02em;background:${A};z-index:-1;transform:rotate(-2deg);border-radius:.08em}
.swash{position:absolute;left:0;bottom:-.12em;width:100%;height:.22em;transform:rotate(-1deg)}
.lead{margin-top:28px;font:500 var(--lead)/1.35 I;color:#c9cfda;max-width:880px}
.lead b{color:${P};font-weight:600}
.who{display:flex;align-items:center;gap:26px;margin-top:var(--whotop)}
.who img{width:var(--av);height:var(--av);border-radius:50%;flex:none}
.who b{display:block;font:800 var(--handle)/1 J;letter-spacing:-.03em}
.who span{display:block;font:500 24px/1.3 I;color:#b9c0cd;margin-top:8px}
.steps{display:grid;gap:var(--sgap);margin-top:var(--stop)}
.step{display:flex;align-items:center;gap:24px;background:${P};color:${N};border-radius:22px;padding:var(--spad);box-shadow:0 18px 30px -18px rgba(0,0,0,.7)}
.step:nth-child(1){transform:rotate(-1.2deg)}.step:nth-child(2){transform:rotate(.8deg)}.step:nth-child(3){transform:rotate(-.6deg)}
.num{font:800 30px/1 J;color:${A};width:44px;flex:none}
.step svg{width:48px;height:48px;flex:none;fill:none;stroke:${N};stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.step p{font:500 var(--st)/1.3 I}
.step b{font-weight:600}
.end{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}
.end p{font:700 var(--end)/1.1 H;transform:rotate(-2deg);max-width:760px}
.end .u{background:linear-gradient(transparent 62%, ${A}AA 62%);padding:0 4px}
.arrow{width:120px;height:90px;flex:none;transform:rotate(30deg)}
.brand{font:600 22px/1 I;color:#8f97a8;letter-spacing:.06em;text-transform:uppercase;margin-top:22px}
`;
const grain = `<svg class="grain" width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const body = `
<div class="grid"></div>
<div class="page">
  <div class="top"><span class="pill"><i></i>Entraide Instagram</span><span class="sticker">On s'entraide !</span></div>
  <h1>Partage<br>de <span class="hl"><span class="bg"></span>compte</span></h1>
  <p class="lead">Indépendants, créateurs, commerces : <b>plus on se partage, plus on se voit.</b> Joue le jeu en 3 gestes.</p>
  <div class="who"><img src="${avatar}" alt=""><div><b>${ig}</b><span>${cfg.nom} · Logo, site web et visuels</span></div></div>
  <div class="steps">${steps.map(([n, i, t]) => `<div class="step"><span class="num">${n}</span>${i}<p>${t}</p></div>`).join('')}</div>
  <div class="end"><p>Présente ton activité en commentaire : <span class="u">on fait connaître ton travail ensemble</span></p>${arrow}</div>
</div>`;

const formats = {
  publication: { w: 1080, h: 1350, vars: '--pad:60px 64px 56px;--h1:150px;--h1top:44px;--lead:30px;--whotop:36px;--av:110px;--handle:46px;--stop:36px;--sgap:16px;--spad:22px 28px;--st:28px;--end:44px' },
  story: { w: 1080, h: 1920, vars: '--pad:150px 64px 230px;--h1:176px;--h1top:70px;--lead:36px;--whotop:60px;--av:140px;--handle:54px;--stop:60px;--sgap:22px;--spad:30px 32px;--st:32px;--end:52px' },
};
const req = createRequire(import.meta.url);
const { chromium } = req(req.resolve('playwright', { paths: [root, '/opt/node-tools/node_modules'] }));
const browser = await chromium.launch();
for (const [name, f] of Object.entries(formats)) {
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
  await page.setContent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>:root{--w:${f.w}px;--h:${f.h}px;${f.vars}}${css}</style></head><body>${grain}${body}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `partage-compte-${name}.jpg`), type: 'jpeg', quality: 92 });
  await page.close();
  console.log(`OK : marketing/entraide/out/partage-compte-${name}.jpg (${f.w}×${f.h})`);
}
await browser.close();
