// Fichiers finaux du logo (piste B · Entrelacs) : SVG, PNG transparents, icônes, favicon, mini-charte.
// Appelé par logo/build.mjs — tout est relu depuis config/studio.json.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

export default async function buildFinal({ root, cfg, mot }) {
  const C = cfg.couleurs;
  const out = path.join(root, 'logo/final');
  const png = path.join(out, 'png');
  fs.mkdirSync(png, { recursive: true });

  // ---------- Symbole NY (viewBox 0 0 120 120) ----------
  // Le « passage » du Y par-dessus le N est un vrai vide (masque) : fonctionne sur n'importe quel fond.
  const sym = (n, y, id) => `
  <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
    <rect width="120" height="120" fill="#fff"/><path d="M54 22 78 62" stroke="#000" stroke-width="22" fill="none"/>
  </mask></defs>
  <g fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="2" stroke-width="12">
    <path mask="url(#${id})" d="M18 98V22l48 76V40" stroke="${n}"/>
    <path d="M102 22 78 62v36M54 22 78 62" stroke="${y}"/>
  </g>`;

  // Mot : boîte englobante réelle (viewBox du mot) mise à l'échelle.
  const [wx, wy, ww, wh] = mot.viewBox.split(' ').map(Number);
  const word = (fill, x, y, h) => {
    const s = h / wh;
    return `<g transform="translate(${x} ${y}) scale(${s.toFixed(4)}) translate(${-wx} ${-wy})"><path fill="${fill}" d="${mot.d}"/></g>`;
  };
  const wordW = (h) => (ww * h) / wh;

  const svg = (vb, body, title) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

  // Horizontal : symbole (lettres de y=22 à 98) + mot de 56 unités de haut centré sur les lettres.
  const horiz = (n, y, id) => {
    const h = 56, x = 126, top = 60 - h / 2;
    return svg(`10 14 ${(x + wordW(h) + 4 - 10).toFixed(1)} 92`, sym(n, y, id) + word(n, x, top, h), cfg.nom);
  };
  // Vertical : symbole au-dessus, mot dessous.
  const vert = (n, y, id) => {
    const h = 40, w = wordW(h), W = Math.max(120, w + 8), sx = (W - 120) / 2;
    return svg(`0 10 ${W.toFixed(1)} ${(116 + h + 8 - 10).toFixed(1)}`,
      `<g transform="translate(${sx.toFixed(1)} 0)">${sym(n, y, id)}</g>` + word(n, (W - w) / 2, 116, h), cfg.nom);
  };
  // Icône carrée : tuile bleu nuit, coins arrondis (favicon, application).
  const icone = (r) => svg('0 0 120 120',
    `<rect width="120" height="120" rx="${r}" fill="${C.nuit}"/><g transform="translate(60 60) scale(.66) translate(-60 -60)">${sym(C.papier, C.accent, 'i')}</g>`,
    cfg.monogramme);
  // Photo de profil : carré plein, symbole dans la zone ronde (les réseaux recadrent en cercle).
  const profil = svg('0 0 120 120',
    `<rect width="120" height="120" fill="${C.nuit}"/><g transform="translate(60 60) scale(.56) translate(-60 -60)">${sym(C.papier, C.accent, 'p')}</g>`,
    cfg.nom);

  const files = {
    'symbole-clair.svg': svg('8 14 104 92', sym(C.encre, C.accent, 's'), cfg.monogramme),
    'symbole-fonce.svg': svg('8 14 104 92', sym(C.papier, C.accent, 's'), cfg.monogramme),
    'logo-horizontal-clair.svg': horiz(C.encre, C.accent, 'h'),
    'logo-horizontal-fonce.svg': horiz(C.papier, C.accent, 'h'),
    'logo-vertical-clair.svg': vert(C.encre, C.accent, 'v'),
    'logo-vertical-fonce.svg': vert(C.papier, C.accent, 'v'),
    'icone-carree.svg': icone(26),
    'profil-reseaux.svg': profil,
  };
  for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(out, f), s);

  // ---------- PNG transparents ----------
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (file, w, h, dest) => {
    await page.setViewportSize({ width: w, height: h });
    const data = Buffer.from(files[file]).toString('base64');
    await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${w}px;height:${h}px}</style><img src="data:image/svg+xml;base64,${data}">`);
    await page.waitForFunction(() => document.images[0].complete);
    await page.screenshot({ path: path.join(png, dest), omitBackground: true });
  };
  const ratio = (f) => { const [, , w, h] = files[f].match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); return w / h; };
  for (const f of ['logo-horizontal-clair', 'logo-horizontal-fonce']) await render(f + '.svg', 2000, Math.round(2000 / ratio(f + '.svg')), f + '-2000.png');
  for (const f of ['logo-vertical-clair', 'logo-vertical-fonce']) await render(f + '.svg', Math.round(1200 * ratio(f + '.svg')), 1200, f + '-1200.png');
  for (const f of ['symbole-clair', 'symbole-fonce']) await render(f + '.svg', 1024, Math.round(1024 / ratio(f + '.svg')), f + '-1024.png');
  for (const s of [16, 32, 48, 180, 192, 512]) await render('icone-carree.svg', s, s, `icone-${s}.png`);
  await render('profil-reseaux.svg', 1080, 1080, 'profil-reseaux-1080.png');
  await browser.close();

  // favicon.ico (16, 32, 48)
  try {
    execFileSync('convert', ['icone-16.png', 'icone-32.png', 'icone-48.png', path.join(out, 'favicon.ico')], { cwd: png });
  } catch { console.warn('favicon.ico non généré (ImageMagick absent)'); }

  console.log('OK : logo/final (' + Object.keys(files).length + ' SVG + PNG + favicon.ico)');
}
