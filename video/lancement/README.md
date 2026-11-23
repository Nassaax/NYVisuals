# Vidéo de lancement (Remotion)

Format vertical 1080 × 1920, 30 images/s, 21 s, sans son (la musique s'ajoute dans Instagram, avec sa bibliothèque sous licence).
Textes et couleurs lus dans `config/studio.json`.

1. `npm install`
2. `node preparer-clips.mjs <dossier des vidéos originales>` (vidéos libres de droits fournies par Nasser, non enregistrées dans le dépôt)
3. `npx remotion render src/index.jsx Lancement out/lancement-nayas-visuals.mp4 --codec=h264 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`

Plan : logo NY qui se construit → « Un nouveau studio créatif est né » → Logo / Site web / Visuels → « Mes créations » (vraies captures Pilotia, Jumeo, Lallat) → slogan → fin (ouverture, @nayas.visuals, bouton, adresse du site).

## Reel « Regarde une marque naître en 20 secondes » (composition `ReelMarque`, 24 s)
Hook rapide (Logo / Site / Visuels) → titre → 1 brief → 2 logo (marque d'exemple Atelier Boréal, signalée « imaginaire ») → 3 site (vraie capture du site d'exemple généré par le kit) → 4 visuels → « Et en vrai ? » (Pilotia, Jumeo, Lallat) → appel à s'abonner.
Extraits : vidéos libres de droits fournies par Nasser, préparées dans `public/clips2/` (non enregistrées).
`npx remotion render src/index.jsx ReelMarque out/reel-marque-nayas-visuals.mp4 --codec=h264 --crf=18 --browser-executable=…`
