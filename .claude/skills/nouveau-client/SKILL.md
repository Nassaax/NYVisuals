---
name: nouveau-client
description: Lance ou reprend le travail pour un client de Nayas Visuals (logo, site, visuels). À utiliser dès que Nasser écrit « Nouveau client : [nom] », « Client [nom] : on continue », ou tape /nouveau-client.
---

# Nouveau client Nayas Visuals

Nasser n'est pas développeur : tutoiement, français simple, aucune manipulation technique de son côté. Toutes les règles du `CLAUDE.md` s'appliquent (pas de faux, droits des photos, mentions légales, contrats à faire relire).

## 1. Ouvrir le dossier du client

1. Déduis un nom de dossier court en minuscules sans accents (ex. « Boulangerie Dupont » → `boulangerie-dupont`).
2. Si `clients/<dossier>/` existe déjà, c'est une reprise : lis `fiche.md` et `todo.md`, résume en 3 lignes où on en est et propose la prochaine étape. Arrête-toi là.
3. Sinon, crée :
   - `clients/<dossier>/fiche.md` : copie de `documents/brief-client.md` avec, en tête, `Client`, `Date de démarrage`, `Source du contact` (Instagram, bouche-à-oreille…). Remplis tout ce que Nasser a déjà donné. N'invente rien : une info inconnue reste vide.
   - `clients/<dossier>/todo.md` : copie de `documents/todo-client.md` (remplace `{{CLIENT}}` et `{{DATE}}`), coche ce qui est déjà fait.

## 2. Faire le point sur le brief

Liste ce qui manque pour démarrer, en trois niveaux :
- **Indispensable pour la démo** : nom, activité, services, zone, objectif et bouton principal, au moins un contact (WhatsApp ou e-mail), logo ou besoin de logo.
- **Indispensable pour la mise en ligne** : numéro BCE, adresse, TVA, nom de domaine, formule A ou B.
- **Utile** : photos, couleurs, sites aimés, avis réels, labels avec preuve, horaires, réseaux.

Pose les questions **une seule fois, regroupées**, avec des choix à cocher et ta recommandation. Rappelle à Nasser qu'il peut simplement envoyer au client `documents/pdf/brief-client.pdf`.

## 3. Enchaîner les étapes

Suis la procédure de `documents/procedure-client.md` et coche `todo.md` à chaque étape :
- **Logo** (si besoin) : 2 ou 3 pistes avec animation d'ouverture, captures image par image, puis fichiers finaux et mini-charte (même méthode que `logo/` pour Nayas Visuals).
- **Démo** (avec le kit, voir `kit/README.md`) :
  1. Remplis `clients/<dossier>/client.json` à partir de `kit/modele/client.json` et de la fiche (rien d'inventé : un champ inconnu reste vide). Range logo et photos du client dans `clients/<dossier>/photos/`.
  2. Demande à Nasser de créer un dépôt GitHub privé vide nommé `<dossier>-site` et de te donner son nom ; ajoute-le à la session et clone-le.
  3. `node kit/nouveau-site.mjs <clone> --client clients/<dossier>/client.json`, puis dans le clone `npm install`, `npm run build`, `npm test`.
  4. Regarde toi-même les captures, corrige, puis envoie à Nasser : ordinateur, mobile, ouverture image par image.
  5. Mets la démo en ligne sur Vercel (projet relié au dépôt), en `noindex`.
  6. Si le client le mérite : animation de logo sur mesure, pages en plus, simulateur (comme Jumeo).
- **Retouches** : note chaque demande dans `fiche.md` (section « Retouches »), fais-les, renvoie les captures.
- **Mise en ligne** : vérifie les mentions légales sur une source officielle belge, politique de confidentialité au nom du client, nom de domaine, référencement activé.
- **Remise** : prépare la fiche de remise.

## 4. Toujours

- Avant chaque enregistrement sur GitHub, dis en une phrase ce qui change.
- Termine chaque échange par : où on en est (1 ligne), ce que tu attends de Nasser (liste courte), la prochaine étape.
