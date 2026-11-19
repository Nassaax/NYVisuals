// Kit Nayas Visuals — génère le site d'un client à partir de sa fiche client.json.
// Usage : node build.mjs                      (client.json à côté, site dans ./dist)
//         node build.mjs --config chemin/client.json --out chemin/dist
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const cfgPath = path.resolve(arg('--config') || path.join(here, 'client.json'));
const base = path.dirname(cfgPath);
const dist = path.resolve(arg('--out') || path.join(base, 'dist'));
const src = path.join(here, 'src');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
for (const k of ['nom', 'slogan', 'accroche', 'metier']) if (!cfg[k]) throw new Error(`client.json : « ${k} » est obligatoire`);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = (x) => (Array.isArray(x) ? x : []);
const ct = cfg.contact || {}, ent = cfg.entreprise || {}, col = cfg.couleurs || {};
const indexable = !!(cfg.site && cfg.site.referencement);
const siteUrl = ((cfg.site && cfg.site.url) || '').replace(/\/$/, '');
const cta = { principal: 'Demander un devis', court: 'Devis', ...(cfg.cta || {}) };
const credit = cfg.credit || { nom: 'Nayas Visuals', url: '' };

// ---------- Couleurs : contrastes calculés automatiquement ----------
const P = col.papier || '#F6F4EF', N = col.nuit || '#10161F', A = col.accent || '#FF5B2E';
const rgb = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const c = rgb(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
const toward = (c, target, bg, min) => { let t = 0, out = c; while (ratio(out, bg) < min && t < 1) { t += 0.04; out = mix(c, target, t); } return out; };
const accentInk = toward(A, '#000000', P, 4.6);        // accent lisible en texte sur fond clair
const accentLight = toward(A, '#FFFFFF', N, 4.6);      // accent lisible en texte sur fond sombre
const onAccent = ratio(N, A) >= ratio('#FFFFFF', A) ? N : '#FFFFFF';   // texte sur les boutons
const heroDark = (col.fond_hero || 'nuit') === 'nuit';

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(dist, 'img'), { recursive: true });

// ---------- Texte en tracés vectoriels (nom du client, initiales) ----------
const opentype = require('opentype.js');
const fbuf = fs.readFileSync(path.join(src, 'fonts/jakarta-800.woff'));
const font = opentype.parse(fbuf.buffer.slice(fbuf.byteOffset, fbuf.byteOffset + fbuf.byteLength));
function textPaths(text, size = 100, tracking = -0.035) {
  const glyphs = font.stringToGlyphs(text), scale = size / font.unitsPerEm;
  let x = 0; const parts = [], all = new opentype.Path();
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, size); parts.push(p.toPathData(2)); all.extend(p);
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const bb = all.getBoundingBox(), pad = 2;
  return { parts, d: parts.join(''), vb: [bb.x1 - pad, bb.y1 - pad, bb.x2 - bb.x1 + 2 * pad, bb.y2 - bb.y1 + 2 * pad] };
}
const nameW = textPaths(cfg.nom);
const vb = (a) => a.map((v) => +v.toFixed(1)).join(' ');

