// Génère la page de comparaison des pistes de logo à partir de config/studio.json.
// Le mot (« Visuals ») est converti en tracés vectoriels : net même avant le chargement des polices.
// Usage : node logo/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const C = cfg.couleurs;

// ---------- Mot en tracés vectoriels ----------
function wordPath(text, { weight = 800, size = 100, tracking = -0.035 } = {}) {
  const file = path.join(root, `node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff`);
  const buf = fs.readFileSync(file);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let x = 0;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, 0, size).toPathData(2));
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  // boîte englobante réelle
  const full = new opentype.Path();
  x = 0;
  glyphs.forEach((g, i) => {
    full.extend(g.getPath(x, 0, size));
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const bb = full.getBoundingBox();
  const pad = 2;
  return {
    d: parts.join(''),
    viewBox: `${(bb.x1 - pad).toFixed(1)} ${(bb.y1 - pad).toFixed(1)} ${(bb.x2 - bb.x1 + 2 * pad).toFixed(1)} ${(bb.y2 - bb.y1 + 2 * pad).toFixed(1)}`,
    ratio: (bb.x2 - bb.x1 + 2 * pad) / (bb.y2 - bb.y1 + 2 * pad),
  };
}
const mot = wordPath(cfg.mot);

// ---------- Les 3 symboles (viewBox 0 0 120 120) ----------
// Chaque trait : d, classe (couleur), animation d'entrée (côté d'arrivée), délai, durée.
const pistes = [
  {
    id: 'a',
    lettre: 'A',
    nom: 'Trait continu',
    idee: "Le N et le Y tracés d'un seul geste : la jambe droite du N repart directement dans la branche du Y. Le second bras arrive de la droite et vient fermer la lettre.",
    forts: ['Élégant, léger, très « studio de design »', 'Un seul geste = facile à animer et à reconnaître', 'Reste lisible en tout petit (favicon)'],
    attention: ['Plus discret : moins d’impact sur une affiche'],
    svg: (o) => `
      <g class="sym" style="--beat-delay:1.35s">
        <path class="ink draw from-left" style="--d:.15s;--t:1.1s" pathLength="1" d="M18 96V24l36 72V24l26 36v36" stroke-width="8"/>
        <path class="acc draw from-right" style="--d:.75s;--t:.6s" pathLength="1" d="M104 24 80 60" stroke-width="8"/>
      </g>`,
    style: 'round',
  },
  {
    id: 'b',
    lettre: 'B',
    nom: 'Entrelacs',
    idee: "Un N et un Y épais qui se croisent comme deux maillons : le bras du Y passe par-dessus la jambe du N. Chaque lettre arrive de son côté, elles s'accrochent, petit battement.",
    forts: ['Le plus « waw » à l’ouverture : l’accroche se voit', 'Fort sur une affiche, un véhicule, une carte de visite', 'Même esprit que les anneaux de Jumeo'],
    attention: ['Deux lettres entrelacées : rester géométrique pour ne pas évoquer le logo NY de New York'],
    svg: (o) => `
      <g class="sym" style="--beat-delay:1.3s">
        <path class="ink draw from-left" style="--d:.15s;--t:.9s" pathLength="1" d="M18 98V22l48 76V40" stroke-width="12"/>
        <path class="acc draw from-right" style="--d:.45s;--t:.85s" pathLength="1" d="M102 22 78 62v36" stroke-width="12"/>
        <path class="gap draw from-right" style="--d:.55s;--t:.75s" pathLength="1" d="M54 22 78 62" stroke-width="22"/>
        <path class="acc draw from-right" style="--d:.55s;--t:.75s" pathLength="1" d="M54 22 78 62" stroke-width="12"/>
      </g>`,
    style: 'square',
  },
  {
    id: 'c',
    lettre: 'C',
    nom: 'Viseur',
    idee: "Les quatre coins d'un viseur d'appareil photo arrivent des quatre côtés, le N et le Y se dessinent dedans, puis le cadre « fait la mise au point ». Parle directement de « visuels ».",
    forts: ['Raconte le métier : cadrer, mettre en valeur', 'Le cadre seul devient un élément graphique réutilisable (photos, réseaux)', 'Très bonne icône carrée'],
    attention: ['Plus de traits : un peu plus chargé en 16 px'],
    svg: (o) => `
      <g class="sym" style="--beat-delay:1.4s">
        <g class="frame">
          <path class="acc fly tl" style="--d:.05s" d="M12 36V12h24" stroke-width="6"/>
          <path class="acc fly tr" style="--d:.12s" d="M84 12h24v24" stroke-width="6"/>
          <path class="acc fly br" style="--d:.19s" d="M108 84v24H84" stroke-width="6"/>
          <path class="acc fly bl" style="--d:.26s" d="M36 108H12V84" stroke-width="6"/>
        </g>
        <path class="ink draw from-left" style="--d:.5s;--t:.8s" pathLength="1" d="M35 82V38l22 44V38" stroke-width="7"/>
        <path class="ink draw from-right" style="--d:.75s;--t:.6s" pathLength="1" d="M85 38 75 58v24" stroke-width="7"/>
        <path class="ink draw from-top" style="--d:.85s;--t:.5s" pathLength="1" d="M65 38l10 20" stroke-width="7"/>
      </g>`,
    style: 'round',
  },
];

const symbol = (p, extra = '') =>
  `<svg class="symbol s-${p.style}" viewBox="0 0 120 120" aria-hidden="true" ${extra}>${p.svg()}</svg>`;
const word = (cls = '') =>
  `<svg class="word ${cls}" viewBox="${mot.viewBox}" role="img" aria-label="${cfg.mot}"><path class="ink" d="${mot.d}"/></svg>`;

const card = (p) => `
<article class="card" id="piste-${p.id}">
  <header class="card-head">
    <span class="tag">Piste ${p.lettre}</span>
    <h2>${p.nom}</h2>
    <button class="replay" type="button" data-target="stage-${p.id}" aria-label="Rejouer l'animation de la piste ${p.lettre}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Rejouer
    </button>
  </header>
  <div class="stage anim" id="stage-${p.id}">
    <div class="splash">
      ${symbol(p)}
      <div class="word-wrap">${word('rise')}</div>
      <p class="tagline">${cfg.accroche}</p>
    </div>
  </div>
  <div class="variants">
    <div class="v v-dark"><div class="lockup">${symbol(p)}${word()}</div></div>
    <div class="v v-light"><div class="lockup">${symbol(p)}${word()}</div></div>
    <div class="v v-icons">
      <div class="tile t64">${symbol(p)}</div>
      <div class="tile t32">${symbol(p)}</div>
      <div class="tile t16">${symbol(p)}</div>
      <div class="avatar">${symbol(p)}</div>
    </div>
  </div>
  <p class="idea">${p.idee}</p>
  <div class="proscons">
    <ul class="pros">${p.forts.map((f) => `<li>${f}</li>`).join('')}</ul>
    <ul class="cons">${p.attention.map((f) => `<li>${f}</li>`).join('')}</ul>
  </div>
</article>`;

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${cfg.nom} — pistes de logo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<style>
:root{
  --paper:${C.papier}; --night:${C.nuit}; --ink:${C.encre}; --accent:${C.accent};
  --muted:#5b6475; --line:#e3dfd6; --ease:cubic-bezier(.16,1,.3,1);
  --bg:var(--paper); --fg:var(--ink);
}
*{box-sizing:border-box;margin:0}
body{background:#ECE9E2;color:var(--ink);font:400 16px/1.55 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1240px;margin:0 auto;padding:40px 16px 64px}
h1{font:800 clamp(30px,5vw,52px)/1.02 'Plus Jakarta Sans',system-ui,sans-serif;letter-spacing:-.035em;max-width:16ch}
.lead{color:var(--muted);max-width:60ch;margin-top:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-top:36px}
.card{background:#fff;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:16px;box-shadow:0 1px 0 rgba(11,19,36,.04),0 10px 30px -18px rgba(11,19,36,.25)}
.card-head{display:flex;align-items:center;gap:10px}
.tag{font:600 12px/1 Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,#fff);padding:6px 9px;border-radius:99px}
.card h2{font:800 22px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.03em;flex:1}
.replay{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;border-radius:99px;padding:8px 12px;font:500 14px/1 Inter,sans-serif;color:var(--ink);cursor:pointer;transition:border-color .2s}
.replay:hover{border-color:var(--ink)}
.replay:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.replay svg{width:16px;height:16px}

/* ----- scène d'ouverture ----- */
.stage{--bg:var(--paper);background:var(--bg);border-radius:16px;aspect-ratio:4/3.2;display:grid;place-items:center;overflow:hidden;position:relative}
.splash{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%}
.splash .symbol{width:38%;max-width:150px;overflow:visible}
.word-wrap{width:46%;max-width:190px}
.word{display:block;width:100%;height:auto}
.tagline{font:500 14px/1.4 Inter,sans-serif;color:var(--muted);text-align:center;padding:0 16px}

/* traits */
.symbol path{fill:none}
.s-round path{stroke-linecap:round;stroke-linejoin:round}
.s-square path{stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:2}
.ink{stroke:var(--fg)} .word .ink{stroke:none;fill:var(--fg)}
.acc{stroke:var(--accent)}
.gap{stroke:var(--bg)}
.sym{transform-box:fill-box;transform-origin:50% 50%}

/* animations — seulement dans .anim */
.anim .draw{stroke-dasharray:1 1;animation:draw var(--t,1s) var(--ease) var(--d,0s) both}
.anim .from-left{--x:-26px;--y:0px} .anim .from-right{--x:26px;--y:0px} .anim .from-top{--x:0px;--y:-26px}
@keyframes draw{
  0%{stroke-dashoffset:1;opacity:0;transform:translate(var(--x),var(--y))}
  12%{opacity:1}
  100%{stroke-dashoffset:0;opacity:1;transform:none}
}
.anim .fly{animation:fly .7s var(--ease) var(--d,0s) both}
.anim .tl{--x:-34px;--y:-34px} .anim .tr{--x:34px;--y:-34px} .anim .br{--x:34px;--y:34px} .anim .bl{--x:-34px;--y:34px}
@keyframes fly{0%{opacity:0;transform:translate(var(--x),var(--y))}100%{opacity:1;transform:none}}
.anim .frame{transform-box:fill-box;transform-origin:50% 50%;animation:focus .55s var(--ease) 1.25s both}
@keyframes focus{0%{transform:scale(1)}45%{transform:scale(.9)}100%{transform:scale(1)}}
.anim .sym{animation:beat .5s var(--ease) var(--beat-delay,1.4s) both}
@keyframes beat{0%,100%{transform:scale(1)}40%{transform:scale(1.07)}}
.anim .word-wrap{overflow:hidden}
.anim .rise{animation:rise .8s var(--ease) 1.55s both}
@keyframes rise{0%{transform:translateY(105%)}100%{transform:none}}
.anim .tagline{animation:fadeup .7s var(--ease) 1.9s both}
@keyframes fadeup{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.anim *{animation:none!important}}

/* ----- déclinaisons ----- */
.variants{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.v{border-radius:12px;padding:16px 14px;display:flex;align-items:center;justify-content:center;min-height:84px}
.v-dark{--bg:var(--night);--fg:var(--paper);background:var(--bg)}
.v-light{--bg:var(--paper);background:var(--bg)}
.lockup{display:flex;align-items:center;justify-content:center;gap:8%;width:100%}
.lockup .symbol{width:28%;max-width:44px;flex:none}
.lockup .word{flex:0 1 auto;min-width:0;width:62%;max-width:110px;height:auto}
.v-icons{grid-column:1/-1;background:#f3f1ec;gap:18px;justify-content:flex-start}
.tile{--bg:var(--night);--fg:var(--paper);background:var(--bg);display:grid;place-items:center;flex:none}
.tile .symbol{width:72%}
.t64{width:64px;height:64px;border-radius:15px}
.t32{width:32px;height:32px;border-radius:8px}
.t16{width:16px;height:16px;border-radius:4px}
.t16 .symbol{width:82%}
.avatar{--bg:var(--accent);--fg:#fff;width:56px;height:56px;border-radius:50%;background:var(--bg);display:grid;place-items:center;margin-left:auto}
.avatar .symbol{width:60%} .avatar .acc{stroke:var(--night)}
.idea{color:var(--ink)}
.proscons{display:grid;gap:8px;font-size:14px}
.proscons ul{list-style:none;padding:0;display:grid;gap:6px}
.proscons li{padding-left:22px;position:relative;color:var(--muted)}
.proscons li::before{content:"";position:absolute;left:2px;top:.45em;width:12px;height:12px;border-radius:50%}
.pros li::before{background:#1f9d68 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 6.2 5 8l4-4' fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
.cons li::before{background:#d08a00 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M6 3v3.5M6 8.6v.1' fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E")}
.foot{margin-top:28px;color:var(--muted);font-size:14px;max-width:70ch}
.swatch{display:inline-block;width:.9em;height:.9em;border-radius:3px;vertical-align:-1px;background:var(--accent)}

/* ----- planche image par image (?planche) ----- */
.board{display:grid;gap:22px;margin-top:28px}
.board-row h3{font:800 18px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.02em;margin-bottom:10px}
.board-frames{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.board-frames figure{display:grid;gap:6px}
.board-frames .stage{aspect-ratio:1/1}
.board-frames figcaption{font:500 12px/1 Inter,sans-serif;color:var(--muted);text-align:center}
</style>
</head>
<body>
<main class="wrap">
  <h1>Ton monogramme NY : 3 pistes</h1>
  <p class="lead">Chaque carte montre l'écran d'ouverture tel qu'il apparaîtra sur ton site (bouton « Rejouer »), puis le logo en version foncée, claire, et en icône (64, 32, 16 px et photo de profil). Le symbole NY reste le même si le nom change : seul le mot à côté est remplacé.</p>
  <div class="grid">${pistes.map(card).join('')}</div>
  <p class="foot"><span class="swatch"></span> Couleur d'accent provisoire ${C.accent} (orange signal), fond papier ${C.papier}, bleu nuit ${C.nuit}. Mot « ${cfg.mot} » en Plus Jakarta Sans ExtraBold, converti en tracé vectoriel. Couleurs et accroche modifiables avant la version finale.</p>
</main>
<script>
// Rejouer : on remplace la scène par une copie neuve, ce qui relance les animations CSS.
document.querySelectorAll('.replay').forEach(function (b) {
  b.addEventListener('click', function () {
    var s = document.getElementById(b.dataset.target);
    var c = s.cloneNode(true); s.replaceWith(c);
  });
});
// Mode planche : ?planche affiche chaque animation image par image.
if (/planche/.test(location.search)) {
  var times = [0.3, 0.7, 1.0, 1.4, 1.8, 3.0];
  var board = document.createElement('section'); board.className = 'board';
  document.querySelectorAll('.card').forEach(function (card) {
    var row = document.createElement('div'); row.className = 'board-row';
    row.innerHTML = '<h3>' + card.querySelector('.tag').textContent + ' · ' + card.querySelector('h2').textContent + '</h3><div class="board-frames"></div>';
    times.forEach(function (t) {
      var f = document.createElement('figure');
      var st = card.querySelector('.stage').cloneNode(true); st.removeAttribute('id'); st.dataset.t = t;
      f.appendChild(st);
      var cap = document.createElement('figcaption'); cap.textContent = t.toFixed(1).replace('.', ',') + ' s';
      f.appendChild(cap); row.querySelector('.board-frames').appendChild(f);
    });
    board.appendChild(row);
  });
  var main = document.querySelector('main');
  main.innerHTML = '<h1>Ouverture image par image</h1>'; main.appendChild(board);
  document.querySelectorAll('[data-t]').forEach(function (st) {
    st.getAnimations({ subtree: true }).forEach(function (a) { a.pause(); a.currentTime = st.dataset.t * 1000; });
  });
}
</script>
</body>
</html>`;

fs.mkdirSync(path.join(root, 'logo/pistes'), { recursive: true });
fs.writeFileSync(path.join(root, 'logo/pistes/index.html'), html);
console.log('OK : logo/pistes/index.html (' + cfg.nom + ')');

// Fichiers finaux de la piste choisie (B · Entrelacs) + mini-charte
await (await import('./final.mjs')).default({ root, cfg, mot });
await (await import('./charte.mjs')).default({ root, cfg });

