// Génère le site vitrine du studio dans site/dist à partir de config/studio.json.
// Usage : node site/build.mjs   (ou npm run build, qui régénère aussi les logos)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { wordPath } from '../logo/mot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'site/src');
const dist = path.join(root, 'site/dist');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/studio.json'), 'utf8'));
const C = cfg.couleurs;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const indexable = !!(cfg.site && cfg.site.referencement);
const siteUrl = (cfg.site && cfg.site.url || '').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(dist, 'img'), { recursive: true });

// ---------- Mot du logo en tracés vectoriels ----------
const mot = wordPath(cfg.mot);
const [wx, wy, ww, wh] = mot.viewBox.split(' ').map(Number);
const wordRatio = ww / wh;

// ---------- Icônes (traits fins, SVG) ----------
const ic = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: ic('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.2"'),
  pin: ic('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  spark: ic('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  x: ic('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2"'),
  plus: ic('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2"'),
  home: ic('<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>'),
  grid: ic('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  folder: ic('<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
  menu: ic('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  chat: ic('<path d="M4.5 18.5 5.8 15A7.5 7.5 0 1 1 9 18.2z"/><path d="M9 11h6M9 14h3.5"/>'),
  info: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
  shield: ic('<path d="M12 3.5 19 6v6c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z"/><path d="m9 12 2 2 4-4"/>'),
  wallet: ic('<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><path d="M16 12.5h4.5M3.5 9.5h17"/>'),
  clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  file: ic('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5v4h4M10 12h5M10 15.5h5"/>'),
  logo: ic('<circle cx="9" cy="9" r="5"/><path d="M12.5 12.5h7v7h-7z"/>'),
  browser: ic('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18M6.5 6.8h.01M9 6.8h.01"/>'),
  target: ic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12h.01"/>'),
  phone: ic('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>'),
  question: ic('<circle cx="12" cy="12" r="8.5"/><path d="M9.8 9.5a2.3 2.3 0 0 1 4.4 1c0 1.5-2.2 2-2.2 3.2M12 16.5h.01"/>'),
  cross: ic('<path d="M7 7l10 10M17 7 7 17"/>', 'stroke-width="2.2"'),
  checkRound: ic('<path d="m6.5 12.5 3.5 3.5 7.5-8"/>', 'stroke-width="2.4"'),
  user: ic('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5"/>'),
  instagram: ic('<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2h.01"/>'),
  facebook: ic('<path d="M14.5 8H16V4.8h-2.2c-2.4 0-3.6 1.5-3.6 3.8V11H8v3h2.2v6.2h3.2V14h2.3l.5-3h-2.8V9c0-.6.4-1 1.1-1z"/>'),
  linkedin: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10.5V16M8 7.8h.01M11.5 16v-3.2c0-1.4.8-2.3 2-2.3s1.8.9 1.8 2.3V16M11.5 10.5V16"/>'),
};
// Icônes de services (animées au survol : chaque trait se redessine)
const svc = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const S = {
  logo: svc('<circle pathLength="1" cx="9.5" cy="9.5" r="5.5"/><path class="a" pathLength="1" d="M13 13h7.5v7.5H13z"/>'),
  site: svc('<rect pathLength="1" x="3" y="4.5" width="18" height="15" rx="2.5"/><path pathLength="1" d="M3 9h18"/><path class="a" pathLength="1" d="M7 13h6M7 16h4"/>'),
  landing: svc('<path pathLength="1" d="M6 3.5h12v17H6z"/><path class="a" pathLength="1" d="M9 8h6M9 11h4"/><path pathLength="1" d="M12 14v4M10 16.2l2 2 2-2"/>'),
  presence: svc('<path pathLength="1" d="M12 20.5s-6-5.2-6-10.2a6 6 0 0 1 12 0c0 5-6 10.2-6 10.2z"/><circle class="a" pathLength="1" cx="12" cy="10.3" r="2.2"/>'),
  suivi: svc('<path pathLength="1" d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path class="a" pathLength="1" d="M19.5 4.5v4h-4"/><path pathLength="1" d="m9 12 2 2 4-4"/>'),
};

// ---------- Boutons ----------
const btn = (label, href, { cls = '', attrs = '' } = {}) =>
  `<a class="btn ${cls}" href="${href}" ${attrs}><span class="btn-label"><span data-t="${esc(label)}">${esc(label)}</span></span><span class="btn-arrow">${I.arrow}${I.arrow}</span></a>`;
const ghost = (label, href) =>
  `<a class="btn ghost" href="${href}"><span class="btn-label"><span data-t="${esc(label)}">${esc(label)}</span></span></a>`;

// ---------- Monogramme NY ----------
let maskN = 0;
// Version animée (écran d'ouverture, haut de page) : le « vide » où le Y passe sur le N est un trait couleur du fond.
const symAnim = (cls = '', bd = '1.3s') => {
  const id = 'nyv-a' + ++maskN;
  return `<svg class="sym drawn ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-10" width="200" height="140"><rect x="-40" y="-10" width="200" height="140" fill="#fff"/><path class="d fr" pathLength="1" style="--d:.55s;--t:.75s" stroke="#000" stroke-width="22" d="M54 22 78 62"/></mask></defs>
  <g class="beat" style="--bd:${bd}">
  <g mask="url(#${id})"><path class="n d fl" pathLength="1" style="--d:.15s;--t:.9s" stroke-width="12" d="M18 98V22l48 76V40"/></g>
  <path class="y d fr" pathLength="1" style="--d:.55s;--t:.75s" stroke-width="12" d="M54 22 78 62"/>
  <path class="y d fr" pathLength="1" style="--d:.45s;--t:.85s" stroke-width="12" d="M102 22 78 62v36"/>
</g></svg>`;
};
// Version fixe (en-tête, pied de page) : vrai vide par masque, s'adapte à la couleur du texte.
const symStatic = () => {
  const id = 'nyv-m' + ++maskN;
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><path d="M54 22 78 62" stroke="#000" stroke-width="22" fill="none"/></mask></defs>
  <g fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="2" stroke-width="12"><path mask="url(#${id})" d="M18 98V22l48 76V40" stroke="currentColor"/><path d="M102 22 78 62v36M54 22 78 62" stroke="${C.accent}"/></g>`;
};
const wordG = (x, y, h) => { const s = h / wh; return `<g transform="translate(${x} ${y}) scale(${s.toFixed(4)}) translate(${-wx} ${-wy})"><path fill="currentColor" d="${mot.d}"/></g>`; };
const lockup = (label = cfg.nom) => {
  const h = 56, x = 126, W = x + (ww * h) / wh + 4 - 10;
  return `<svg viewBox="10 14 ${W.toFixed(1)} 92" role="img" aria-label="${esc(label)}">${symStatic()}${wordG(x, 60 - h / 2, h)}</svg>`;
};
const symOnly = (cls = '') => `<svg class="${cls}" viewBox="8 14 104 92" aria-hidden="true">${symStatic()}</svg>`;

// ---------- Contenus ----------
const sloganWords = cfg.slogan.trim().split(/\s+/);
const sloganHtml = esc(sloganWords.slice(0, -1).join(' ')) + ' <span class="accent">' + esc(sloganWords.at(-1)) + '</span>';

const services = [
  { ico: S.logo, t: 'Logo et identité visuelle', p: 'Un logo qui vous ressemble, pensé pour bouger : 2 ou 3 pistes à comparer, puis les couleurs, polices et fichiers prêts à l\u2019emploi.', tags: ['Logo', 'Charte', 'Cartes de visite'] },
  { ico: S.site, t: 'Sites vitrines', p: 'Un site rapide et animé qui présente votre activité, rassure vos clients et vous amène des demandes, sur ordinateur comme sur téléphone.', tags: ['Mobile d\u2019abord', 'Animations', 'Formulaire WhatsApp'] },
  { ico: S.landing, t: 'Landing pages', p: 'Une page unique et percutante pour une offre, un lancement ou une campagne, avec un seul objectif : être contacté.', tags: ['Lancement', 'Offre', 'Campagne'] },
  { ico: S.presence, t: 'Présence web', p: 'Votre fiche Google soignée et des visuels cohérents pour Instagram, Facebook et LinkedIn, aux couleurs de votre marque.', tags: ['Fiche Google', 'Visuels réseaux'] },
  { ico: S.suivi, t: 'Mise en ligne et suivi', p: 'Nom de domaine, mise en ligne, référencement local de base, puis les petites mises à jour quand votre activité évolue.', tags: ['Hébergement', 'Mises à jour', 'Référencement local'] },
];
const steps = [
  ['Brief', 'Un échange simple sur votre activité, vos clients, vos goûts et ce que vous attendez de votre image.'],
  ['Logo', 'Si vous n\u2019en avez pas, 2 ou 3 pistes à comparer. Vous choisissez, je décline : couleurs, polices, icônes.'],
  ['Démo à vos couleurs', 'Un vrai site, en ligne sur une adresse de démonstration, pour voir, tester et montrer avant de décider.'],
  ['Retouches', 'Vous demandez, j\u2019ajuste : textes, photos, couleurs, ordre des sections. Jusqu\u2019à ce que ce soit vous.'],
  ['Mise en ligne', 'Votre site part sur votre nom de domaine, prêt à être trouvé, partagé et installé sur un téléphone.'],
];
const plans = [
  { id: 'A', nom: 'Création', sub: 'Vente unique : tout est créé à votre nom.', prix: 'Sur devis', prixNote: 'Un prix fixe, annoncé avant de commencer.', best: false,
    items: ['Logo, site ou visuels selon votre projet', 'Hébergement et code à votre nom', 'Fichiers sources remis à la livraison', 'Modifications ultérieures facturées à l\u2019intervention'] },
  { id: 'B', nom: 'Création + suivi', sub: 'La création, puis je m\u2019occupe de tout le côté technique.', prix: 'Sur devis', prixNote: 'Création + abonnement mensuel.', best: true,
    items: ['Tout ce que comprend la formule Création', 'Hébergement et sécurité compris', 'Petites mises à jour comprises', 'Suivi technique : vous n\u2019avez rien à gérer', 'Vous restez propriétaire de votre nom de domaine, de vos textes et de vos photos'] },
];
const faq = [
  ['À qui appartient le site ?', 'À vous : votre nom de domaine, vos textes, vos photos et votre logo vous appartiennent, quelle que soit la formule. Avec la formule Création, tout est en plus créé directement à votre nom, hébergement compris. Avec la formule Création + suivi, je gère l\u2019hébergement et la technique pour vous.'],
  ['Puis-je le modifier moi-même ?', 'Le plus simple : vous m\u2019envoyez un message et je fais la modification. Les petites mises à jour sont comprises dans la formule Création + suivi. Si vous changez souvent certaines informations (horaires, prix, dates), un petit espace pour les modifier vous-même peut être ajouté en option.'],
  ['Que se passe-t-il si j\u2019arrête l\u2019abonnement ?', 'Votre nom de domaine, vos textes, vos photos et votre logo restent à vous. Les conditions de reprise du site (par exemple son transfert vers votre propre hébergement) sont écrites noir sur blanc dans le contrat, avant de commencer.'],
  ['Combien de temps faut-il pour créer un site ?', 'Cela dépend du projet : un logo, une landing page ou un site complet ne demandent pas le même travail, et vos retours comptent aussi. Après notre premier échange, je vous donne un délai précis, par écrit, avec le devis.'],
  ['Faut-il déjà avoir un logo ?', 'Non. Si vous en avez un, je le mets en valeur. Sinon, je vous propose 2 ou 3 pistes de logo avant de commencer le site, pour que tout soit cohérent.'],
  ['Avez-vous besoin de mes photos ?', 'Les vraies photos de votre travail, de votre lieu ou de votre équipe donnent les meilleurs résultats, et je les mets en valeur. Je n\u2019utilise que des images dont vous avez les droits. Sans photos, je travaille avec des illustrations et une mise en page soignée, jamais avec de fausses réalisations.'],
];
const projectTypes = [['Logo et identité', I.logo], ['Site vitrine', I.browser], ['Landing page', I.target], ['Visuels réseaux', I.phone], ['Fiche Google', I.pin], ['Je ne sais pas encore', I.question]];
const budgets = ['Moins de 1 000 €', '1 000 à 2 500 €', '2 500 à 5 000 €', 'Plus de 5 000 €', 'Je ne sais pas encore'];

const works = cfg.realisations.filter((w) => w.afficher);
for (const w of works) for (const k of ['ordi', 'mobile']) {
  const f = `${w.id}-${k}.jpg`;
  if (fs.existsSync(path.join(src, 'img/realisations', f))) fs.copyFileSync(path.join(src, 'img/realisations', f), path.join(dist, 'img', f));
}
const workCard = (w, i) => `
  <article class="work" data-reveal style="--rd:${i * 0.08}s">
    <div class="shots">
      <div class="browser"><div class="bar"><i></i><i></i><i></i></div><img src="img/${w.id}-ordi.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="Page d'accueil du site ${esc(w.nom)} sur ordinateur"></div>
      <div class="mob"><img src="img/${w.id}-mobile.jpg" width="390" height="844" loading="lazy" decoding="async" alt="Le site ${esc(w.nom)} sur téléphone"></div>
    </div>
    <div>
      <div class="tagline-row">${w.statut ? `<span class="tag">${esc(w.statut)}</span>` : ''}<span class="tag neutral">${esc(w.secteur)}</span></div>
      <h3>${esc(w.nom)}</h3>
      <dl><div><dt>Le besoin</dt><dd>${esc(w.besoin)}</dd></div><div><dt>Ce qui a été fait</dt><dd>${esc(w.fait)}</dd></div></dl>
      ${w.lien ? `<p style="margin-top:22px">${btn('Voir le site', esc(w.lien), { cls: 'sm dark-btn', attrs: 'target="_blank" rel="noopener"' })}</p>` : ''}
    </div>
  </article>`;

if (cfg.contact && cfg.contact.instagram && !(cfg.reseaux || {}).instagram) cfg.reseaux = { ...(cfg.reseaux || {}), instagram: 'https://www.instagram.com/' + cfg.contact.instagram.replace(/^@/, '') + '/' };
const socials = Object.entries(cfg.reseaux || {}).filter(([, v]) => v);
const ct = cfg.contact || {};
const ent = cfg.entreprise || {};
const pendingLegal = !ent.bce;

// ---------- Textes légaux ----------
const mentions = `
  <p><b>Éditeur du site :</b> ${esc(ent.responsable)}${cfg.nom ? `, sous le nom ${esc(cfg.nom)}` : ''}.</p>
  ${ent.adresse ? `<p><b>Adresse :</b> ${esc(ent.adresse)}</p>` : ''}
  ${ent.bce ? `<p><b>Numéro d'entreprise (BCE) :</b> ${esc(ent.bce)}</p>` : ''}
  ${ent.tva ? `<p><b>TVA :</b> ${esc(ent.tva)}</p>` : ''}
  ${ct.email ? `<p><b>Contact :</b> <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : ''}
  ${ct.telephone_affiche ? `<p><b>Téléphone :</b> ${esc(ct.telephone_affiche)}</p>` : ''}
  ${pendingLegal ? `<p>Activité en préparation. Les informations légales complètes (adresse, numéro d'entreprise, contact) seront publiées ici dès l'ouverture.</p>` : ''}
  <h3>Hébergement</h3>
  <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).</p>
  <h3>Propriété intellectuelle</h3>
  <p>Les textes, le logo et les visuels de ce site appartiennent à ${esc(cfg.nom)}. Les captures de réalisations montrent des projets personnels ou des projets présentés avec l'accord de leur propriétaire.</p>
  <p>Polices Plus Jakarta Sans et Inter, sous licence SIL Open Font License, hébergées sur ce site.</p>`;
const privacy = `
  <p><b>Responsable du traitement :</b> ${esc(ent.responsable)} (${esc(cfg.nom)})${ct.email ? `, <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}.</p>
  <h3>Aucun cookie, aucun suivi</h3>
  <p>Ce site n'utilise ni cookie, ni outil de mesure d'audience, ni publicité. Les polices sont hébergées sur le site lui-même : votre navigateur ne contacte aucun service tiers pour les afficher.</p>
  <h3>Le formulaire de contact</h3>
  <p>Le formulaire n'enregistre et n'envoie rien. Il prépare un message que vous envoyez vous-même, depuis Instagram, WhatsApp ou votre messagerie. Les informations que vous choisissez de nous envoyer (prénom, téléphone ou e-mail, type de projet, budget facultatif, message) servent uniquement à répondre à votre demande et, si vous le souhaitez, à établir un devis.</p>
  <ul><li>Base : votre consentement et les démarches avant un éventuel contrat.</li><li>Durée : le temps de traiter votre demande et de suivre le projet ; elles sont supprimées si aucune collaboration ne suit.</li><li>Vos données ne sont jamais vendues ni cédées.</li></ul>
  <p>Si vous utilisez Instagram ou WhatsApp, l'envoi passe par ces services et leurs propres conditions d'utilisation. Pour Instagram, le message est simplement copié dans votre téléphone ou votre ordinateur, puis collé par vous dans la conversation.</p>
  <h3>Hébergeur</h3>
  <p>L'hébergeur (Vercel) peut conserver des journaux techniques (adresse IP, date et page demandée) pour la sécurité et le bon fonctionnement du site.</p>
  <h3>Vos droits</h3>
  <p>Vous pouvez demander l'accès, la correction ou la suppression de vos données, ou vous opposer à leur utilisation, ${ct.email ? `en écrivant à <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : 'via le formulaire de contact'}. Vous pouvez aussi introduire une plainte auprès de l'Autorité de protection des données (rue de la Presse 35, 1000 Bruxelles, autoriteprotectiondonnees.be).</p>
  <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`;

// ---------- Page ----------
const title = `${cfg.nom} · Logo, site web et visuels · ${cfg.zone}`;
const description = `Studio de création visuelle basé à ${cfg.ville} : logo, identité visuelle, site web et visuels pour les réseaux sociaux, pour entrepreneurs, indépendants et startups.`;
const jsonld = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', name: cfg.nom, slogan: cfg.slogan, description,
  areaServed: [cfg.ville, 'Wallonie'], address: { '@type': 'PostalAddress', addressLocality: cfg.ville, addressCountry: 'BE' },
  knowsAbout: ['Création de site web', 'Création de logo', 'Identité visuelle', 'Visuels pour réseaux sociaux'],
  ...(siteUrl ? { url: siteUrl + '/', image: siteUrl + '/og.png', logo: siteUrl + '/icone-512.png' } : {}),
  ...(ct.telephone_affiche ? { telephone: ct.telephone_affiche } : {}),
  ...(ct.email ? { email: ct.email } : {}),
  ...(socials.length ? { sameAs: socials.map(([, v]) => v) } : {}),
};
const front = {
  nom: cfg.nom, instagram: (ct.instagram || '').replace(/^@/, ''), whatsapp: ct.whatsapp || '', email: ct.email || '',
  bientot: `Le formulaire s'activera très bientôt${cfg.ouverture && cfg.ouverture.bandeau ? ` (${cfg.ouverture.texte.toLowerCase()})` : ''}. Merci de votre patience !`,
};

const html = `<!doctype html>
<html lang="fr-BE" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${indexable ? '' : '<meta name="robots" content="noindex, nofollow">\n'}${siteUrl ? `<link rel="canonical" href="${siteUrl}/">\n` : ''}<meta name="theme-color" content="${C.nuit}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_BE">
<meta property="og:site_name" content="${esc(cfg.nom)}">
<meta property="og:title" content="${esc(cfg.nom)} · ${esc(cfg.slogan)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${siteUrl ? siteUrl + '/' : ''}og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="icone.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="fonts/jakarta-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<style>:root{--paper:${C.papier};--night:${C.nuit};--accent:${C.accent}}</style>
<script>(function(h){h.classList.remove('no-js');h.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('nyv-splash'))h.classList.add('splash-on')}catch(e){}})(document.documentElement)</script>
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>

<div class="splash" aria-hidden="true">
  <div class="sp-inner">
    <div class="sp-row">${symAnim('sp-sym')}<div class="sp-word" style="--ww:calc(var(--S) * ${(56 / 120 * wordRatio).toFixed(3)})"><svg viewBox="${mot.viewBox}"><path fill="currentColor" d="${mot.d}"/></svg></div></div>
    <p class="sp-slogan">${esc(cfg.slogan)}</p>
  </div>
  <button class="sp-skip" type="button" tabindex="-1">Passer</button>
</div>

<header class="top">
  <div class="wrap">
    <a class="brand" href="#top" aria-label="${esc(cfg.nom)}, retour en haut">${lockup()}</a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="#services">Services</a><a href="#essayer">Essayez</a><a href="#methode">Méthode</a><a href="#formules">Formules</a><a href="#realisations">Réalisations</a><a href="#faq">FAQ</a>
    </nav>
    ${btn('Parlons de votre projet', '#contact', { cls: 'sm top-cta dark-btn' })}
  </div>
</header>

<main id="contenu">
  <section class="hero dark" id="top" aria-labelledby="h1">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="wrap">
      <div>
        ${cfg.ouverture && cfg.ouverture.bandeau ? `<p class="pill enter" style="--d:.05s"><i aria-hidden="true"></i>${esc(cfg.ouverture.texte)}</p>` : `<p class="pill enter"><i aria-hidden="true"></i>Studio de création · ${esc(cfg.ville)}</p>`}
        <h1 class="h1" id="h1" data-words style="--d:.12s">${sloganHtml}</h1>
        <p class="lead enter" style="--d:.45s">${esc(cfg.presentation)}</p>
        <div class="hero-ctas enter" style="--d:.6s">${btn('Parlons de votre projet', '#contact')}${ghost('Voir les réalisations', '#realisations')}</div>
        <div class="hero-meta enter" style="--d:.75s"><span>${I.pin}${esc(cfg.zone)}</span><span>${I.phone}Pensé d'abord pour le téléphone</span><span>${I.shield}Sans cookie ni traceur</span></div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="glow"></div>
        ${symAnim('', '1.35s')}
        <span class="chip c1" style="--d:1.2s">${I.logo}Logo</span>
        <span class="chip c2" style="--d:1.35s">${I.browser}Site web</span>
        <span class="chip c3" style="--d:1.5s">${I.phone}Réseaux sociaux</span>
      </div>
    </div>
  </section>

  <section class="sec" id="essayer" aria-labelledby="t-essayer">
    <div class="wrap try">
      <div>
        <div class="sec-head" data-reveal>
          <p class="kicker">${I.spark.replace('<svg', '<svg width="16" height="16"')}Essayez vous-même</p>
          <h2 class="h2" id="t-essayer">Votre image, en direct.</h2>
          <p class="lead">Choisissez un métier, une couleur, un style : le mini-site se transforme sous vos yeux. Chaque projet est fait sur mesure, de la même façon.</p>
        </div>
        <form class="controls" data-reveal onsubmit="return false" aria-label="Personnaliser le mini-site d'exemple">
          <fieldset class="ctrl"><legend>Métier</legend><div class="opts">
            ${[['artisan', 'Artisan'], ['startup', 'Startup'], ['commerce', 'Commerce'], ['bienetre', 'Bien-être']].map(([v, l], i) => `<label class="opt"><input type="radio" name="metier" value="${v}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
          </div></fieldset>
          <fieldset class="ctrl"><legend>Couleur</legend><div class="opts swatches">
            ${[[C.accent, 'Orange', '#0B1324'], ['#2F5BEA', 'Bleu roi', '#fff'], ['#1E7A55', 'Vert sapin', '#fff'], ['#6D4AFF', 'Violet', '#fff'], ['#9B2242', 'Bordeaux', '#fff'], ['#E0A526', 'Or', '#0B1324']].map(([c, l, ink], i) => `<label class="opt" style="--c:${c}"><input type="radio" name="couleur" value="${c}" data-ink="${ink}" aria-label="${l}"${i === 0 ? ' checked' : ''}><span>${I.check.replace('<svg', '<svg style="color:' + ink + '"')}</span></label>`).join('')}
          </div></fieldset>
          <fieldset class="ctrl"><legend>Style de titre</legend><div class="opts">
            ${[['modern', 'Moderne'], ['elegant', 'Élégant'], ['bold', 'Affirmé']].map(([v, l], i) => `<label class="opt"><input type="radio" name="style" value="${v}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
          </div></fieldset>
          <fieldset class="ctrl"><legend>Fond</legend><div class="opts">
            ${[['clair', 'Clair'], ['sombre', 'Sombre']].map(([v, l], i) => `<label class="opt"><input type="radio" name="fond" value="${v}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
          </div></fieldset>
          <p class="try-note">${I.info}Entreprises imaginaires, pour jouer. Rien n'est enregistré.</p>
        </form>
      </div>
      <div data-reveal style="--rd:.1s">
        <div class="phone" role="img" aria-label="Aperçu d'un mini-site d'exemple qui change selon vos choix">
          <div class="screen"><div class="mini st-modern" aria-hidden="true">
            <div class="m-top"><div class="m-logo"><span class="m-mark" style="color:#0B1324"><svg viewBox="0 0 24 24" data-m="ico" style="color:inherit"></svg></span><span data-m="nom"></span></div><div class="m-burger"><i></i><i></i><i></i></div></div>
            <div class="m-hero"><span class="m-tag" data-m="tag"></span><p class="m-title" data-m="titre"></p><p class="m-sub" data-m="sub"></p><span class="m-btn" style="color:#0B1324"><span data-m="cta"></span><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></b></span></div>
            <div class="m-visual"><i></i><i></i><i></i></div>
            <div class="m-list">${[0, 1, 2].map(() => `<div class="m-item" data-m="item"><i></i><span><b></b><small></small></span></div>`).join('')}</div>
            <div class="m-tabs"><i></i><i></i><b></b><i></i><i></i></div>
          </div></div>
        </div>
        <span class="try-label">Un aperçu de ce que je construis : rapide, animé, pensé pour le téléphone.</span>
      </div>
    </div>
  </section>

  <section class="sec" id="services" aria-labelledby="t-services" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <p class="kicker">Services</p>
        <h2 class="h2" id="t-services">Tout ce qui fait votre image.</h2>
        <p class="lead">Un studio de création ${esc(cfg.zone.charAt(0).toLowerCase() + cfg.zone.slice(1))} : logo, site web et visuels. Une seule personne, une seule ligne graphique, du premier croquis à la mise en ligne.</p>
      </div>
      <div class="cards">
        ${services.map((s, i) => `<article class="card" data-reveal style="--rd:${(i % 3) * 0.08}s"><span class="num">0${i + 1}</span><div class="ico">${s.ico}</div><h3>${s.t}</h3><p>${s.p}</p><ul>${s.tags.map((t) => `<li>${t}</li>`).join('')}</ul></article>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec dark" id="methode" aria-labelledby="t-methode">
    <div class="wrap method">
      <div class="sec-head" data-reveal>
        <p class="kicker">Méthode</p>
        <h2 class="h2" id="t-methode">Cinq étapes, zéro surprise.</h2>
        <p class="lead">Vous voyez votre site en vrai avant de vous engager pour la mise en ligne. Et vous savez toujours où on en est.</p>
        <p style="margin-top:30px">${btn('Commencer par le brief', '#contact')}</p>
      </div>
      <ol class="steps">
        <li class="track" aria-hidden="true"><svg viewBox="0 0 4 100" preserveAspectRatio="none"><path class="bg" d="M2 0V100" vector-effect="non-scaling-stroke"/><path class="fg" pathLength="1" d="M2 0V100" vector-effect="non-scaling-stroke"/></svg></li>
        ${steps.map(([t, p], i) => `<li class="step" data-reveal><span class="dot">${i + 1}</span><h3>${t}</h3><p>${p}</p></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="sec" id="pourquoi" aria-labelledby="t-pourquoi">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <p class="kicker">Pourquoi ${esc(cfg.nom)}</p>
        <h2 class="h2" id="t-pourquoi">Tout au même endroit, et cohérent.</h2>
      </div>
      <div class="compare">
        <div class="cmp cmp-sans" data-reveal>
          <h3>Sans ligne directrice</h3>
          <ul>${['Un prestataire pour le logo, un autre pour le site', 'Des visuels différents sur chaque réseau', 'Un site pensé pour l’ordinateur, difficile sur téléphone', 'Les mentions légales oubliées', 'On découvre le résultat à la fin'].map((t) => `<li>${I.cross}<span>${t}</span></li>`).join('')}</ul>
        </div>
        <div class="cmp cmp-avec" data-reveal style="--rd:.1s">
          <span class="cmp-badge">${symOnly()}Avec ${esc(cfg.nom)}</span>
          <ul>${['Une seule personne pour le logo, le site et les visuels', 'Une même ligne graphique partout', 'Un site pensé d’abord pour le téléphone', 'Mentions légales et confidentialité prévues', 'Une démo à vos couleurs avant de décider'].map((t) => `<li>${I.checkRound}<span>${t}</span></li>`).join('')}</ul>
          <p style="margin-top:24px">${btn('Parlons de votre projet', '#contact')}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="formules" aria-labelledby="t-formules">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <p class="kicker">Formules</p>
        <h2 class="h2" id="t-formules">Deux façons de travailler ensemble.</h2>
        <p class="lead">Chaque projet est différent : je vous fais un devis clair, après un premier échange.</p>
      </div>
      <div class="plans">
        ${plans.map((p, i) => `<article class="plan${p.best ? ' best' : ''}" data-reveal style="--rd:${i * 0.1}s">${p.best ? '<span class="badge">La plus sereine</span>' : ''}
          <div><p class="kicker">Formule ${p.id}</p><h3 style="margin-top:10px">${p.nom}</h3><p class="sub" style="margin-top:8px">${p.sub}</p></div>
          <p class="price">${p.prix}<small>${p.prixNote}</small></p>
          <ul>${p.items.map((t) => `<li>${I.check}<span>${t}</span></li>`).join('')}</ul>
          ${btn(p.best ? 'Choisir Création + suivi' : 'Choisir Création', '#contact', { cls: p.best ? '' : 'dark-btn', attrs: `data-formule="${p.id} · ${p.nom}"` })}
        </article>`).join('')}
      </div>
      <div class="incl" data-reveal>
        <h3 class="incl-title">Ce qui est inclus</h3>
        <div class="incl-grid">${[[I.logo, 'Fichiers du logo', 'SVG et PNG, versions claire et foncée.'], [I.phone, 'Pensé pour le téléphone', 'Testé sur un écran de 390 px.'], [I.spark, 'Écran d’ouverture animé', 'Votre logo qui se construit, une fois par visite.'], [I.chat, 'Contact direct', 'Message prêt dans WhatsApp, e-mail en secours.'], [I.file, 'Mentions légales prévues', 'Et une politique de confidentialité à votre nom.'], [I.shield, 'Sans cookie ni traceur', 'Pas de bandeau cookies à imposer.']].map(([ic, t, d]) => `<div class="incl-card"><span class="incl-ico">${ic}</span><b>${t}</b><span>${d}</span></div>`).join('')}</div>
      </div>
    </div>
  </section>

  <section class="sec" id="realisations" aria-labelledby="t-realisations" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <p class="kicker">Réalisations</p>
        <h2 class="h2" id="t-realisations">Du vrai, rien que du vrai.</h2>
        <p class="lead">Uniquement des projets réels, avec leurs vraies captures d'écran.</p>
      </div>
      <div class="works">
        ${works.map(workCard).join('')}
        <p class="honest" data-reveal>${I.info}<span>D'autres projets arrivent. Je ne montre que des réalisations réelles, avec l'accord de leur propriétaire : pas de faux projets, pas de faux avis, pas de faux compteurs.</span></p>
      </div>
    </div>
  </section>

  ${cfg.partenaire && cfg.partenaire.afficher ? `<section class="sec" id="pilotia" aria-labelledby="t-pilotia" style="padding-top:0">
    <div class="wrap">
      <div class="duo" data-reveal>
        <div class="duo-art"><svg class="rings" viewBox="0 0 600 420" role="img" aria-label="${esc(cfg.partenaire.nom)} accompagne, ${esc(cfg.nom)} crée : stratégie et création">
          <circle class="r r1" cx="220" cy="210" r="150" pathLength="1" transform="rotate(-90 220 210)"/>
          <circle class="r r2" cx="380" cy="210" r="150" pathLength="1" transform="rotate(-90 380 210)"/>
          <g class="late"><path class="arc-gap" d="M258.8 65.1A150 150 0 0 1 334.9 113.6"/><path class="arc" d="M258.8 65.1A150 150 0 0 1 334.9 113.6"/></g>
          <g class="late txt"><text x="150" y="200" class="rn">${esc(cfg.partenaire.nom)}</text><text x="150" y="234" class="rs">accompagne</text>
          <text x="450" y="200" class="rn">Nayas</text><text x="450" y="234" class="rs">crée</text></g>
          <g class="late tag"><rect x="165" y="298" width="270" height="52" rx="26"/><circle cx="194" cy="324" r="7"/><text x="212" y="330">Stratégie + création</text></g>
        </svg><div class="duo-logos"><span class="duo-ny">${lockup()}</span><span class="duo-x" aria-hidden="true">×</span><a href="${esc(cfg.partenaire.lien)}" target="_blank" rel="noopener" aria-label="${esc(cfg.partenaire.nom)}"><img src="img/${cfg.partenaire.logo}" alt="${esc(cfg.partenaire.nom)}" width="1668" height="364"></a></div></div>
        <div>
          <p class="kicker">Collaboration</p>
          <h2 class="h2" id="t-pilotia">${esc(cfg.nom)} × ${esc(cfg.partenaire.nom)}</h2>
          <p class="lead"><a class="duo-link" href="${esc(cfg.partenaire.lien)}" target="_blank" rel="noopener">${esc(cfg.partenaire.nom)}</a> accompagne les indépendants et les petites entreprises (${esc(cfg.partenaire.role.replace(/^[^:]*:\s*/, '').replace(/\.$/, ''))}). <strong>${esc(cfg.nom)}</strong> crée leur image : logo, site, visuels. Chacun apporte son expertise pour un résultat de qualité, de la stratégie aux visuels.</p>
          <p style="margin-top:28px">${btn('Découvrir ' + cfg.partenaire.nom, esc(cfg.partenaire.lien), { attrs: 'target="_blank" rel="noopener"' })}</p>
        </div>
      </div>
    </div>
  </section>` : ''}

  <section class="sec dark" id="apropos" aria-labelledby="t-apropos">
    <div class="wrap about">
      <figure class="portrait" data-reveal><span class="ring"></span><span class="ring"></span>${symOnly('sym')}<figcaption><span>${esc(cfg.nom)}</span><span>${esc(cfg.zone)}</span></figcaption></figure>
      <div data-reveal style="--rd:.1s">
        <p class="kicker">À propos</p>
        <h2 class="h2" id="t-apropos">Le design, avec les pieds sur terre.</h2>
        <div class="body">
          <p>Je suis ${esc(ent.responsable)}, <strong>comptable de métier</strong>. J'ai travaillé en fiduciaire au service d'entrepreneurs et d'indépendants, je travaille aujourd'hui dans le payroll, et j'ai aussi une expérience d'agent immobilier.</p>
          <p>Résultat : je comprends vos contraintes, <strong>pas seulement le design</strong>. Un budget à tenir, des délais à respecter, de l'administratif à ne pas oublier. Je crée une image qui vous ressemble et qui travaille pour votre activité.</p>
        </div>
        <div class="facts">
          <div class="fact">${I.wallet}<b>Budget</b><span>Un devis clair, sans mauvaise surprise.</span></div>
          <div class="fact">${I.clock}<b>Délais</b><span>Un calendrier annoncé et tenu.</span></div>
          <div class="fact">${I.file}<b>Administratif</b><span>Mentions légales et RGPD prévus.</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="faq" aria-labelledby="t-faq">
    <div class="wrap">
      <div class="sec-head" data-reveal><p class="kicker">Questions fréquentes</p><h2 class="h2" id="t-faq">Les bonnes questions.</h2></div>
      <div class="faq">${faq.map(([q, a], i) => `<details data-reveal style="--rd:${i * 0.04}s"><summary>${q}<span class="pm" aria-hidden="true">${I.plus}</span></summary><p class="ans">${a}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="sec" id="contact" aria-labelledby="t-contact" style="padding-top:0">
    <div class="wrap contact">
      <div data-reveal>
        <p class="kicker">Contact</p>
        <h2 class="h2" id="t-contact">Parlons de votre projet.</h2>
        <p class="lead">Quelques mots suffisent. Votre message est préparé pour vous, puis ${ct.instagram ? 'ma messagerie Instagram s\u2019ouvre' : ct.whatsapp ? 'WhatsApp s\u2019ouvre' : 'votre messagerie s\u2019ouvre'} : il ne reste qu'à l'envoyer.</p>
        <ul class="reassure">
          <li>${I.chat}<span>Réponse personnelle, par la personne qui fera votre projet.</span></li>
          <li>${I.shield}<span>Rien n'est enregistré sur ce site.</span></li>
          <li>${I.pin}<span>${esc(cfg.zone)}.</span></li>
        </ul>
      </div>
      <form class="form" id="contact-form" novalidate data-reveal style="--rd:.1s">
        <input type="hidden" name="formule" value="">
        <p class="grp">${I.user}Vos coordonnées</p>
        <div class="f2">
          <label class="field"><span>Prénom</span><input type="text" name="prenom" autocomplete="given-name" required></label>
          <label class="field"><span>Téléphone ou e-mail</span><input type="text" name="joindre" autocomplete="email" inputmode="email" required></label>
        </div>
        <p class="grp">${I.spark}Votre projet</p>
        <div class="field"><fieldset><legend>Type de projet <small>(plusieurs choix possibles)</small></legend>
          <div class="tiles">${projectTypes.map(([t, svg]) => `<label class="tile"><input type="checkbox" name="type" value="${t}"><span>${svg}${t}</span></label>`).join('')}</div>
        </fieldset></div>
        <label class="field"><span>Budget approximatif <small>(facultatif)</small></span><select name="budget"><option value="">Choisir…</option>${budgets.map((b) => `<option>${b}</option>`).join('')}</select></label>
        <label class="field"><span>Votre message <small>(facultatif)</small></span><textarea name="message" rows="4" placeholder="Votre activité, ce que vous aimeriez, un site que vous aimez…"></textarea></label>
        <label class="consent"><input type="checkbox" name="consent" required><span>J'accepte que ces informations servent uniquement à répondre à ma demande. Elles ne sont ni enregistrées sur ce site, ni vendues. <button type="button" data-open="dlg-privacy">Politique de confidentialité</button></span></label>
        <p class="form-msg" role="status" aria-live="polite"></p>
        <div class="form-actions">
          <button class="btn" type="submit"><span class="btn-label"><span data-t="Envoyer mon message">Envoyer mon message</span></span><span class="btn-arrow">${I.arrow}${I.arrow}</span></button>
          <button class="alt-link" type="button" hidden></button>
        </div>
      </form>
    </div>
  </section>
</main>

<footer class="foot dark">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">${lockup()}<p>${esc(cfg.slogan)}</p></div>
      <div><h2 class="fh">Le studio</h2><ul><li><a href="#services">Services</a></li><li><a href="#methode">Méthode</a></li><li><a href="#formules">Formules</a></li><li><a href="#realisations">Réalisations</a></li><li><a href="#apropos">À propos</a></li></ul></div>
      <div><h2 class="fh">Contact</h2><ul><li><a href="#contact">Parlons de votre projet</a></li><li>${esc(cfg.zone)}</li>${cfg.ouverture && cfg.ouverture.bandeau ? `<li>${esc(cfg.ouverture.texte)}</li>` : ''}${ct.email ? `<li><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></li>` : ''}</ul>
        ${socials.length ? `<div class="socials" style="margin-top:16px">${socials.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${k}">${I[k] || I.spark}</a>`).join('')}</div>` : ''}</div>
      <div><h2 class="fh">Informations</h2><ul><li><button class="linkbtn" type="button" data-open="dlg-mentions">Mentions légales</button></li><li><button class="linkbtn" type="button" data-open="dlg-privacy">Confidentialité</button></li><li><a href="#faq">Questions fréquentes</a></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(cfg.nom)} · Sans cookie ni traceur</span><span class="made">${symOnly()}Site réalisé par ${esc(cfg.nom)}</span></div>
  </div>
</footer>

<nav class="tabbar" aria-label="Navigation mobile">
  <a href="#top">${I.home}Accueil</a>
  <a href="#services">${I.grid}Services</a>
  <a class="tab-main" href="#contact"><span class="disc">${I.chat}</span>Projet</a>
  <a href="#realisations">${I.folder}Réalisations</a>
  <button type="button" data-open="dlg-menu" aria-haspopup="dialog">${I.menu}Menu</button>
</nav>

<dialog class="sheet" id="dlg-menu" aria-label="Menu">
  <div class="grab"></div>
  <nav>
    ${[['#essayer', 'Essayez vous-même'], ['#services', 'Services'], ['#methode', 'Méthode'], ['#formules', 'Formules'], ['#realisations', 'Réalisations'], ['#apropos', 'À propos'], ['#faq', 'Questions fréquentes'], ['#contact', 'Parlons de votre projet']].map(([h, l]) => `<a href="${h}">${l}${I.arrow}</a>`).join('')}
  </nav>
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
const fonts = {
  'jakarta-700.woff2': '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2',
  'jakarta-800.woff2': '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2',
  'inter-400.woff2': '@fontsource/inter/files/inter-latin-400-normal.woff2',
  'inter-500.woff2': '@fontsource/inter/files/inter-latin-500-normal.woff2',
  'inter-600.woff2': '@fontsource/inter/files/inter-latin-600-normal.woff2',
};
for (const [to, from] of Object.entries(fonts)) fs.copyFileSync(path.join(root, 'node_modules', from), path.join(dist, 'fonts', to));
const fin = path.join(root, 'logo/final');
if (cfg.partenaire && cfg.partenaire.afficher) fs.copyFileSync(path.join(src, 'img', cfg.partenaire.logo), path.join(dist, 'img', cfg.partenaire.logo));
fs.copyFileSync(path.join(fin, 'favicon.ico'), path.join(dist, 'favicon.ico'));
fs.copyFileSync(path.join(fin, 'icone-carree.svg'), path.join(dist, 'icone.svg'));
fs.copyFileSync(path.join(fin, 'png/icone-180.png'), path.join(dist, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(fin, 'png/icone-192.png'), path.join(dist, 'icone-192.png'));
fs.copyFileSync(path.join(fin, 'png/icone-512.png'), path.join(dist, 'icone-512.png'));

fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
  name: cfg.nom, short_name: cfg.nom, description, lang: 'fr-BE', start_url: './', scope: './', display: 'standalone',
  background_color: C.nuit, theme_color: C.nuit,
  icons: [{ src: 'icone-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icone-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2));

const version = Date.now().toString(36);
fs.writeFileSync(path.join(dist, 'sw.js'), `// Hors ligne de base : pages réseau d'abord, fichiers statiques en cache.
const V='nyv-${version}';
const CORE=['./','index.html','styles.css','app.js','fonts/jakarta-800.woff2','fonts/inter-400.woff2','icone-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('index.html')));return}
e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res})))});
`);

fs.writeFileSync(path.join(dist, 'robots.txt'), indexable
  ? `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`
  : `# Site en préparation : non référencé (balise noindex sur chaque page).\nUser-agent: *\nAllow: /\n`);
if (siteUrl) fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`);

fs.writeFileSync(path.join(dist, '404.html'), `<!doctype html><html lang="fr-BE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable · ${esc(cfg.nom)}</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/styles.css"><style>:root{--paper:${C.papier};--night:${C.nuit};--accent:${C.accent}}body{min-height:100svh;display:grid;place-items:center;text-align:center;padding:24px}</style></head><body class="dark"><main><a href="/" aria-label="${esc(cfg.nom)}" style="display:inline-block;color:var(--paper)">${lockup().replace('<svg', '<svg style="height:40px;width:auto"')}</a><h1 class="h2" style="margin:28px auto 0">Cette page n'existe pas.</h1><p style="margin-top:28px">${btn("Retour à l'accueil", '/')}</p></main></body></html>`);

// ---------- Réglages Vercel (référencement selon config) ----------
fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify({
  buildCommand: '', installCommand: '', outputDirectory: 'site/dist', cleanUrls: true,
  headers: [
    { source: '/(.*)', headers: [
      ...(indexable ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] },
    { source: '/fonts/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
  ],
}, null, 2) + '\n');

// ---------- Image de partage (logo figé + slogan) ----------
const ogHtml = `<html><head><style>${fs.readFileSync(path.join(src, 'styles.css'), 'utf8').replace(/url\(fonts\//g, 'url(file://' + path.join(dist, 'fonts') + '/')}
:root{--paper:${C.papier};--night:${C.nuit};--accent:${C.accent}}
body{margin:0;width:1200px;height:630px;background:var(--night);color:var(--paper);display:grid;place-items:center;overflow:hidden;padding:0}
.og{display:grid;justify-items:center;gap:34px;position:relative}
.og svg{height:150px;width:auto}
.og p{font:800 64px/1 var(--display);letter-spacing:-.045em}
.og small{font:500 24px/1 var(--text);color:var(--muted-d)}
.bg{position:absolute;inset:0;background-image:linear-gradient(var(--line-d) 1px,transparent 1px),linear-gradient(90deg,var(--line-d) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 60% 70% at 50% 50%,#000,transparent 75%);opacity:.7}
</style></head><body><div class="bg"></div><div class="og">${lockup()}<p>${sloganHtml}</p><small>Logo · Site web · Visuels · ${esc(cfg.zone)}</small></div></body></html>`;
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
fs.writeFileSync(path.join(dist, '_og.html'), ogHtml);
await page.goto('file://' + path.join(dist, '_og.html'));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(dist, 'og.png') });
await browser.close();
fs.rmSync(path.join(dist, '_og.html'));

console.log(`OK : site/dist (${works.length} réalisation(s) affichée(s), ${indexable ? 'référencé' : 'NON référencé'})`);
