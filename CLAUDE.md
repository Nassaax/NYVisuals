# Studio de création web de Nasser — instructions pour Claude

## Qui, quoi
- **Nasser**, comptable de métier, lance une activité de **création web pour entrepreneurs, indépendants et startups** : sites vitrines, landing pages, « présence web » complète (site + fiche Google + visuels réseaux sociaux), logo et identité visuelle.
- Zone : Liège et la Wallonie, puis toute la Belgique francophone.
- Références réalisées (style à reproduire) : **Jumeo** (apporteur d'affaires énergie et rénovation), **démo Lux Energie Solution** (site Jumeo décliné aux couleurs d'un client, avec page Formations), **Pilotia** et **Lallat** (description à compléter par Nasser).

## Comment me parler
- Tutoiement, français simple, **sans jargon**. Nasser **ne touche jamais au code** : je fais toutes les manipulations.
- Questions **regroupées**, avec des choix à cocher et **ma recommandation** en premier.
- Avant chaque enregistrement sur GitHub : dire **en une phrase** ce qui change.

## Nom du studio
- Nom provisoire : **NY Visuals (NYV)**. Il peut changer : le nom est écrit **à un seul endroit**, `config/studio.json`. Tout le reste (logo, kit, documents) le lit de là. Après un changement : `node logo/build.mjs` régénère les logos.
- **Ne rien acheter, ne créer aucun compte** (domaine, réseaux sociaux) tant que Nasser n'a pas confirmé le nom définitif.
- Pistes gardées (vérifiées le 19/11/2026, .be non vérifié) : NY Agence (`nyagence.com` libre), NY Fabrique (`nyfabrique.com` libre), NY Atelier (`nyatelier.studio` libre), NY Motion (`nymotion.studio` libre). `nyvisuals.com` pris ; `nyvisuals.studio` et `nyvisuals.design` libres.
- Le jour du choix : tableau comparatif (facile à dire en français, pas de confusion avec New York, .be libre sur DNS Belgium, pseudos Instagram/Facebook/LinkedIn libres, aucune marque proche chez BOIP ni dans la BCE) + ma recommandation.

## Logo du studio
- Monogramme **« NY »** qui **se construit en animation** à l'ouverture du site (le N et le Y se tracent et se croisent, comme les anneaux de Jumeo), suivi du mot (« Visuals »). Le symbole NY doit survivre à un changement de nom : seul le mot change.
- **Choix validé le 19/11/2026 : piste B « Entrelacs »** (N bleu nuit, Y orange signal #FF5B2E qui passe par-dessus la jambe du N), accent orange signal. Fichiers dans `logo/final/`, mini-charte dans `logo/charte/` (HTML + PDF). Tout se régénère avec `node logo/build.mjs`.
- Toujours **2 ou 3 pistes** comparées avant le choix.
- Pour la piste choisie : version claire, version foncée, icône carrée (favicon, photo de profil), SVG + PNG transparents, mini-charte (couleurs, polices, règles d'usage).

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
- `kit/` : gabarit réutilisable pour un nouveau client (à venir).
- `documents/` : modèles (brief, offres A et B, fiche de remise) — brouillons à faire relire (à venir).
