# Site client (kit NY Visuals)

Tout le site se règle dans **`client.json`**. Le site généré est dans `dist/`, mis en ligne par Vercel (réglages dans `vercel.json`, créé automatiquement).

- `npm install` (une seule fois)
- `npm run build` : génère le site dans `dist/`
- `npm test` : tests dans un vrai navigateur (ordinateur + mobile 390 px) et captures dans `captures/`
- Photos et logo du client : dossier `photos/` (uniquement des fichiers dont le client a les droits)

Avant la mise en ligne définitive : mentions légales complètes (`entreprise`), `site.url`, puis `site.referencement: true`.
