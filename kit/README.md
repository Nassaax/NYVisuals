# Kit de départ Nayas Visuals

Gabarit de site client : une seule fiche de réglages (`client.json`) génère un site complet aux couleurs du client.

## Ce que fait le kit
- **Écran d'ouverture** : le logo du client se construit (chaque forme arrive d'un côté, petit battement), puis son nom (en tracé vectoriel) et son slogan. Une fois par visite, clic pour passer, jamais avec « animations réduites » ni sans JavaScript.
- **Logo** : le SVG fourni par le client, animé forme par forme. Sans logo, un monogramme est créé avec ses initiales.
- **Sections** : haut de page (photo du client ou logo), services (icônes animées), « comment ça marche » avec tracé au défilement, réalisations (vraies photos), avis (réels, avec auteur et source), infos pratiques, questions fréquentes, contact. Une section sans contenu disparaît.
- **Mobile façon application** : barre d'onglets avec bouton central (« Devis », « RDV »…), menu qui monte du bas, site installable.
- **Formulaire sans serveur** : message prêt dans le WhatsApp du client, e-mail en secours, case de consentement.
- **Légal** : mentions légales et confidentialité au nom du client, rappel visible si l'adresse ou le numéro BCE manque.
- **Couleurs** : une seule couleur d'accent ; les contrastes (texte, boutons) sont corrigés automatiquement.
- **Référencement** : titre, description, fiche entreprise (JSON-LD sans faux avis), image de partage, plan du site, `noindex` tant que `site.referencement` est faux.
- **Tests** : ordinateur + mobile 390 px, zéro erreur, pas de défilement horizontal, accessibilité, formulaire, animations réduites, sans JavaScript, captures image par image.

## Créer le site d'un client
1. Remplir `clients/<nom>/client.json` (copie de `kit/modele/client.json`) à partir de sa fiche ; ses photos et son logo dans `clients/<nom>/photos/`.
2. Nasser crée un dépôt GitHub privé vide `<nom>-site` ; je le clone.
3. `node kit/nouveau-site.mjs <dossier-du-clone> --client clients/<nom>/client.json`
4. Dans le dossier : `npm install`, `npm run build`, `npm test`, puis envoi des captures à Nasser.
5. Mise en ligne de la démo sur Vercel (projet relié au dépôt, `noindex`).

## Exemple
`kit/exemple/client.json` : entreprise **imaginaire** (Atelier Boréal) pour vérifier le kit.
`npm run kit:exemple` puis `npm run kit:test`.

## Aller plus loin pour un client
Le kit donne une base solide en quelques minutes. Pour chaque client, on peut ensuite ajouter une animation de logo sur mesure, des pages supplémentaires (par service, par commune), un simulateur, comme pour Jumeo.
