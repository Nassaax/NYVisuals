// Photos de profil rondes pour les réseaux (Instagram, etc.) : 3 variantes + planche d'aperçu.
// Usage : node logo/profil.mjs   → logo/final/profil/*.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const { papier: P, nuit: N, accent: A } = cfg.couleurs;
const AMBRE = '#FFB23E', ROSE = '#FF3D7F', VIOLET = '#7A5CFF';
const out = path.join(root, 'logo/final/profil');
fs.mkdirSync(out, { recursive: true });

// Monogramme NY (viewBox 0 0 120 120), centré sur (cx, cy), largeur des lettres ≈ 96 unités × scale
const sym = (cx, cy, scale, id, n = P, y = A) => `
  <g transform="translate(${cx} ${cy}) scale(${scale}) translate(-60 -60)">
    <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><path d="M54 22 78 62" stroke="#000" stroke-width="22" fill="none"/></mask></defs>
    <g fill="none" stroke-width="12" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="2">
      <path mask="url(#${id})" d="M18 98V22l48 76V40" stroke="${n}"/>
      <path d="M102 22 78 62v36M54 22 78 62" stroke="${y}"/>
    </g>
  </g>`;
const C = 540; // centre d'une image 1080 × 1080
const polar = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];

const variantes = {
  // A. Anneau dégradé orange → rose → ambre autour d'un disque bleu nuit
  'a-anneau': `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${AMBRE}"/><stop offset=".5" stop-color="${A}"/><stop offset="1" stop-color="${ROSE}"/>
      </linearGradient>
    </defs>
    <circle cx="${C}" cy="${C}" r="540" fill="url(#g)"/>
    <circle cx="${C}" cy="${C}" r="468" fill="${P}"/>
    <circle cx="${C}" cy="${C}" r="452" fill="${N}"/>
    ${sym(C, C + 6, 5.2, 'ma')}`,

  // B. Viseur : anneaux, graduations et points, clin d'œil à la photo
  'b-viseur': (() => {
    let ticks = '';
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, long = i % 6 === 0;
      const [x1, y1] = polar(long ? 452 : 470, a), [x2, y2] = polar(498, a);
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${long ? A : 'rgba(245,243,238,.35)'}" stroke-width="${long ? 7 : 4}" stroke-linecap="round"/>`;
    }
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
      const x = C + sx * 300, y = C + sy * 300;
      return `<path d="M${x} ${y + sy * -70}V${y}H${x + sx * -70}" fill="none" stroke="${A}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `
    <circle cx="${C}" cy="${C}" r="540" fill="${N}"/>
    <circle cx="${C}" cy="${C}" r="430" fill="none" stroke="rgba(245,243,238,.12)" stroke-width="2"/>
    <circle cx="${C}" cy="${C}" r="380" fill="none" stroke="${A}" stroke-width="3" stroke-dasharray="4 18" stroke-linecap="round"/>
    ${ticks}${corners}
    <circle cx="${C}" cy="${C}" r="512" fill="none" stroke="${A}" stroke-width="20"/>
    ${sym(C, C + 6, 4.1, 'mb')}`;
  })(),

  // C. Éclat : rayons sur fond orange, disque bleu nuit au centre (énergie, sport)
  'c-eclat': (() => {
    let rays = '';
    for (let i = 0; i < 36; i++) {
      const a0 = (i / 36) * Math.PI * 2, a1 = a0 + Math.PI / 36;
      const [x0, y0] = polar(560, a0), [x1, y1] = polar(560, a1);
      rays += `<path d="M${C} ${C}L${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${i % 2 ? ROSE : AMBRE}" opacity=".35"/>`;
    }
    return `
    <defs><clipPath id="cc"><circle cx="${C}" cy="${C}" r="540"/></clipPath></defs>
    <g clip-path="url(#cc)"><rect width="1080" height="1080" fill="${A}"/>${rays}</g>
    <circle cx="${C}" cy="${C}" r="372" fill="${P}"/>
    <circle cx="${C}" cy="${C}" r="356" fill="${N}"/>
    ${sym(C, C + 6, 4.2, 'mc')}`;
  })(),
};

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
const files = [];
for (const [nom, body] of Object.entries(variantes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">${body}</svg>`;
  fs.writeFileSync(path.join(out, `profil-${nom}.svg`), svg);
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg}`);
  await page.screenshot({ path: path.join(out, `profil-${nom}.png`), omitBackground: true });
  files.push(nom);
}

// Planche : chaque variante telle qu'elle apparaîtra sur Instagram (profil, et petite bulle des messages)
const handle = (cfg.contact && cfg.contact.instagram) || '';
const card = (nom, titre) => {
  const src = 'data:image/png;base64,' + fs.readFileSync(path.join(out, `profil-${nom}.png`)).toString('base64');
  return `<figure><div class="big"><img src="${src}"></div><figcaption><b>${titre}</b><span>@${handle}</span></figcaption>
    <div class="small"><img src="${src}"><p><b>${handle}</b><br><span>Bonjour, j'aimerais un devis pour…</span></p></div></figure>`;
};
await page.setViewportSize({ width: 1500, height: 760 });
await page.setContent(`<style>
body{margin:0;background:#fff;font:15px/1.4 -apple-system,Segoe UI,Inter,sans-serif;color:#111;padding:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
figure{margin:0;display:grid;justify-items:center;gap:14px;padding:24px;border:1px solid #eee;border-radius:24px}
.big{width:300px;height:300px;border-radius:50%;overflow:hidden}.big img,.small img{width:100%;height:100%;display:block}
figcaption{display:grid;justify-items:center}figcaption span{color:#777}
.small{display:flex;gap:12px;align-items:center;width:100%;padding:12px;border-radius:14px;background:#f5f5f5}
.small img{width:56px;height:56px;border-radius:50%;flex:none}.small p{margin:0;font-size:13px}.small span{color:#777}
</style>${card('a-anneau', 'A · Anneau dégradé')}${card('b-viseur', 'B · Viseur')}${card('c-eclat', 'C · Éclat')}`);
await page.screenshot({ path: path.join(out, 'apercu-instagram.png') });
await browser.close();
console.log('OK : logo/final/profil (' + files.length + ' variantes + aperçu)');
