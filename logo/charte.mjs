// Mini-charte graphique (page HTML + PDF A4) à partir de config/studio.json et des fichiers de logo/final.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const rgb = (hex) => hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16)).join(', ');
const fr = (n) => n.toFixed(1).replace('.', ',');

export default async function buildCharte({ root, cfg }) {
  const C = cfg.couleurs;
  const dir = path.join(root, 'logo/charte');
  fs.mkdirSync(dir, { recursive: true });
  const svg = (f) => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'logo/final', f)).toString('base64');

  const couleurs = [
    { nom: 'Bleu nuit', hex: C.nuit, role: 'Texte, fonds sombres, icône', fg: C.papier },
    { nom: 'Papier', hex: C.papier, role: 'Fond clair principal', fg: C.nuit },
    { nom: 'Orange signal', hex: C.accent, role: 'Accent : bras du Y, boutons, détails', fg: C.nuit },
  ];
  const paires = [
    ['Bleu nuit sur papier', C.nuit, C.papier],
    ['Papier sur bleu nuit', C.papier, C.nuit],
    ['Bleu nuit sur orange', C.nuit, C.accent],
    ['Orange sur bleu nuit', C.accent, C.nuit],
    ['Orange sur papier', C.accent, C.papier],
    ['Blanc sur orange', '#FFFFFF', C.accent],
  ].map(([n, f, b]) => {
    const r = contrast(f, b);
    const verdict = r >= 4.5 ? 'OK pour tout texte' : r >= 3 ? 'Grands titres et éléments graphiques uniquement' : 'À éviter pour du texte';
    return { n, f, b, r, verdict };
  });

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Charte ${cfg.nom}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<style>
:root{--paper:${C.papier};--night:${C.nuit};--accent:${C.accent};--muted:#5b6475;--line:#e3dfd6}
*{box-sizing:border-box;margin:0}
body{background:#fff;color:var(--night);font:400 15px/1.55 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:40px 16px 64px}
h1{font:800 clamp(34px,6vw,56px)/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.04em}
h2{font:800 24px/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.03em;margin-bottom:6px}
.kicker{font:600 12px/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.lead{color:var(--muted);max-width:62ch;margin-top:12px}
section{padding:34px 0;border-top:1px solid var(--line);break-inside:avoid}
section:first-of-type{margin-top:28px}
.sub{color:var(--muted);margin-bottom:18px;max-width:64ch}
.g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.box{border-radius:14px;padding:28px 22px;display:grid;place-items:center;min-height:150px;position:relative}
.box img{max-width:100%;max-height:96px}
.box.tall img{max-height:150px}
.light{background:var(--paper)} .dark{background:var(--night)} .white{background:#fff;border:1px solid var(--line)}
.lbl{display:block;font:500 12px/1.3 Inter,sans-serif;color:var(--muted);margin-top:8px}
.icons{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap}
.icons figure{display:grid;gap:6px;justify-items:center}
.icons figcaption{font:500 12px/1 Inter,sans-serif;color:var(--muted)}
.round{border-radius:50%;overflow:hidden;width:96px;height:96px}
.round img{width:100%;height:100%;display:block}
.clear{background:var(--paper);border-radius:14px;padding:22px;display:grid;place-items:center}
.clear .zone{outline:1.5px dashed var(--accent);padding:24px;position:relative}
.clear .zone img{display:block;height:64px}
.rules{display:grid;gap:8px;margin-top:14px;padding:0;list-style:none}
.rules li{padding-left:22px;position:relative}
.rules li::before{content:"";position:absolute;left:3px;top:.55em;width:8px;height:8px;border-radius:50%;background:var(--accent)}
.sw{border-radius:14px;overflow:hidden;border:1px solid var(--line)}
.sw .chip{height:110px;padding:14px;display:flex;align-items:flex-end;font:800 20px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.02em}
.sw dl{padding:12px 14px;display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:13px}
.sw dt{color:var(--muted)} .sw dd{font-variant-numeric:tabular-nums}
table{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:middle}
th{font-weight:600;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.05em}
.pair{display:inline-grid;place-items:center;width:44px;height:30px;border-radius:6px;font:800 14px/1 'Plus Jakarta Sans',sans-serif}
.type{display:grid;gap:14px}
.type .spec{background:var(--paper);border-radius:14px;padding:20px}
.type .big{font:800 44px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.04em}
.type .body{font:400 17px/1.55 Inter,sans-serif;max-width:56ch}
.type small{display:block;color:var(--muted);margin-top:10px;font-size:13px}
.dont{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.dont figure{display:grid;gap:8px}
.dont .box{min-height:120px;overflow:hidden}
.dont .box::after{content:"";position:absolute;inset:auto 10px 10px auto;width:22px;height:22px;border-radius:50%;background:#c2412d url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath d='m7 7 8 8M15 7l-8 8' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")}
.dont figcaption{font-size:13px;color:var(--muted)}
.dont img{max-height:60px}
.photo{background:repeating-linear-gradient(45deg,#8a6d55 0 14px,#3d5a6c 14px 28px,#c9a27e 28px 42px)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;counter-reset:s;padding:0;list-style:none}
.steps li{background:var(--paper);border-radius:12px;padding:14px;font-size:14px}
.steps b{display:block;font:800 15px/1.2 'Plus Jakarta Sans',sans-serif;margin-bottom:4px}
.note{margin-top:28px;font-size:13px;color:var(--muted)}
@media print{.wrap{padding:0 6mm}section{padding:20px 0}}
</style></head><body><main class="wrap">
<p class="kicker">Mini-charte graphique · version 1</p>
<h1>${cfg.nom}</h1>
<p class="lead">Les règles simples pour utiliser le logo partout de la même façon : site, réseaux sociaux, devis, cartes de visite. Le symbole NY ne change jamais. Si le nom du studio change un jour, seul le mot à côté du symbole est remplacé.</p>

<section>
  <h2>Le logo</h2>
  <p class="sub">Version horizontale pour les en-têtes (site, devis, signature e-mail), version verticale quand la place est carrée (affiche, écran d'ouverture).</p>
  <div class="g2">
    <div><div class="box light"><img src="${svg('logo-horizontal-clair.svg')}" alt="Logo ${cfg.nom}, version claire"></div><span class="lbl">Horizontal · sur fond clair</span></div>
    <div><div class="box dark"><img src="${svg('logo-horizontal-fonce.svg')}" alt="Logo ${cfg.nom}, version foncée"></div><span class="lbl">Horizontal · sur fond foncé</span></div>
    <div><div class="box light tall"><img src="${svg('logo-vertical-clair.svg')}" alt="Logo ${cfg.nom} vertical, version claire"></div><span class="lbl">Vertical · sur fond clair</span></div>
    <div><div class="box dark tall"><img src="${svg('logo-vertical-fonce.svg')}" alt="Logo ${cfg.nom} vertical, version foncée"></div><span class="lbl">Vertical · sur fond foncé</span></div>
  </div>
</section>

<section>
  <h2>Le symbole et les icônes</h2>
  <p class="sub">Le N bleu nuit (ou papier sur fond foncé) et le Y orange qui passe par-dessus la jambe du N. L'icône carrée sert de favicon, d'icône d'application (site installé sur le téléphone) et de photo de profil.</p>
  <div class="icons">
    <figure><div class="box light" style="min-height:0;padding:14px"><img src="${svg('symbole-clair.svg')}" alt="" style="height:88px"></div><figcaption>Symbole seul</figcaption></figure>
    <figure><img src="${svg('icone-carree.svg')}" alt="" width="96" height="96"><figcaption>Icône 96 px</figcaption></figure>
    <figure><img src="${svg('icone-carree.svg')}" alt="" width="48" height="48"><figcaption>48 px</figcaption></figure>
    <figure><img src="${svg('icone-carree.svg')}" alt="" width="32" height="32"><figcaption>32 px</figcaption></figure>
    <figure><img src="${svg('icone-carree.svg')}" alt="" width="16" height="16"><figcaption>16 px</figcaption></figure>
    <figure><div class="round"><img src="${svg('profil-reseaux.svg')}" alt=""></div><figcaption>Profil réseaux (recadré en rond)</figcaption></figure>
  </div>
</section>

<section>
  <h2>Espace libre et taille minimum</h2>
  <p class="sub">Garde autour du logo un espace vide au moins égal à la <b>largeur du Y</b> (la ligne pointillée). Rien ne doit entrer dans cette zone : texte, bord de page, autre logo.</p>
  <div class="g2">
    <div class="clear"><div class="zone"><img src="${svg('logo-horizontal-clair.svg')}" alt=""></div></div>
    <ul class="rules" style="margin:0">
      <li><b>Logo horizontal</b> : au moins 100 px de large à l'écran, 30 mm à l'impression.</li>
      <li><b>Logo vertical</b> : au moins 60 px de large à l'écran, 20 mm à l'impression.</li>
      <li><b>Symbole ou icône seuls</b> : jusqu'à 16 px (favicon). En dessous de 24 px, utiliser l'icône carrée plutôt que le symbole nu.</li>
    </ul>
  </div>
</section>

<section>
  <h2>Couleurs</h2>
  <p class="sub">Trois couleurs, pas plus. L'orange est réservé aux détails et aux boutons : il attire l'œil justement parce qu'il est rare.</p>
  <div class="g3">${couleurs.map((c) => `
    <div class="sw"><div class="chip" style="background:${c.hex};color:${c.fg}">${c.nom}</div>
    <dl><dt>Hex</dt><dd>${c.hex.toUpperCase()}</dd><dt>RVB</dt><dd>${rgb(c.hex)}</dd><dt>Rôle</dt><dd>${c.role}</dd></dl></div>`).join('')}
  </div>
  <table>
    <thead><tr><th>Exemple</th><th>Association</th><th>Contraste</th><th>Usage</th></tr></thead>
    <tbody>${paires.map((p) => `<tr><td><span class="pair" style="background:${p.b};color:${p.f};${p.b === C.papier ? 'border:1px solid var(--line)' : ''}">Aa</span></td><td>${p.n}</td><td>${fr(p.r)} : 1</td><td>${p.verdict}</td></tr>`).join('')}</tbody>
  </table>
  <p class="note">Contraste calculé selon la méthode WCAG : 4,5 : 1 minimum pour le texte courant, 3 : 1 pour les grands titres et les éléments graphiques. Pour l'impression, faire convertir ces couleurs en CMJN (ou Pantone) par l'imprimeur, avec une épreuve.</p>
</section>

<section>
  <h2>Polices</h2>
  <p class="sub">Deux polices gratuites (licence SIL Open Font License, disponibles sur Google Fonts), utilisables partout, y compris dans Word ou Canva.</p>
  <div class="type">
    <div class="spec"><div class="big">Plus Jakarta Sans</div><small>ExtraBold (800) · titres, mot du logo · lettres serrées (−3 à −4 %)</small></div>
    <div class="spec"><p class="body">Inter sert au texte courant : paragraphes, boutons, formulaires, devis. Très lisible sur écran, même en petit.</p><small>Regular (400), Medium (500), SemiBold (600) · texte courant</small></div>
  </div>
</section>

<section>
  <h2>À éviter</h2>
  <p class="sub">Le logo s'utilise toujours tel quel, à partir des fichiers fournis.</p>
  <div class="dont">
    <figure><div class="box light"><img src="${svg('logo-horizontal-clair.svg')}" alt="" style="transform:scaleX(1.35)"></div><figcaption>Ne pas étirer ni écraser</figcaption></figure>
    <figure><div class="box light"><img src="${svg('logo-horizontal-clair.svg')}" alt="" style="transform:rotate(-12deg)"></div><figcaption>Ne pas faire pivoter</figcaption></figure>
    <figure><div class="box light"><img src="${svg('logo-horizontal-clair.svg')}" alt="" style="filter:hue-rotate(150deg)"></div><figcaption>Ne pas changer les couleurs</figcaption></figure>
    <figure><div class="box light"><img src="${svg('logo-horizontal-clair.svg')}" alt="" style="filter:drop-shadow(4px 6px 4px rgba(0,0,0,.45))"></div><figcaption>Pas d'ombre ni d'effet</figcaption></figure>
    <figure><div class="box photo"><img src="${svg('logo-horizontal-clair.svg')}" alt=""></div><figcaption>Pas sur une photo chargée : utiliser une pastille de fond</figcaption></figure>
    <figure><div class="box dark"><img src="${svg('logo-horizontal-clair.svg')}" alt=""></div><figcaption>Pas la version claire sur fond foncé</figcaption></figure>
  </div>
</section>

<section>
  <h2>L'écran d'ouverture</h2>
  <p class="sub">Sur le site du studio, le logo se construit à chaque première visite (environ 2,5 s, clic pour passer, jamais si l'appareil demande moins d'animations).</p>
  <ol class="steps">
    <li><b>1 · Le N arrive</b>de la gauche en se dessinant.</li>
    <li><b>2 · Le Y arrive</b>de la droite, son bras passe par-dessus la jambe du N.</li>
    <li><b>3 · Battement</b>les deux lettres accrochées « respirent » une fois.</li>
    <li><b>4 · Le nom</b>« ${cfg.mot} » monte, puis la phrase d'accroche apparaît.</li>
  </ol>
</section>

<section>
  <h2>Fichiers fournis</h2>
  <p class="sub">Dossier <b>logo/final</b> : fichiers SVG (à privilégier, nets à toutes les tailles) et dossier <b>png</b> (fonds transparents) pour Word, Canva, les réseaux sociaux. <b>favicon.ico</b> pour le site.</p>
</section>
<p class="note">Couleurs, polices et règles : version 1 du ${new Date().toLocaleDateString('fr-BE')}. Nom du studio provisoire.</p>
</main></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);

  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.waitForLoadState('networkidle').catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(dir, `charte-${cfg.nom.toLowerCase().replace(/\s+/g, '-')}.pdf`), format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '8mm', right: '8mm' } });
  await b.close();
  console.log('OK : logo/charte (HTML + PDF)');
}
