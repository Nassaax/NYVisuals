# Nayas Visuals, le studio de création de Nasser — instructions pour Claude

## Qui, quoi
- **Nasser**, comptable de métier, lance une activité de **création web pour entrepreneurs, indépendants et startups** : sites vitrines, landing pages, « présence web » complète (site + fiche Google + visuels réseaux sociaux), logo et identité visuelle.
- Zone : Liège et la Wallonie, puis toute la Belgique francophone.
- Références réalisées (style à reproduire) : **Jumeo** (apporteur d'affaires énergie et rénovation), **démo Lux Energie Solution** (site Jumeo décliné aux couleurs d'un client, avec page Formations), **Pilotia** (accompagnement d'indépendants et PME, site de plus de 40 pages avec outils de calcul) et **Lallat** (plateforme belge de location de tenues marocaines, lallat.be).

## Comment me parler
- Tutoiement, français simple, **sans jargon**. Nasser **ne touche jamais au code** : je fais toutes les manipulations.
- Questions **regroupées**, avec des choix à cocher et **ma recommandation** en premier.
- Avant chaque enregistrement sur GitHub : dire **en une phrase** ce qui change.

## Nom du studio
- **Nom définitif : Nayas Visuals** (confirmé par Nasser le 19/11/2026). « Nayas » = **Na**sser + **Yas**ini : personnel, jeune, servira aussi pour la photo de sport et au quotidien. Instagram : **@nayas.visuals** (contact principal du site).
- Le nom est écrit **à un seul endroit**, `config/studio.json` (`nom`, `mot` = mot du logo, `sigle` NV). Tout le reste (logo, charte, site, kit, documents) le lit de là : `npm run build` régénère tout.
- Adresses libres le 19/11/2026 (non achetées) : `nayasvisuals.be`, `nayasvisuals.com`, `nayas.be`, `nayas.studio`. À acheter à l'ouverture de l'activité, avec l'accord de Nasser.
- Vérification de marque : rien trouvé sur le web le 19/11/2026 ; registres BOIP (marques Benelux) et BCE non accessibles depuis la session, à vérifier par Nasser ou son comptable.
- Historique : nom provisoire NY Visuals abandonné (pseudo @nyvisuals pris sur Instagram). Pistes écartées : Nasr, Yasini, nayas.prod.

## Logo du studio
- Monogramme **« NY »** (les initiales de Nasser, et le N et le Y de « NaYas ») qui **se construit en animation** à l'ouverture du site (le N et le Y se tracent et se croisent, comme les anneaux de Jumeo), suivi du nom « Nayas Visuals ». Le symbole NY doit survivre à un changement de nom : seul le mot change.
- **Choix validé le 19/11/2026 : piste B « Entrelacs »** (N bleu nuit, Y orange signal #FF5B2E qui passe par-dessus la jambe du N), accent orange signal. Fichiers dans `logo/final/`, mini-charte dans `logo/charte/` (HTML + PDF). Tout se régénère avec `node logo/build.mjs`.
- Toujours **2 ou 3 pistes** comparées avant le choix.
- Pour la piste choisie : version claire, version foncée, icône carrée (favicon, photo de profil), SVG + PNG transparents, mini-charte (couleurs, polices, règles d'usage).
- **Photos de profil rondes** (Instagram) : `logo/profil.mjs` → `logo/final/profil/` (A anneau dégradé, B viseur, C éclat) + `apercu-instagram.png`. Couleurs d'appoint autorisées autour du cercle : ambre #FFB23E, rose #FF3D7F.

## Direction artistique (signature du studio)
1. **Écran d'ouverture animé**, une fois par visite : le logo du client se construit (formes qui arrivent chacune d'un côté en se dessinant, se rejoignent, petit battement), puis nom + accroche courte. ~2,5–3 s, clic pour passer, retrait auto après 4 s. **Jamais** si `prefers-reduced-motion`, **jamais** sans JavaScript. Le contenu entre en scène juste après. Logo et nom en **SVG vectoriel** (net avant le chargement des polices), animations en **CSS pur**.
2. **Motion design au service du contenu** : titres qui montent mot par mot, apparitions au défilement, un **dessin « signature » qui se trace au défilement**, boutons au texte qui roule + flèche dans une pastille, cartes qui se soulèvent. Courbe `cubic-bezier(.16,1,.3,1)`, durées courtes. Rien qui clignote.
3. **Look** : titres en grande typo serrée (Plus Jakarta Sans), texte courant Inter, beaucoup d'air, grille nette, **une seule couleur d'accent par client** (boutons, détails), fonds calmes (papier clair ou bleu nuit). Icônes SVG fines, **jamais d'emoji**.
4. **Mobile = une application** : barre d'onglets en bas avec bouton central mis en avant (ex. « Devis »), panneau « Menu » qui monte du bas, barre du haut fine, site installable (PWA). Conçu d'abord pour **390 px**.
5. **Pas de faux** : pas de photo de banque d'images présentée comme réalisation, pas de faux avis, pas de faux compteur. Vraies photos du client mises en valeur.

Skills : `motionsites-web-builder` pour design et mouvement ; `logo-design` pour les logos s'il est installé (sinon, logo dessiné à la main en SVG).

## Technique (recette Jumeo)
- HTML, CSS, JavaScript simples, pas de framework lourd ; petit script de génération quand il y a beaucoup de pages (communes, articles, simulateurs).
- **Un dépôt GitHub privé par client**, en ligne sur Vercel (ou hébergeur du client). Adresse de démo en **`noindex`** tant que le client n'a pas validé.
- Formulaires **sans serveur** : la demande s'ouvre dans le **WhatsApp** du client, e-mail en secours. Options payantes plus tard : réception par e-mail, tableau des demandes, mini-espace client (dates, prix).
- SEO local : titres et descriptions soignés, JSON-LD `LocalBusiness` (sans faux avis), `sitemap.xml`, image de partage, pages par zone si utile.
- **Aucun cookie ni traceur** par défaut (donc pas de bandeau cookies).

## Déroulé d'un client
1. **Brief** (questionnaire : activité, services, zone, coordonnées publiques, logo, couleurs, photos, concurrents aimés, objectif du site).
2. **Logo** si besoin : 2–3 pistes, choix avec le client.
3. **Démo** complète à ses couleurs sur une adresse de démonstration.
4. **Retouches**.
5. **Mise en ligne** :
   - **A. Vente unique** : tout au nom du client (son GitHub, son hébergement), Nasser ajouté comme collaborateur ; modifications facturées à l'intervention.
   - **B. Création + abonnement mensuel** (préférée) : Nasser garde la gestion technique, hébergement et petites mises à jour compris ; le client reste propriétaire de son domaine, ses textes, ses photos.
6. **Remise** : fiche simple (comment demander une modification, ce qui est compris).

## Règles non négociables
- **Mentions légales** sur chaque site : nom, adresse, numéro BCE, contact, TVA si assujetti. Vérifier la liste à jour sur une source officielle belge avant mise en ligne.
- **RGPD** : case de consentement sur chaque formulaire, finalité claire, données jamais vendues ; politique de confidentialité **au nom du client** (responsable du traitement).
- **Droits** : uniquement photos, logos, textes dont le client a les droits ; sinon illustrations ou rien.
- **Aucun agrément, label ou logo officiel** sans preuve du client. Aucune promesse de résultat.
- **Contrats** : brouillons possibles, mais **toujours rappeler** de les faire relire par un juriste ou un comptable. Pas de conseil fiscal ou juridique définitif.
- **Ne jamais inventer de chiffres** (années d'expérience, nombre de clients, prix du marché).

## Qualité avant chaque livraison
- Test dans un vrai navigateur (Playwright) : ordinateur + mobile 390 px, **zéro erreur console**, aucun défilement horizontal, liens et formulaires OK.
- Captures (ordinateur, mobile, écran d'ouverture image par image) envoyées à Nasser pour validation.
- Accessibilité : contraste suffisant, focus visible, textes alternatifs, animations réduites respectées.

## Organisation de ce dépôt
- `config/studio.json` : nom du studio, accroche, couleurs (source unique).
- `logo/` : pistes de logo, générateur, fichiers finaux.
- `kit/` : **kit de départ** des sites clients (voir `kit/README.md`). `kit/modele/` = gabarit (une fiche `client.json` → site complet + tests), `kit/nouveau-site.mjs` = crée le site d'un client dans le clone de son dépôt, `kit/exemple/` = entreprise imaginaire pour vérifier le kit (`npm run kit:exemple`, `npm run kit:test`).
- `documents/` : procédure client, questionnaire de démarrage, modèle de liste de choses à faire ; `node documents/build.mjs` → PDF dans `documents/pdf/`. À venir : offres A et B, fiche de remise (brouillons à faire relire).
- `clients/<nom>/` : `fiche.md` (brief, choix, retouches) et `todo.md` de chaque client.

## Vidéos
- `video/lancement/` : **vidéo de lancement** (Remotion, verticale 21 s, sans son : musique à ajouter dans Instagram). Vidéos libres de droits fournies par Nasser (Pexels), découpées par `preparer-clips.mjs`, non enregistrées dans le dépôt. Les vidéos de banque d'images servent d'ambiance, jamais présentées comme des réalisations ; les réalisations montrées sont les vraies captures.

## Lancer un nouveau client (phrase clé)
- **« Nouveau client : [nom] »** (ou `/nouveau-client [nom]`) lance la procédure : suivre `.claude/skills/nouveau-client/SKILL.md` et `documents/procedure-client.md`.
- **« Client [nom] : on continue »** reprend un client existant : relire sa `fiche.md` et sa `todo.md`, résumer où on en est, proposer la suite.
- Nasser peut donner les infos en vrac (texte, réponses du client, fichiers) : je range, je repère ce qui manque et je pose les questions une seule fois.

## Site du studio (`site/`)
- **Adresse provisoire** : https://nayasvisuals.vercel.app (l'ancienne nyvisuals.vercel.app marche aussi). Projet Vercel `nyvisuals`, mis à jour automatiquement à chaque enregistrement sur GitHub (branche `main`).
- **Contact** : les prospects écrivent sur la **messagerie Instagram** de Nasser (`contact.instagram`, pseudo sans @) : le formulaire copie le message puis ouvre la conversation (ig.me). WhatsApp et e-mail restent possibles en secours. Le site dit « **Basé à Liège** », sans insister sur la ville ailleurs.
- **Positionnement** : Nayas Visuals vend une image complète (logo, identité, site, visuels réseaux), pas seulement des sites. Slogan : **« Des visuels qui marquent. »** (choisi le 19/11/2026). Un seul appel à l'action principal : « Parlons de votre projet ».
- **Fichiers** : `site/build.mjs` (page HTML et textes), `site/src/styles.css`, `site/src/app.js`, `site/src/img/realisations/` (vraies captures). Le site généré est dans `site/dist/` (enregistré dans le dépôt, servi par Vercel). `vercel.json` est généré par le build.
- **Commandes** : `npm run build` (logos + site), `npm test` (tests navigateur + captures dans `site/captures/`, non enregistrées).
- **Réglages** (`config/studio.json`) : slogan, présentation, coordonnées (`contact` : vide = formulaire désactivé avec « bientôt »), réseaux (vides = masqués), bandeau `ouverture`, `entreprise` (BCE, adresse, TVA → mentions légales), `site.url` (active le plan du site et l'adresse canonique), `site.referencement` (false = `noindex` + en-tête `X-Robots-Tag`), `realisations[].afficher`.
- **Réalisations** : Jumeo (projet personnel, sans lien car jumeo.vercel.app est protégé par Vercel), Pilotia et Lallat (créations confirmées par Nasser le 19/11/2026, liens : version « accueil épuré » de Pilotia sur Vercel et https://lallat.be). Démo Lux : cachée tant qu'il n'y a pas l'accord écrit de Lux. Pour refaire les captures : `site/outils/captures-realisations.cjs`.
- **Choix techniques** : polices auto-hébergées (aucun appel à Google), aucun cookie ni traceur, formulaire sans serveur (message prêt dans WhatsApp, e-mail en secours), site installable (manifeste + service worker), mentions légales et confidentialité en fenêtres.
- **À valider par Nasser** : fourchettes de budget du formulaire, réponse FAQ « si j'arrête l'abonnement » (à aligner avec le contrat), textes légaux (relecture par un juriste).
- **À faire à l'ouverture (janvier 2027, à confirmer avec son comptable)** : numéro BCE, adresse et TVA dans `entreprise`, coordonnées, `site.referencement: true`, `site.url`, retrait du bandeau, vraie photo dans « À propos », tarifs si Nasser le souhaite.
