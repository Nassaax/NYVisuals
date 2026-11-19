// Convertit un mot en tracés vectoriels (Plus Jakarta Sans), pour un logo net avant le chargement des polices.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function wordPath(text, { weight = 800, size = 100, tracking = -0.035 } = {}) {
  const file = path.join(root, `node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff`);
  const buf = fs.readFileSync(file);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let x = 0;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, 0, size).toPathData(2));
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  // boîte englobante réelle
  const full = new opentype.Path();
  x = 0;
  glyphs.forEach((g, i) => {
    full.extend(g.getPath(x, 0, size));
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const bb = full.getBoundingBox();
  const pad = 2;
  return {
    d: parts.join(''),
    viewBox: `${(bb.x1 - pad).toFixed(1)} ${(bb.y1 - pad).toFixed(1)} ${(bb.x2 - bb.x1 + 2 * pad).toFixed(1)} ${(bb.y2 - bb.y1 + 2 * pad).toFixed(1)}`,
    ratio: (bb.x2 - bb.x1 + 2 * pad) / (bb.y2 - bb.y1 + 2 * pad),
  };
}
