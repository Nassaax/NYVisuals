# Vidéo de lancement (Remotion)

Format vertical 1080 × 1920, 30 images/s, 21 s, sans son (la musique s'ajoute dans Instagram, avec sa bibliothèque sous licence).
Textes et couleurs lus dans `config/studio.json`.

1. `npm install`
2. `node preparer-clips.mjs <dossier des vidéos originales>` (vidéos libres de droits fournies par Nasser, non enregistrées dans le dépôt)
3. `npx remotion render src/index.jsx Lancement out/lancement-nayas-visuals.mp4 --codec=h264 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`

Plan : logo NY qui se construit → « Un nouveau studio créatif est né » → Logo / Site web / Visuels → « Mes créations » (vraies captures Pilotia, Jumeo, Lallat) → slogan → fin (ouverture, @nayas.visuals, bouton, adresse du site).
