// Kit Nayas Visuals — tests du site client dans un vrai navigateur + captures.
// Usage : node test.mjs [--dist dossier/dist] [--out dossier/captures]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const dist = path.resolve(argv('--dist') || path.join(process.cwd(), 'dist'));
const out = path.resolve(argv('--out') || path.join(path.dirname(dist), 'captures'));
fs.mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve('playwright', { paths: [here, process.cwd(), '/opt/node-tools/node_modules'] }));
let axeSrc = '';
try { axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [here, process.cwd()] }), 'utf8'); } catch (e) { console.log('(axe-core absent : test d\'accessibilité automatique sauté)'); }

// Petit serveur local (comme Vercel)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(dist, p);
  if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end(fs.readFileSync(path.join(dist, '404.html'))); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'OK  ' : 'ÉCHEC'} ${name}${detail ? ' — ' + detail : ''}`); };
const browser = await chromium.launch();
const errors = [];
async function newPage(opts = {}, { skipSplash = true } = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('page-inexistante')) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('pageerror', (e) => errors.push(e.message));
  if (skipSplash) await page.addInitScript(() => { try { const k = Object.getOwnPropertyDescriptor(Storage.prototype, 'getItem').value; Storage.prototype.getItem = function (n) { return /splash/.test(n) ? '1' : k.call(this, n); }; } catch (e) {} });
  return page;
}
async function revealAll(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
  await page.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('in')); window.scrollTo(0, 0); });
  await page.waitForTimeout(1200);
}

// 1. Écran d'ouverture, image par image
{
  const page = await newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }, { skipSplash: false });
  await page.clock.install();            // fige les minuteries : l'écran d'ouverture reste affiché
  await page.goto(base);
  await page.waitForSelector('.splash');
  const visible = await page.evaluate(() => document.documentElement.classList.contains('splash-on'));
  ok("Écran d'ouverture affiché à la première visite", visible);
  const times = [0.2, 0.6, 1.0, 1.4, 1.9, 2.6];
  for (const t of times) {
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; }), t);
    await page.screenshot({ path: path.join(out, `ouverture-${String(t).replace('.', '_')}s.png`) });
  }
  await page.clock.runFor(3200);
  await page.waitForTimeout(800);
  const gone = await page.evaluate(() => !document.documentElement.classList.contains('splash-on'));
  ok("Écran d'ouverture retiré automatiquement", gone);
  await page.goto(base);
  ok("Pas d'écran d'ouverture à la 2e page vue", await page.evaluate(() => !document.documentElement.classList.contains('splash-on')));
  await page.context().close();
}
// Clic pour passer
{
  const page = await newPage({ viewport: { width: 390, height: 844 } }, { skipSplash: false });
  await page.goto(base);
  await page.waitForTimeout(400);
  await page.mouse.click(200, 400);
  await page.waitForTimeout(700);
  ok("Clic pour passer l'écran d'ouverture", await page.evaluate(() => !document.querySelector('.splash') || document.querySelector('.splash').classList.contains('out')));
  await page.context().close();
}

// 2. Ordinateur et mobile : captures pleine page, défilement horizontal, onglets
for (const [name, vp, scale] of [['ordinateur', { width: 1440, height: 900 }, 1], ['mobile-390', { width: 390, height: 844 }, 2]]) {
  const page = await newPage({ viewport: vp, deviceScaleFactor: scale, hasTouch: name !== 'ordinateur', isMobile: name !== 'ordinateur' });
  await page.goto(base);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(out, `${name}-ecran1.png`) });
  await revealAll(page);
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok(`${name} : pas de défilement horizontal`, sw[0] <= sw[1], `${sw[0]} / ${sw[1]} px`);
  if (name !== 'ordinateur') {
    ok('mobile : barre d’onglets visible', await page.locator('.tabbar').isVisible());
    await page.click('.tabbar button[data-open="dlg-menu"]');
    await page.waitForTimeout(600);
    ok('mobile : panneau Menu s’ouvre', await page.locator('#dlg-menu').isVisible());
    await page.screenshot({ path: path.join(out, 'mobile-menu.png') });
    await page.click('#dlg-menu a[href="#faq"]');
    await page.waitForTimeout(400);
    ok('mobile : le Menu se referme après un clic', !(await page.locator('#dlg-menu').isVisible()));
  }
  await page.screenshot({ path: path.join(out, `${name}-page-complete.png`), fullPage: true });
  // Liens internes
  const broken = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)));
  ok(`${name} : tous les liens internes mènent quelque part`, broken.length === 0, broken.join(', '));
  // Accessibilité (axe-core : contrastes, libellés, etc.)
  await page.addScriptTag({ content: axeSrc });
  const ax = await page.evaluate(async () => { const r = await window.axe.run(document, { resultTypes: ['violations'] }); return r.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`); });
  ok(`${name} : accessibilité (contrastes, libellés…)`, ax.length === 0, ax.join(' ; '));
  await page.context().close();
}

