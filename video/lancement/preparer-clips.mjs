// Prépare les vidéos libres de droits (fournies par Nasser) pour le montage : découpe, recadrage vertical, sans son.
// Usage : node preparer-clips.mjs <dossier-des-videos-originales>
// Les originaux ne sont pas enregistrés dans le dépôt (trop lourds) : seuls les extraits préparés vont dans public/clips.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Usage : node preparer-clips.mjs <dossier-des-videos>'); process.exit(1); }
const find = (id) => { const f = fs.readdirSync(src).find((x) => x.includes(id)); if (!f) throw new Error('Vidéo introuvable : ' + id); return path.join(src, f); };
const out = path.resolve('public/clips');
fs.mkdirSync(out, { recursive: true });
const enc = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart'];
const clips = [
  // [nom, id de la vidéo, début (s), durée (s), filtre]
  ['camera-trepied', '9032607', 0, 4, 'crop=1215:2160:1773:0,scale=1080:1920'],          // caméra sur trépied (4K → vertical)
  ['graphiste', '16901721', 6, 4, 'crop=635:1129:222:791,scale=1080:1920'],             // mains et ordinateur (écran des pubs hors champ)
  ['portable-site', '8523640', 1, 4, 'scale=1280:720'],                                  // navigation sur un site (en carte)
  ['creatrices', '5585983', 0, 4, 'scale=1080:1920'],                                    // créatrices au travail (vertical)
  ['clavier-appareil', '6878291', 2, 4, 'scale=1280:720'],                               // clavier + appareil photo (en carte)
];
for (const [name, id, ss, t, vf] of clips) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', find(id), '-vf', vf, ...enc, path.join(out, name + '.mp4')]);
  console.log('OK : public/clips/' + name + '.mp4');
}
