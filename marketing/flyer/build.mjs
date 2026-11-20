// Flyer pour les annonces (Facebook Marketplace, 2ememain…) : style affiche papier, vraies créations, annotations à la main.
// Usage : node marketing/flyer/build.mjs  → marketing/flyer/out/*.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const { papier: P, nuit: N, accent: A } = cfg.couleurs;
const out = path.join(root, 'marketing/flyer/out');
fs.mkdirSync(out, { recursive: true });
const b64 = (f, type) => `data:${type};base64,` + fs.readFileSync(path.join(root, f)).toString('base64');
const font = (f) => b64('node_modules/' + f, 'font/woff2');
const shot = (id) => b64(`site/src/img/realisations/${id}-mobile.jpg`, 'image/jpeg');
const logo = fs.readFileSync(path.join(root, 'logo/final/symbole-fonce.svg'), 'utf8').replace('<svg', '<svg class="sym"');
const ig = '@' + cfg.contact.instagram;
const site = (cfg.site.url || '').replace(/^https?:\/\//, '');

// Petits dessins « à la main » (traits volontairement imparfaits)
const tick = `<svg viewBox="0 0 40 40" class="tick"><path d="M7 21c3 2 6 6 9 10 4-9 9-17 17-24" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const arrow = (cls) => `<svg viewBox="0 0 160 120" class="arrow ${cls}"><path d="M8 18c40-6 86 4 112 36 9 11 14 24 16 40" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/><path d="M118 82l18 16 12-22" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const swash = `<svg viewBox="0 0 400 40" preserveAspectRatio="none" class="swash"><path d="M4 26c60-12 140-17 230-15 60 1 110 6 162 13-50 3-120 3-190 6-70 2-140 4-198 6z" fill="${A}"/></svg>`;
const circle = `<svg viewBox="0 0 300 120" preserveAspectRatio="none" class="circle"><path d="M40 20C110 2 250 4 284 40c18 22-10 60-110 70C80 118 10 100 12 66 14 40 70 18 170 14" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round"/></svg>`;

const phone = (id, nom, style) => `<figure class="ph" style="${style}"><span class="tape"></span><img src="${shot(id)}" alt=""><figcaption>${nom}</figcaption></figure>`;

const css = `
@font-face{font-family:J;font-weight:800;src:url(${font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:I;font-weight:500;src:url(${font('@fontsource/inter/files/inter-latin-500-normal.woff2')})}
@font-face{font-family:I;font-weight:600;src:url(${font('@fontsource/inter/files/inter-latin-600-normal.woff2')})}
@font-face{font-family:H;font-weight:700;src:url(${font('@fontsource/caveat/files/caveat-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:var(--w);height:var(--h);background:${P};color:${N};font-family:I;position:relative;overflow:hidden}
.grain{position:absolute;inset:0;opacity:.09;mix-blend-mode:multiply;pointer-events:none;z-index:9}
.page{position:absolute;left:0;right:0;top:0;bottom:var(--fh);padding:52px 64px 40px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;font:600 22px/1 I;letter-spacing:.14em;text-transform:uppercase}
.top .dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:${A};margin-right:12px;vertical-align:1px}
.top .stamp{font:700 30px/1 H;letter-spacing:0;text-transform:none;border:3px solid ${N};border-radius:10px;padding:8px 14px;transform:rotate(3deg)}
h1{margin-top:30px;font:800 var(--h1)/0.95 J;letter-spacing:-.05em}
h1 .hl{position:relative;display:inline-block;z-index:0}
.swash{position:absolute;left:-2%;bottom:-.02em;width:105%;height:.34em;z-index:-1;transform:rotate(-1.5deg)}
.sub{margin-top:26px;font:500 var(--sub)/1.35 I;color:#2b3345}
ul{margin-top:28px;list-style:none;padding:0;display:grid;gap:var(--gap)}
li{display:flex;align-items:center;gap:14px;font:600 var(--li)/1.2 I}
.tick{width:42px;height:42px;flex:none}
.cols{flex:1;display:grid;grid-template-columns:1.15fr 1fr;gap:20px;min-height:0}
.left{position:relative}
.right{position:relative}
.note{font:700 var(--note)/1.05 H;color:${N};transform:rotate(-4deg);display:inline-block}
.arrow{width:130px;height:98px;display:inline-block;vertical-align:middle}
.row{flex:1;position:relative;margin-top:24px}
.ph{position:absolute;width:var(--pw);margin:0;padding:10px 10px 0;background:#fff;box-shadow:0 18px 30px -18px rgba(11,19,36,.55),0 2px 4px rgba(11,19,36,.12);transform:rotate(var(--r))}
.ph img{display:block;width:100%;aspect-ratio:390/640;object-fit:cover;object-position:top;border:1px solid #e6e2d9}
.ph figcaption{font:700 34px/1 H;text-align:var(--cap,center);padding:10px 4px 12px}
.tape{position:absolute;top:-18px;left:50%;width:110px;height:36px;transform:translateX(-50%) rotate(-4deg);background:rgba(232,220,190,.82);clip-path:polygon(3% 0,97% 6%,100% 30%,96% 52%,100% 78%,95% 100%,4% 94%,0 70%,4% 46%,0 22%);z-index:2}
.foot{position:absolute;left:0;right:0;bottom:0;height:var(--fh);background:${N};color:${P};display:flex;align-items:center;justify-content:space-between;padding:0 64px}
.brand{display:flex;align-items:center;gap:16px;font:800 34px/1 J;letter-spacing:-.03em}
.sym{height:52px;width:auto}
.contact{text-align:right;display:grid;justify-items:end;gap:8px}
.contact small{font:700 30px/1 H;color:${P}}
.ring{position:relative;display:inline-block;font:800 40px/1 J;letter-spacing:-.02em;padding:2px 6px}
.contact span.url{font:500 20px/1 I;color:#b9c0cd}
.circle{position:absolute;left:-22px;top:-16px;width:calc(100% + 44px);height:calc(100% + 32px)}
`;
const grain = `<svg class="grain" width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const head = `<div class="top"><span><i class="dot"></i>${cfg.zone}</span><span class="stamp">Sur devis</span></div>`;
const title = `Votre logo et <span class="hl">votre site${swash}</span> web, faits sur mesure.`;
const items = ['Logo et identité visuelle', 'Site rapide, pensé pour le téléphone', 'Visuels pour Instagram et Facebook'];
const foot = `<div class="foot"><div class="brand">${logo}${cfg.nom}</div><div class="contact"><small>Écrivez-moi sur Instagram</small><span class="ring">${ig}${circle}</span><span class="url">${site}</span></div></div>`;

const intro = 'Pour indépendants, commerces et petites entreprises. Une seule personne, du logo à la mise en ligne.';
const list = `<ul>${items.map((t) => `<li>${tick}${t}</li>`).join('')}</ul>`;
const formats = {
  // Carré : Facebook Marketplace (vignette carrée), 2ememain
  carre: { w: 1080, h: 1080, vars: '--cap:left;--h1:80px;--sub:25px;--li:25px;--gap:16px;--pw:196px;--note:38px;--fh:170px', body: `
    <div class="page">${head}<h1>${title}</h1>
      <div class="cols">
        <div class="left"><p class="sub">${intro}</p>${list}
          <p style="margin-top:26px"><span class="note">Mes dernières créations</span>${arrow('')}</p></div>
        <div class="right">
          ${phone('pilotia', 'Pilotia', '--r:-5deg;left:-6px;top:50px')}
          ${phone('jumeo', 'Jumeo', '--r:-1deg;left:118px;top:102px;z-index:3')}
          ${phone('lallat', 'Lallat', '--r:4deg;left:238px;top:158px;z-index:4')}
        </div>
      </div>
    </div>` },
  // Portrait 4:5 : publications Facebook / Instagram, 2ememain
  portrait: { w: 1080, h: 1350, vars: '--h1:86px;--sub:28px;--li:28px;--gap:18px;--pw:250px;--note:42px;--fh:170px', body: `
    <div class="page">${head}<h1>${title}</h1><p class="sub" style="max-width:900px">${intro}</p>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">${list}<p style="text-align:right;margin-bottom:-10px"><span class="note">Mes dernières<br>créations</span><br>${arrow('').replace('class="arrow "', 'class="arrow" style="transform:scaleX(-1) rotate(-10deg)"')}</p></div>
      <div class="row">
        ${phone('pilotia', 'Pilotia', '--r:-5deg;left:10px;top:30px')}
        ${phone('jumeo', 'Jumeo', '--r:2deg;left:340px;top:6px;z-index:3')}
        ${phone('lallat', 'Lallat', '--r:5deg;left:670px;top:36px')}
      </div>
    </div>` },
};

const req = createRequire(import.meta.url);
const { chromium } = req(req.resolve('playwright', { paths: [root, '/opt/node-tools/node_modules'] }));
const browser = await chromium.launch();
for (const [name, f] of Object.entries(formats)) {
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 });
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>:root{--w:${f.w}px;--h:${f.h}px;${f.vars}}${css}</style></head><body>${grain}${f.body}${foot}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `flyer-${name}.png`) });
  await page.screenshot({ path: path.join(out, `flyer-${name}.jpg`), type: 'jpeg', quality: 92 });
  await page.close();
  console.log(`OK : marketing/flyer/out/flyer-${name}.png (${f.w}×${f.h})`);
}
await browser.close();