// 4. Formulaire
{
  // a) sans coordonnées configurées : bouton désactivé + message
  const page = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + '#contact');
  const cfg = await page.evaluate(() => JSON.parse(document.getElementById('cfg').textContent));
  if (!cfg.whatsapp && !cfg.email && !cfg.instagram) ok('Formulaire sans coordonnées : désactivé avec un message clair', await page.locator('#contact-form button[type=submit]').isDisabled());
  await page.context().close();
  // b) avec un numéro de test : message prêt dans WhatsApp
  const p2 = await newPage({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await p2.addInitScript(() => { window.__cfgOverride = { instagram: '', whatsapp: '32400000000', email: 'test@example.com' }; window.open = (u) => { window.__opened = u; return {}; }; });
  await p2.goto(base + '#contact');
  await p2.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('in')));
  // ici on teste la logique du formulaire, pas les animations : défilement instantané
  await p2.addStyleTag({ content: 'html{scroll-behavior:auto!important}*{transition:none!important}' });
  await p2.waitForTimeout(1000);
  await p2.click('#contact-form button[type=submit]');
  ok('Formulaire : refuse un envoi vide', (await p2.textContent('.form-msg')).length > 5 && !(await p2.evaluate(() => window.__opened)));
  await p2.fill('input[name=prenom]', 'Camille');
  await p2.fill('input[name=joindre]', '0470 12 34 56');
  await p2.locator('input[name=type]').first().check({ force: true });
  await p2.fill('textarea[name=message]', 'Bonjour, je voudrais un devis.');
  await p2.click('#contact-form button[type=submit]');
  ok('Formulaire : refuse sans la case de consentement', !(await p2.evaluate(() => window.__opened)));
  await p2.check('input[name=consent]');
  await p2.click('#contact-form button[type=submit]');
  const url = await p2.evaluate(() => window.__opened || '');
  const text = decodeURIComponent((url.split('text=')[1] || ''));
  ok('Formulaire : message prêt dans WhatsApp', url.startsWith('https://wa.me/32400000000?text=') && text.includes('Camille') && text.includes('0470 12 34 56'), text.replace(/\n/g, ' / '));
  await p2.locator('#contact-form').screenshot({ path: path.join(p2 === null ? out : out, 'formulaire-envoye.png') });
  await p2.click('.alt-link');
  ok('Formulaire : e-mail en secours (« ' + (await p2.textContent('.alt-link')) + ' »)', (await p2.evaluate(() => window.__lastContactUrl)).startsWith('mailto:test@example.com'));
  await p2.context().close();
}

// 5. Fenêtres légales
{
  const page = await newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base);
  await page.click('footer [data-open="dlg-mentions"]');
  await page.waitForTimeout(500);
  ok('Mentions légales : la fenêtre s’ouvre', await page.locator('#dlg-mentions').isVisible());
  await page.screenshot({ path: path.join(out, 'mentions-legales.png') });
  await page.click('#dlg-mentions [data-close]');
  await page.click('footer [data-open="dlg-privacy"]');
  await page.waitForTimeout(500);
  ok('Confidentialité : la fenêtre s’ouvre', await page.locator('#dlg-privacy').isVisible());
  await page.keyboard.press('Escape');
  await page.context().close();
}

// 6. Animations réduites
{
  const page = await newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, { skipSplash: false });
  await page.goto(base);
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({ splash: document.documentElement.classList.contains('splash-on'), op: getComputedStyle(document.querySelector('.lead')).opacity }));
  ok('Animations réduites : pas d’écran d’ouverture, contenu visible tout de suite', !st.splash && st.op === '1');
  await page.context().close();
}
// 7. Sans JavaScript
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(base);
  const st = await page.evaluate(() => 1).catch(() => null);
  const shown = await page.locator('.splash').isVisible();
  const h1 = await page.locator('h1').isVisible();
  ok('Sans JavaScript : pas d’écran d’ouverture, contenu lisible', !shown && h1);
  await page.screenshot({ path: path.join(out, 'sans-javascript.png') });
  await ctx.close();
}
// 8. Page 404, manifeste, image de partage
{
  const page = await newPage();
  const r = await page.goto(base + 'page-inexistante');
  ok('Page 404 personnalisée', r.status() === 404 && (await page.textContent('h1')).includes("n'existe pas"));
  const m = await (await page.goto(base + 'manifest.webmanifest')).json();
  ok('Site installable : manifeste présent', m.display === 'standalone' && m.icons.length >= 2);
  ok('Image de partage présente', fs.existsSync(path.join(dist, 'og.png')));
  await page.context().close();
}

ok('Aucune erreur dans la console', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
server.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} tests réussis.`);
process.exit(failed.length ? 1 : 0);
