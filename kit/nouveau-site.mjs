// Crée le dossier de site d'un nouveau client à partir du kit.
// Usage : node kit/nouveau-site.mjs <dossier-cible> [--client clients/<nom>/client.json] [--force]
// Le dossier cible est en général le clone du dépôt GitHub privé du client.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--client');
const clientJson = args.includes('--client') ? args[args.indexOf('--client') + 1] : null;
if (!target) { console.error('Usage : node kit/nouveau-site.mjs <dossier-cible> [--client chemin/client.json]'); process.exit(1); }
const dest = path.resolve(target);
const existing = fs.existsSync(dest) ? fs.readdirSync(dest).filter((f) => f !== '.git') : [];
if (existing.length && !args.includes('--force')) { console.error(`Le dossier ${dest} n'est pas vide (${existing.slice(0, 5).join(', ')}…). Ajoutez --force pour compléter quand même.`); process.exit(1); }

const modele = path.join(here, 'modele');
const copy = (from, to) => {
  for (const f of fs.readdirSync(from)) {
    if (f === 'node_modules' || f === 'dist' || f === 'captures') continue;
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); } else fs.copyFileSync(a, b);
  }
};
fs.mkdirSync(dest, { recursive: true });
copy(modele, dest);
fs.writeFileSync(path.join(dest, '.gitignore'), 'node_modules/\ncaptures/\n.DS_Store\n');

if (clientJson) {
  const src = path.resolve(clientJson);
  fs.copyFileSync(src, path.join(dest, 'client.json'));
  const photos = path.join(path.dirname(src), 'photos');           // photos rangées à côté de la fiche
  if (fs.existsSync(photos)) copy(photos, path.join(dest, 'photos'));
}
// Crédit « Site réalisé par » : toujours le nom actuel du studio (config/studio.json)
const studio = JSON.parse(fs.readFileSync(path.join(here, '..', 'config/studio.json'), 'utf8'));
const cj = path.join(dest, 'client.json');
const c = JSON.parse(fs.readFileSync(cj, 'utf8'));
c.credit = { nom: studio.nom, url: (studio.site && studio.site.url) || '' };
fs.writeFileSync(cj, JSON.stringify(c, null, 2) + '\n');
console.log(`OK : site créé dans ${dest}
Ensuite : cd ${target} && npm install && npm run build && npm test`);
