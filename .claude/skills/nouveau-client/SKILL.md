---
name: nouveau-client
description: Lance ou reprend le travail pour un client de NY Visuals (logo, site, visuels). À utiliser dès que Nasser écrit « Nouveau client : [nom] », « Client [nom] : on continue », ou tape /nouveau-client.
---

# Nouveau client NY Visuals

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
- **Logo** (si besoin) : 2 ou 3 pistes avec animation d'ouverture, captures image par image, puis fichiers finaux et mini-charte (même méthode que `logo/` pour NY Visuals).
- **Démo** : demande à Nasser de créer un dépôt GitHub privé vide nommé `<dossier>-site` et de te donner son nom. Construis le site avec la recette du `CLAUDE.md` (même base que `site/` : réglages à un seul endroit, écran d'ouverture, barre d'onglets mobile, formulaire WhatsApp, tests). Mets-le en ligne sur Vercel en `noindex`, lance les tests, envoie les captures.
- **Retouches** : note chaque demande dans `fiche.md` (section « Retouches »), fais-les, renvoie les captures.
- **Mise en ligne** : vérifie les mentions légales sur une source officielle belge, politique de confidentialité au nom du client, nom de domaine, référencement activé.
- **Remise** : prépare la fiche de remise.

## 4. Toujours

- Avant chaque enregistrement sur GitHub, dis en une phrase ce qui change.
- Termine chaque échange par : où on en est (1 ligne), ce que tu attends de Nasser (liste courte), la prochaine étape.