// ---------- Logo : fichier SVG du client, ou monogramme généré ----------
const sides = [[-28, 0], [28, 0], [0, -28], [0, 28]];
let logoInner, logoVB, logoHasDark = false;
function splitTop(svgInner) {               // découpe les éléments de premier niveau d'un SVG
  const out = []; let depth = 0, start = -1;
  const re = /<\/?([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g; let m;
  while ((m = re.exec(svgInner))) {
    const closing = m[0][1] === '/', self = m[2] === '/' || /\/>$/.test(m[0]);
    if (!closing && depth === 0) start = m.index;
    if (!closing && !self) depth++;
    if (closing) depth--;
    if (depth === 0 && start > -1 && (closing || self)) { out.push(svgInner.slice(start, m.index + m[0].length)); start = -1; }
  }
  return out;
}
if (cfg.logo && cfg.logo.fichier) {
  const raw = fs.readFileSync(path.resolve(base, cfg.logo.fichier), 'utf8').replace(/<\?xml[^>]*>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/g, '');
  const open = raw.match(/<svg[^>]*>/)[0];
  logoVB = (open.match(/viewBox="([^"]+)"/) || [])[1] || `0 0 ${parseFloat((open.match(/width="([\d.]+)/) || [])[1] || 100)} ${parseFloat((open.match(/height="([\d.]+)/) || [])[1] || 100)}`;
  const inner = raw.slice(raw.indexOf(open) + open.length, raw.lastIndexOf('</svg>')).replace(/<(title|metadata|desc)[\s\S]*?<\/\1>/g, '');
  let i = 0;
  logoInner = splitTop(inner).map((el) => /^<(defs|style)/.test(el) ? el : `<g class="piece" style="--i:${i};--x:${sides[i % 4][0]}px;--y:${sides[i++ % 4][1]}px">${el}</g>`).join('');
  logoHasDark = !!cfg.logo.fichier_fonce;
} else {
  const ini = (cfg.logo && cfg.logo.initiales) || cfg.nom.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const t = textPaths(ini, 60, -0.02);
  const [x0, y0, w0, h0] = t.vb, s = 64 / Math.max(w0, h0 * 1.15), cx = 60 - (x0 + w0 / 2) * s, cy = 60 - (y0 + h0 / 2) * s;
  logoVB = '0 0 120 120';
  logoInner = `<rect class="outline" pathLength="1" x="6" y="6" width="108" height="108" rx="30" fill="none" stroke="${A}" stroke-width="5"/>
    <rect class="fillsq" x="6" y="6" width="108" height="108" rx="30" fill="${A}"/>
    <g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(4)})">${t.parts.map((d, k) => `<g class="piece" style="--i:${k + 2};--x:${sides[k % 2][0]}px;--y:0px"><path fill="${onAccent}" d="${d}"/></g>`).join('')}</g>`;
}
const logoSvg = (cls = '') => `<svg class="logo-sym ${cls}" viewBox="${logoVB}" aria-hidden="true"><g class="beat">${logoInner}</g></svg>`;

// ---------- Icônes ----------
const ic = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'), check: ic('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.2"'),
  x: ic('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2"'), plus: ic('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2"'),
  home: ic('<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>'), grid: ic('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  menu: ic('<path d="M4 7h16M4 12h16M4 17h10"/>'), chat: ic('<path d="M4.5 18.5 5.8 15A7.5 7.5 0 1 1 9 18.2z"/><path d="M9 11h6M9 14h3.5"/>'),
  pin: ic('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'), clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  phone: ic('<path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>'),
  mail: ic('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>'), info: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
  shield: ic('<path d="M12 3.5 19 6v6c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z"/><path d="m9 12 2 2 4-4"/>'), quote: ic('<path d="M9.5 7.5C7 8.5 5.5 10.5 5.5 13.5V17h4.5v-4.5H7.5M18.5 7.5c-2.5 1-4 3-4 6V17H19v-4.5h-2.5"/>'),
  instagram: ic('<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2h.01"/>'),
  facebook: ic('<path d="M14.5 8H16V4.8h-2.2c-2.4 0-3.6 1.5-3.6 3.8V11H8v3h2.2v6.2h3.2V14h2.3l.5-3h-2.8V9c0-.6.4-1 1.1-1z"/>'),
  linkedin: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10.5V16M8 7.8h.01M11.5 16v-3.2c0-1.4.8-2.3 2-2.3s1.8.9 1.8 2.3V16M11.5 10.5V16"/>'),
};
// Icônes de services (choisies par mot-clé dans client.json, animées au survol)
const sv = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const SERVICE_ICONS = {
  maison: sv('<path pathLength="1" d="M4 10.5 12 4l8 6.5V20H4z"/><path class="a" pathLength="1" d="M10 20v-5h4v5"/>'),
  marteau: sv('<path pathLength="1" d="M14.5 3.5l6 6-3 3-6-6z"/><path class="a" pathLength="1" d="M11.5 6.5 4 14a2.1 2.1 0 0 0 3 3l7.5-7.5"/>'),
  regle: sv('<path pathLength="1" d="M3.5 16.5 16.5 3.5l4 4-13 13z"/><path class="a" pathLength="1" d="M8 12l1.5 1.5M10.5 9.5 12 11M13 7l1.5 1.5"/>'),
  eclair: sv('<path class="a" pathLength="1" d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'),
  soleil: sv('<circle class="a" pathLength="1" cx="12" cy="12" r="4"/><path pathLength="1" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
  feuille: sv('<path pathLength="1" d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path class="a" pathLength="1" d="M5 19 13 11"/>'),
  ciseaux: sv('<circle pathLength="1" cx="6" cy="6.5" r="2.5"/><circle pathLength="1" cx="6" cy="17.5" r="2.5"/><path class="a" pathLength="1" d="M8 8.2 20 18M8 15.8 20 6"/>'),
  appareil: sv('<rect pathLength="1" x="3.5" y="7" width="17" height="12" rx="2.5"/><circle class="a" pathLength="1" cx="12" cy="13" r="3.2"/><path pathLength="1" d="M9 7l1.5-2.5h3L15 7"/>'),
  bulle: sv('<path pathLength="1" d="M4.5 18.5 5.8 15A7.5 7.5 0 1 1 9 18.2z"/><path class="a" pathLength="1" d="M9 11h6M9 14h3.5"/>'),
  etoile: sv('<path class="a" pathLength="1" d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>'),
  camion: sv('<path pathLength="1" d="M3.5 6.5h11v9h-11zM14.5 10h3.5l2.5 3v2.5h-6"/><circle class="a" pathLength="1" cx="7.5" cy="17" r="1.8"/><circle class="a" pathLength="1" cx="17" cy="17" r="1.8"/>'),
  cle: sv('<circle class="a" pathLength="1" cx="8" cy="15" r="4"/><path pathLength="1" d="m11 12 8-8M16 7l2 2M14 9l1.5 1.5"/>'),
  pinceau: sv('<path pathLength="1" d="M14 4.5 19.5 10l-7 7-5.5-5.5z"/><path class="a" pathLength="1" d="M7 11.5 4.5 14c-1 1-1 3 0 4s3 1 4 0L11 15.5"/>'),
  coeur: sv('<path class="a" pathLength="1" d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10z"/>'),
  bouclier: sv('<path pathLength="1" d="M12 3.5 19 6v6c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z"/><path class="a" pathLength="1" d="m9 12 2 2 4-4"/>'),
  horloge: sv('<circle pathLength="1" cx="12" cy="12" r="8.5"/><path class="a" pathLength="1" d="M12 7.5V12l3 2"/>'),
  euro: sv('<circle pathLength="1" cx="12" cy="12" r="8.5"/><path class="a" pathLength="1" d="M15 8.5a4 4 0 1 0 0 7M7.5 11h6M7.5 13.5h5"/>'),
  etincelle: sv('<path class="a" pathLength="1" d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path pathLength="1" d="M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
};
const svcIcon = (k) => SERVICE_ICONS[k] || SERVICE_ICONS.etincelle;

const btn = (label, href, { cls = '', attrs = '' } = {}) => `<a class="btn ${cls}" href="${href}" ${attrs}><span class="btn-label"><span data-t="${esc(label)}">${esc(label)}</span></span><span class="btn-arrow">${I.arrow}${I.arrow}</span></a>`;
const ghost = (label, href) => `<a class="btn ghost" href="${href}"><span class="btn-label"><span data-t="${esc(label)}">${esc(label)}</span></span></a>`;

// ---------- Photos (uniquement celles fournies par le client) ----------
const copyPhoto = (rel) => { if (!rel) return null; const f = path.resolve(base, rel); if (!fs.existsSync(f)) throw new Error('Photo introuvable : ' + rel); const name = path.basename(f); fs.copyFileSync(f, path.join(dist, 'img', name)); return 'img/' + name; };
const heroPhoto = copyPhoto(cfg.photos && cfg.photos.hero);
const works = list(cfg.realisations).map((r) => ({ ...r, src: copyPhoto(r.photo) }));
const avis = list(cfg.avis).filter((a) => a.texte && a.auteur && a.source);   // jamais d'avis sans auteur ni source
const faq = list(cfg.faq);
const steps = list(cfg.etapes).length ? cfg.etapes : [
  { titre: 'Premier contact', texte: 'Vous expliquez votre besoin, par message ou par téléphone.' },
  { titre: 'Proposition', texte: 'Une proposition claire, avec un prix annoncé avant de commencer.' },
  { titre: 'Réalisation', texte: 'Le travail est fait avec soin, dans les délais convenus.' },
];
const socials = Object.entries(cfg.reseaux || {}).filter(([, v]) => v);

// ---------- Sections et navigation ----------
const nav = [['#services', 'Services'], ['#etapes', 'Comment ça marche'], ...(works.length ? [['#realisations', 'Réalisations']] : []), ...(avis.length ? [['#avis', 'Avis']] : []), ['#infos', 'Infos pratiques'], ...(faq.length ? [['#faq', 'Questions']] : [])];
const sloganWords = cfg.slogan.trim().split(/\s+/);
const sloganHtml = esc(sloganWords.slice(0, -1).join(' ')) + ' <span class="accent">' + esc(sloganWords.at(-1)) + '</span>';
const holder = ent.raison_sociale || cfg.nom;

const mentions = `
  <p><b>Éditeur du site :</b> ${esc(holder)}${ent.responsable ? ` (${esc(ent.responsable)})` : ''}.</p>
  ${ent.adresse ? `<p><b>Adresse :</b> ${esc(ent.adresse)}</p>` : ''}
  ${ent.bce ? `<p><b>Numéro d'entreprise (BCE) :</b> ${esc(ent.bce)}</p>` : ''}
  ${ent.tva ? `<p><b>TVA :</b> ${esc(ent.tva)}</p>` : ''}
  ${ct.email ? `<p><b>Contact :</b> <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : ''}
  ${ct.telephone_affiche ? `<p><b>Téléphone :</b> ${esc(ct.telephone_affiche)}</p>` : ''}
  ${cfg.exemple ? '<p><b>Site d\u2019exemple :</b> cette entreprise est imaginaire.</p>' : (!ent.bce || !ent.adresse) ? '<p class="todo">À compléter avant la mise en ligne : adresse et numéro d\u2019entreprise.</p>' : ''}
  <h3>Hébergement</h3><p>${esc(cfg.hebergeur || '')}</p>
  <h3>Propriété intellectuelle</h3><p>Les textes, photos et logos de ce site appartiennent à ${esc(holder)} ou sont utilisés avec l'accord de leur auteur.</p>
  <p>Site réalisé par ${esc(credit.nom)}. Polices Plus Jakarta Sans et Inter (licence SIL Open Font License), hébergées sur ce site.</p>`;
const privacy = `
  <p><b>Responsable du traitement :</b> ${esc(holder)}${ct.email ? `, <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}.</p>
  <h3>Aucun cookie, aucun suivi</h3><p>Ce site n'utilise ni cookie, ni outil de mesure d'audience, ni publicité. Les polices sont hébergées sur le site lui-même.</p>
  <h3>Le formulaire de contact</h3>
  <p>Le formulaire n'enregistre et n'envoie rien : il prépare un message que vous envoyez vous-même, depuis WhatsApp ou votre messagerie. Les informations que vous choisissez d'envoyer (prénom, téléphone ou e-mail, demande) servent uniquement à vous répondre et, si vous le souhaitez, à établir un devis.</p>
  <ul><li>Base : votre consentement et les démarches avant un éventuel contrat.</li><li>Durée : le temps de traiter votre demande et le suivi éventuel ; elles sont supprimées si aucune suite n'est donnée.</li><li>Vos données ne sont jamais vendues ni cédées.</li></ul>
  <p>Si vous utilisez WhatsApp, l'envoi passe par ce service et ses propres conditions.</p>
  <h3>Hébergeur</h3><p>L'hébergeur peut conserver des journaux techniques (adresse IP, date, page demandée) pour la sécurité du site.</p>
  <h3>Vos droits</h3><p>Accès, correction, suppression, opposition : écrivez-nous${ct.email ? ` à <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ' via le formulaire de contact'}. Vous pouvez aussi introduire une plainte auprès de l'Autorité de protection des données (rue de la Presse 35, 1000 Bruxelles, autoriteprotectiondonnees.be).</p>
  <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`;

const title = `${cfg.nom} · ${cfg.metier}${cfg.zone ? ' · ' + cfg.zone : ''}`;
const description = cfg.description || `${cfg.metier}. ${cfg.accroche}`.slice(0, 158);
const jsonld = {
  '@context': 'https://schema.org', '@type': cfg.type_schema || 'LocalBusiness', name: cfg.nom, description, slogan: cfg.slogan,
  ...(ent.adresse ? { address: { '@type': 'PostalAddress', streetAddress: ent.adresse, addressCountry: 'BE' } } : {}),
  ...(cfg.zone_detail ? { areaServed: cfg.zone_detail } : {}),
  ...(siteUrl ? { url: siteUrl + '/', image: siteUrl + '/og.png' } : {}),
  ...(ct.telephone_affiche ? { telephone: ct.telephone_affiche } : {}), ...(ct.email ? { email: ct.email } : {}),
  ...(socials.length ? { sameAs: socials.map(([, v]) => v) } : {}),
};
const front = { nom: cfg.nom, whatsapp: (ct.whatsapp || '').replace(/\D/g, ''), email: ct.email || '', instagram: '', splashKey: 'splash-' + cfg.nom.toLowerCase().replace(/\W+/g, '-'),
  bientot: cfg.exemple ? 'Site d\u2019exemple : le formulaire est désactivé.' : 'Le formulaire sera actif très bientôt. Merci de votre patience !' };
const telHref = ct.telephone_affiche ? 'tel:' + ct.telephone_affiche.replace(/[^\d+]/g, '') : '';
const splashDark = heroDark && (!cfg.logo || !cfg.logo.fichier || logoHasDark);

const html = `<!doctype html>
<html lang="fr-BE" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${indexable ? '' : '<meta name="robots" content="noindex, nofollow">\n'}${siteUrl ? `<link rel="canonical" href="${siteUrl}/">\n` : ''}<meta name="theme-color" content="${heroDark ? N : P}">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_BE">
<meta property="og:title" content="${esc(cfg.nom)} · ${esc(cfg.slogan)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${siteUrl ? siteUrl + '/' : ''}og.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="icone.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icone-180.png"><link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="fonts/jakarta-800.woff2" as="font" type="font/woff2" crossorigin>
<style>:root{--paper:${P};--night:${N};--accent:${A};--accent-ink:${accentInk};--accent-light:${accentLight};--on-accent:${onAccent}}</style>
<script>(function(h){h.classList.remove('no-js');h.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${front.splashKey}'))h.classList.add('splash-on')}catch(e){}})(document.documentElement)</script>
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>

<div class="splash ${splashDark ? 'sp-dark' : 'sp-light'}" aria-hidden="true">
  <div class="sp-inner">
    ${logoSvg('drawn sp-logo')}
    <div class="sp-name"><svg viewBox="${vb(nameW.vb)}"><path fill="currentColor" d="${nameW.d}"/></svg></div>
    <p class="sp-slogan">${esc(cfg.slogan)}</p>
  </div>
  <button class="sp-skip" type="button" tabindex="-1">Passer</button>
</div>

<header class="top">
  <div class="wrap">
    <a class="brand" href="#top" aria-label="${esc(cfg.nom)}, retour en haut">${logoSvg('brand-sym')}<span>${esc(cfg.nom)}</span></a>
    <nav class="nav" aria-label="Navigation principale">${nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
    ${btn(cta.principal, '#contact', { cls: 'sm top-cta dark-btn' })}
  </div>
</header>

<main id="contenu">
  <section class="hero ${heroDark ? 'dark' : 'light-hero'}" id="top" aria-labelledby="h1">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="wrap">
      <div>
        <p class="pill enter"><i aria-hidden="true"></i>${cfg.exemple ? 'Site d\u2019exemple · entreprise imaginaire' : esc(cfg.metier + (cfg.zone ? ' · ' + cfg.zone : ''))}</p>
        <h1 class="h1" id="h1" data-words style="--d:.12s">${sloganHtml}</h1>
        <p class="lead enter" style="--d:.45s">${esc(cfg.accroche)}</p>
        <div class="hero-ctas enter" style="--d:.6s">${btn(cta.principal, '#contact')}${telHref ? ghost('Appeler', telHref) : ghost('Voir les services', '#services')}</div>
        ${list(cfg.atouts).length ? `<div class="hero-meta enter" style="--d:.75s">${cfg.atouts.map((a) => `<span>${I.check}${esc(a)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="hero-art ${heroPhoto ? 'has-photo' : ''}" aria-hidden="${heroPhoto ? 'false' : 'true'}">
        <div class="glow"></div>
        ${heroPhoto ? `<img class="hero-photo" src="${heroPhoto}" alt="${esc((cfg.photos && cfg.photos.hero_alt) || cfg.nom)}" width="900" height="1100">` : logoSvg('drawn')}
      </div>
    </div>
  </section>

  <section class="sec" id="services" aria-labelledby="t-services">
    <div class="wrap">
      <div class="sec-head" data-reveal><p class="kicker">Services</p><h2 class="h2" id="t-services">${esc(cfg.titre_services || 'Ce que nous faisons.')}</h2>${cfg.intro_services ? `<p class="lead">${esc(cfg.intro_services)}</p>` : ''}</div>
      <div class="cards cards-${Math.min(list(cfg.services).length, 4)}">
        ${list(cfg.services).map((s, i) => `<article class="card" data-reveal style="--rd:${(i % 3) * 0.08}s"><div class="ico">${svcIcon(s.icone)}</div><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></article>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec dark" id="etapes" aria-labelledby="t-etapes">
    <div class="wrap method">
      <div class="sec-head" data-reveal><p class="kicker">Comment ça marche</p><h2 class="h2" id="t-etapes">${esc(cfg.titre_etapes || 'Simple, du premier message au résultat.')}</h2><p style="margin-top:30px">${btn(cta.principal, '#contact')}</p></div>
      <ol class="steps">
        <li class="track" aria-hidden="true"><svg viewBox="0 0 4 100" preserveAspectRatio="none"><path class="bg" d="M2 0V100" vector-effect="non-scaling-stroke"/><path class="fg" pathLength="1" d="M2 0V100" vector-effect="non-scaling-stroke"/></svg></li>
        ${steps.map((s, i) => `<li class="step" data-reveal><span class="dot">${i + 1}</span><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></li>`).join('')}
      </ol>
    </div>
  </section>

  ${works.length ? `<section class="sec" id="realisations" aria-labelledby="t-real"><div class="wrap">
    <div class="sec-head" data-reveal><p class="kicker">Réalisations</p><h2 class="h2" id="t-real">${esc(cfg.titre_realisations || 'Quelques réalisations.')}</h2></div>
    <div class="gallery">${works.map((w, i) => `<figure class="shot" data-reveal style="--rd:${(i % 3) * 0.08}s"><img src="${w.src}" alt="${esc(w.alt || w.legende || cfg.nom)}" loading="lazy" decoding="async" width="800" height="600">${w.legende ? `<figcaption>${esc(w.legende)}</figcaption>` : ''}</figure>`).join('')}</div>
  </div></section>` : ''}

  ${avis.length ? `<section class="sec" id="avis" aria-labelledby="t-avis" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-reveal><p class="kicker">Avis</p><h2 class="h2" id="t-avis">Ils en parlent.</h2></div>
    <div class="reviews">${avis.map((a, i) => `<figure class="review" data-reveal style="--rd:${(i % 3) * 0.08}s">${I.quote}<blockquote>${esc(a.texte)}</blockquote><figcaption><b>${esc(a.auteur)}</b><span>${esc(a.source)}${a.date ? ' · ' + esc(a.date) : ''}</span></figcaption></figure>`).join('')}</div>
  </div></section>` : ''}

  <section class="sec" id="infos" aria-labelledby="t-infos">
    <div class="wrap">
      <div class="sec-head" data-reveal><p class="kicker">Infos pratiques</p><h2 class="h2" id="t-infos">Où et quand.</h2></div>
      <div class="infos">
        <div class="info" data-reveal>${I.pin}<b>Zone</b><span>${esc([cfg.zone, cfg.zone_detail].filter(Boolean).join(' · ') || '—')}</span>${ent.adresse ? `<span>${esc(ent.adresse)}</span>` : ''}</div>
        ${list(cfg.horaires).length ? `<div class="info" data-reveal style="--rd:.08s">${I.clock}<b>Horaires</b>${cfg.horaires.map((h) => `<span>${esc(h)}</span>`).join('')}</div>` : ''}
        <div class="info" data-reveal style="--rd:.16s">${I.chat}<b>Contact</b>${ct.telephone_affiche ? `<a href="${telHref}">${esc(ct.telephone_affiche)}</a>` : ''}${ct.email ? `<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}<a href="#contact">${esc(cta.principal)}</a></div>
      </div>
    </div>
  </section>

  ${faq.length ? `<section class="sec" id="faq" aria-labelledby="t-faq" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-reveal><p class="kicker">Questions fréquentes</p><h2 class="h2" id="t-faq">Vos questions.</h2></div>
    <div class="faq">${faq.map(({ q, r }, i) => `<details data-reveal style="--rd:${i * 0.04}s"><summary>${esc(q)}<span class="pm" aria-hidden="true">${I.plus}</span></summary><p class="ans">${esc(r)}</p></details>`).join('')}</div>
  </div></section>` : ''}

  <section class="sec" id="contact" aria-labelledby="t-contact" style="padding-top:0">
    <div class="wrap contact">
      <div data-reveal>
        <p class="kicker">Contact</p>
        <h2 class="h2" id="t-contact">${esc(cta.principal)}.</h2>
        <p class="lead">Quelques mots suffisent. Votre message est préparé pour vous et s'ouvre dans ${ct.whatsapp ? 'WhatsApp' : 'votre messagerie'} : il ne reste qu'à l'envoyer.</p>
        <ul class="reassure"><li>${I.shield}<span>Rien n'est enregistré sur ce site.</span></li>${cfg.zone ? `<li>${I.pin}<span>${esc(cfg.zone)}.</span></li>` : ''}</ul>
      </div>
      <form class="form" id="contact-form" novalidate data-reveal style="--rd:.1s">
        <input type="hidden" name="formule" value="">
        <div class="f2">
          <label class="field"><span>Prénom</span><input type="text" name="prenom" autocomplete="given-name" required></label>
          <label class="field"><span>Téléphone ou e-mail</span><input type="text" name="joindre" autocomplete="email" required></label>
        </div>
        <div class="field"><fieldset><legend>Votre demande <small>(plusieurs choix possibles)</small></legend>
          <div class="tiles">${[...list(cfg.services).map((s) => [s.titre, svcIcon(s.icone)]), ['Autre demande', SERVICE_ICONS.bulle]].map(([t, svg]) => `<label class="tile"><input type="checkbox" name="type" value="${esc(t)}"><span>${svg.replace('<svg', '<svg class="tile-ico"')}${esc(t)}</span></label>`).join('')}</div>
        </fieldset></div>
        <label class="field"><span>Votre message <small>(facultatif)</small></span><textarea name="message" rows="4"></textarea></label>
        <label class="consent"><input type="checkbox" name="consent" required><span>J'accepte que ces informations servent uniquement à répondre à ma demande. Elles ne sont ni enregistrées sur ce site, ni vendues. <button type="button" data-open="dlg-privacy">Politique de confidentialité</button></span></label>
        <p class="form-msg" role="status" aria-live="polite"></p>
        <div class="form-actions">
          <button class="btn" type="submit"><span class="btn-label"><span data-t="Envoyer ma demande">Envoyer ma demande</span></span><span class="btn-arrow">${I.arrow}${I.arrow}</span></button>
          <button class="alt-link" type="button" hidden></button>
        </div>
      </form>
    </div>
  </section>
</main>

<footer class="foot dark">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand"><a class="brand" href="#top">${logoSvg('brand-sym')}<span>${esc(cfg.nom)}</span></a><p>${esc(cfg.slogan)}</p></div>
      <div><h2 class="fh">Navigation</h2><ul>${nav.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
      <div><h2 class="fh">Contact</h2><ul><li><a href="#contact">${esc(cta.principal)}</a></li>${ct.telephone_affiche ? `<li><a href="${telHref}">${esc(ct.telephone_affiche)}</a></li>` : ''}${ct.email ? `<li><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></li>` : ''}${cfg.zone ? `<li>${esc(cfg.zone)}</li>` : ''}</ul>
        ${socials.length ? `<div class="socials" style="margin-top:16px">${socials.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${k}">${I[k] || I.chat}</a>`).join('')}</div>` : ''}</div>
      <div><h2 class="fh">Informations</h2><ul><li><button class="linkbtn" type="button" data-open="dlg-mentions">Mentions légales</button></li><li><button class="linkbtn" type="button" data-open="dlg-privacy">Confidentialité</button></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(holder)}${ent.bce ? ' · BCE ' + esc(ent.bce) : ''}</span><span>Site réalisé par ${credit.url ? `<a href="${esc(credit.url)}" target="_blank" rel="noopener">${esc(credit.nom)}</a>` : esc(credit.nom)}</span></div>
  </div>
</footer>

<nav class="tabbar" aria-label="Navigation mobile">
  <a href="#top">${I.home}Accueil</a>
  <a href="#services">${I.grid}Services</a>
  <a class="tab-main" href="#contact"><span class="disc">${I.chat}</span>${esc(cta.court)}</a>
  <a href="#infos">${I.clock}Infos</a>
  <button type="button" data-open="dlg-menu" aria-haspopup="dialog">${I.menu}Menu</button>
</nav>

<dialog class="sheet" id="dlg-menu" aria-label="Menu">
  <div class="grab"></div>
  <nav>${[...nav, ['#contact', cta.principal]].map(([h, l]) => `<a href="${h}">${esc(l)}${I.arrow}</a>`).join('')}</nav>
  <div class="sheet-foot"><button type="button" data-open="dlg-mentions">Mentions légales</button><button type="button" data-open="dlg-privacy">Confidentialité</button><button type="button" data-close>Fermer</button></div>
</dialog>
<dialog id="dlg-mentions" aria-labelledby="t-mentions"><div class="dlg-head"><h2 id="t-mentions">Mentions légales</h2><button class="x" type="button" data-close aria-label="Fermer">${I.x}</button></div><div class="dlg-body">${mentions}</div></dialog>
<dialog id="dlg-privacy" aria-labelledby="t-privacy"><div class="dlg-head"><h2 id="t-privacy">Politique de confidentialité</h2><button class="x" type="button" data-close aria-label="Fermer">${I.x}</button></div><div class="dlg-body">${privacy}</div></dialog>

<script type="application/json" id="cfg">${JSON.stringify(front).replace(/</g, '\\u003c')}</script>
<script src="app.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(dist, 'index.html'), html);

// ---------- Fichiers statiques ----------
fs.copyFileSync(path.join(src, 'styles.css'), path.join(dist, 'styles.css'));
fs.copyFileSync(path.join(src, 'app.js'), path.join(dist, 'app.js'));
for (const f of fs.readdirSync(path.join(src, 'fonts'))) if (f.endsWith('.woff2')) fs.copyFileSync(path.join(src, 'fonts', f), path.join(dist, 'fonts', f));
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logoVB}">${logoInner.replace(/<g class="piece"[^>]*>/g, '<g>')}</svg>`;
fs.writeFileSync(path.join(dist, 'icone.svg'), iconSvg);
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({ name: cfg.nom, short_name: cfg.nom_court || cfg.nom, description, lang: 'fr-BE', start_url: './', scope: './', display: 'standalone', background_color: N, theme_color: heroDark ? N : P,
  icons: [{ src: 'icone-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icone-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 2));
fs.writeFileSync(path.join(dist, 'sw.js'), `const V='site-${Date.now().toString(36)}';const CORE=['./','index.html','styles.css','app.js','fonts/jakarta-800.woff2','fonts/inter-400.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('index.html')));return}
e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res})))});\n`);
fs.writeFileSync(path.join(dist, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}` : '# Site de démonstration : non référencé.\nUser-agent: *\nAllow: /\n');
if (siteUrl) fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url></urlset>\n`);
fs.writeFileSync(path.join(dist, '404.html'), `<!doctype html><html lang="fr-BE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable · ${esc(cfg.nom)}</title><link rel="stylesheet" href="/styles.css"><style>:root{--paper:${P};--night:${N};--accent:${A};--on-accent:${onAccent}}body{min-height:100svh;display:grid;place-items:center;text-align:center;padding:24px}</style></head><body class="dark"><main><h1 class="h2" style="margin:0 auto">Cette page n'existe pas.</h1><p style="margin-top:28px">${btn("Retour à l'accueil", '/')}</p></main></body></html>`);
fs.writeFileSync(path.join(base, 'vercel.json'), JSON.stringify({ buildCommand: '', installCommand: '', outputDirectory: path.relative(base, dist) || '.', cleanUrls: true,
  headers: [{ source: '/(.*)', headers: [...(indexable ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]), { key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] },
    { source: '/fonts/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }, { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }] }, null, 2) + '\n');

// ---------- Icônes PNG et image de partage ----------
const { chromium } = require(require.resolve('playwright', { paths: [here, process.cwd(), '/opt/node-tools/node_modules'] }));
const browser = await chromium.launch();
const page = await browser.newPage();
const shot = async (htmlStr, w, h, file, transparent = false) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(htmlStr); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(dist, file), omitBackground: transparent });
};
const iconPage = (s) => `<body style="margin:0;width:${s}px;height:${s}px;display:grid;place-items:center;background:${cfg.logo && cfg.logo.fichier ? P : 'transparent'}"><img src="data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}" style="width:${cfg.logo && cfg.logo.fichier ? 76 : 100}%;height:auto"></body>`;
for (const s of [180, 192, 512]) await shot(iconPage(s), s, s, `icone-${s}.png`, !(cfg.logo && cfg.logo.fichier));
const fontCss = ['jakarta-800', 'inter-500'].map((f) => `@font-face{font-family:${f.startsWith('j') ? 'J' : 'I'};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(src, 'fonts', f + '.woff2')).toString('base64')})}`).join('');
await shot(`<html><head><style>${fontCss}body{margin:0;width:1200px;height:630px;background:${heroDark ? N : P};color:${heroDark ? P : N};display:grid;place-items:center;font-family:I}
.o{display:grid;justify-items:center;gap:26px;text-align:center;padding:0 80px}.o svg{height:150px;width:auto}.o p{font:800 60px/1.05 J;letter-spacing:-.045em;margin:0}.o p span{color:${heroDark ? accentLight : accentInk}}.o small{font-size:24px;opacity:.75}</style></head>
<body><div class="o">${logoSvg().replace('<svg', '<svg style="height:150px"')}<p>${sloganHtml}</p><small>${esc(cfg.nom)} · ${esc(cfg.metier)}</small></div></body></html>`, 1200, 630, 'og.png');
await browser.close();

console.log(`OK : ${path.relative(process.cwd(), dist) || dist} (${cfg.nom}${cfg.exemple ? ', exemple' : ''}, ${indexable ? 'référencé' : 'NON référencé'})`);
