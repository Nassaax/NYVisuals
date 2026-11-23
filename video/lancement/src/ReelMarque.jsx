// Reel « Regarde une marque naître en 20 secondes » — vertical 1080 × 1920, 30 i/s, 24 s.
// Marque d'exemple : Atelier Boréal (imaginaire, signalée à l'écran). Réalisations montrées : uniquement les vraies.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate, spring, Easing, delayRender, continueRender } from 'remotion';
import studio from '../../../config/studio.json';

const { papier: P, nuit: N, accent: A } = studio.couleurs;
const AMBRE = '#FFB23E', ROSE = '#FF3D7F', VERT = '#2F7A55', VERT_CLAIR = '#E6F1EA';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ig = '@' + (studio.contact.instagram || '');
export const DUREE_REEL = 720;

const ease = (f, a, b, from = 0, to = 1) => interpolate(f, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
const pop = (f, at) => spring({ frame: f - at, fps: 30, config: { damping: 13, mass: 0.6, stiffness: 180 } });
const display = { fontFamily: 'J', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95 };
const text = { fontFamily: 'I', fontWeight: 500 };
const hand = { fontFamily: 'H', fontWeight: 700 };

const useFonts = () => {
  const [h] = useState(() => delayRender('polices'));
  useEffect(() => {
    const list = [new FontFace('J', `url(${staticFile('fonts/jakarta-800.woff2')})`, { weight: '800' }),
      new FontFace('I', `url(${staticFile('fonts/inter-500.woff2')})`, { weight: '500' }),
      new FontFace('I', `url(${staticFile('fonts/inter-600.woff2')})`, { weight: '600' }),
      new FontFace('H', `url(${staticFile('fonts/caveat-700.woff2')})`, { weight: '700' })];
    Promise.all(list.map((x) => x.load().then((y) => document.fonts.add(y)))).then(() => continueRender(h));
  }, [h]);
};

// ---------- éléments communs ----------
const Bg = ({ src, f, dur, dark = 0.55, blur = 0, zoom = [1.1, 1] }) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: N }}>
    <OffthreadVideo src={staticFile('clips2/' + src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: blur ? `blur(${blur}px)` : undefined, transform: `scale(${interpolate(f, [0, dur], zoom)})` }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(11,19,36,${dark * 0.7}), rgba(11,19,36,${dark}) 50%, rgba(11,19,36,${Math.min(0.96, dark + 0.3)}))` }} />
  </AbsoluteFill>
);
const Grid = ({ o = 0.5 }) => (
  <AbsoluteFill style={{ opacity: o, backgroundImage: 'linear-gradient(rgba(245,243,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(245,243,238,.07) 1px,transparent 1px)', backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%,#000 20%,transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%,#000 20%,transparent 75%)' }} />
);
const Words = ({ f, words, start = 0, step = 4, style, accent = [] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em', ...style }}>
    {words.map((w, i) => {
      const p = ease(f, start + i * step, start + i * step + 16);
      return <span key={i} style={{ overflow: 'hidden', display: 'inline-block', paddingBottom: '0.1em' }}><span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, color: accent.includes(i) ? A : undefined }}>{w}</span></span>;
    })}
  </div>
);
const Step = ({ f, n, label }) => {
  const p = ease(f, 2, 16);
  return (
    <div style={{ position: 'absolute', left: 70, top: 200, display: 'flex', alignItems: 'center', gap: 20, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <span style={{ ...display, fontSize: 40, color: N, background: A, borderRadius: 99, width: 76, height: 76, display: 'grid', placeItems: 'center', letterSpacing: 0 }}>{n}</span>
      <span style={{ ...display, fontSize: 64, color: P, letterSpacing: '-0.03em' }}>{label}</span>
    </div>
  );
};
const Wipe = ({ f, at, dir = 1 }) => {
  const p = interpolate(f, [at, at + 7, at + 14], [0, 1, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  if (p <= 0 || p >= 2) return null;
  const x = p <= 1 ? (1 - p) * 100 * dir : -(p - 1) * 100 * dir;
  return <AbsoluteFill style={{ transform: `translateX(${x}%) skewX(-8deg)`, background: `linear-gradient(90deg, ${AMBRE}, ${A} 45%, ${ROSE})`, width: '130%', left: '-15%' }} />;
};
const Tag = ({ children, f, at = 0, style }) => {
  const p = ease(f, at, at + 14);
  return <div style={{ position: 'absolute', ...text, fontWeight: 600, fontSize: 28, color: 'rgba(245,243,238,.75)', border: '2px solid rgba(245,243,238,.2)', borderRadius: 99, padding: '10px 20px', opacity: p, ...style }}>{children}</div>;
};

// Monogramme NY qui se dessine (fin de vidéo)
const NY = ({ f, size = 300, start = 0 }) => {
  const d = (a, b) => ease(f, start + a, start + b);
  const n = d(0, 24), y1 = d(8, 30), y2 = d(14, 34);
  const beat = interpolate(f, [start + 36, start + 44, start + 54], [1, 1.07, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ overflow: 'visible', transform: `scale(${beat})` }}>
      <defs><mask id="mr" maskUnits="userSpaceOnUse" x="-40" y="-10" width="200" height="140"><rect x="-40" y="-10" width="200" height="140" fill="#fff" /><path d="M54 22 78 62" stroke="#000" strokeWidth="22" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y2} opacity={y2 > 0 ? 1 : 0} /></mask></defs>
      <g fill="none" strokeWidth="12">
        <g mask="url(#mr)"><path d="M18 98V22l48 76V40" stroke={P} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - n} opacity={n > 0 ? 1 : 0} /></g>
        <path d="M102 22 78 62v36" stroke={A} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y1} opacity={y1 > 0 ? 1 : 0} />
        <path d="M54 22 78 62" stroke={A} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y2} opacity={y2 > 0 ? 1 : 0} />
      </g>
    </svg>
  );
};
// Logo de la marque d'exemple : carré arrondi qui se trace, se remplit, puis « AB »
const LogoAB = ({ f, size = 420, start = 0 }) => {
  const o = ease(f, start, start + 26), fill = ease(f, start + 22, start + 34);
  const a = pop(f, start + 28), b = pop(f, start + 34);
  const beat = interpolate(f, [start + 48, start + 56, start + 66], [1, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ overflow: 'visible', transform: `scale(${beat})` }}>
      <rect x="6" y="6" width="108" height="108" rx="30" fill="none" stroke={VERT} strokeWidth="5" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - o} />
      <rect x="6" y="6" width="108" height="108" rx="30" fill={VERT} opacity={fill} />
      <text x="60" y="78" textAnchor="middle" fontFamily="J" fontWeight="800" fontSize="52" letterSpacing="-2" fill="#fff">
        <tspan opacity={a} dx="0" style={{ transform: `translateX(${(1 - a) * -20}px)` }}>A</tspan>
        <tspan opacity={b}>B</tspan>
      </text>
    </svg>
  );
};

// ---------- scènes ----------
const SceneHook = () => {
  const f = useCurrentFrame();
  const shots = [['neon.mp4', 'LOGO.'], ['clavier.mp4', 'SITE.'], ['retouche.mp4', 'VISUELS.']];
  const i = Math.min(2, Math.floor(f / 25)), lf = f - i * 25;
  const s = pop(f, i * 25);
  return (
    <AbsoluteFill>
      <Bg src={shots[i][0]} f={lf} dur={25} dark={0.45} zoom={[1.25, 1.05]} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...display, fontSize: 210, color: i === 1 ? A : P, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6}deg)`, textShadow: '0 20px 60px rgba(0,0,0,.5)' }}>{shots[i][1]}</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center', ...text, fontWeight: 600, fontSize: 30, letterSpacing: '0.16em', color: 'rgba(245,243,238,.85)' }}>NAYAS VISUALS</div>
    </AbsoluteFill>
  );
};
const SceneTitre = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: N, justifyContent: 'center', padding: '0 80px' }}>
      <Grid />
      <Words f={f} start={2} step={4} words={['Regarde', 'une', 'marque', 'naître', 'en', '20', 'secondes.']} accent={[2, 3]} style={{ ...display, fontSize: 150, color: P }} />
      <div style={{ ...hand, fontSize: 52, color: AMBRE, marginTop: 40, transform: 'rotate(-3deg)', opacity: ease(f, 30, 44) }}>marque imaginaire, pour l'exemple ↓</div>
    </AbsoluteFill>
  );
};
const SceneBrief = () => {
  const f = useCurrentFrame();
  const chips = [['Menuiserie', 220, 760, -4], ['Sur mesure', 520, 900, 3], ['Artisan local', 160, 1040, 2], ['Bois et chaleur', 470, 1180, -3]];
  return (
    <AbsoluteFill>
      <Bg src="equipe.mp4" f={f} dur={90} dark={0.5} />
      <Step f={f} n="1" label="On écoute ton projet" />
      {chips.map(([t, x, y, r], k) => {
        const p = pop(f, 14 + k * 9);
        return <div key={t} style={{ position: 'absolute', left: x, top: y, transform: `scale(${p}) rotate(${r}deg)`, background: k % 2 ? P : AMBRE, color: N, ...display, fontSize: 52, letterSpacing: '-0.02em', padding: '18px 30px', borderRadius: 18, boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' }}>{t}</div>;
      })}
    </AbsoluteFill>
  );
};
const SceneLogo = () => {
  const f = useCurrentFrame();
  const sw = [[VERT, 'Vert forêt'], [P, 'Papier'], [N, 'Nuit']];
  return (
    <AbsoluteFill>
      <Bg src="inspiration.mp4" f={f} dur={120} dark={0.72} blur={14} />
      <Step f={f} n="2" label="On dessine le logo" />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 470 }}>
        <LogoAB f={f} start={8} size={400} />
        <div style={{ overflow: 'hidden', marginTop: 40, paddingBottom: '0.12em' }}><div style={{ ...display, fontSize: 96, color: P, transform: `translateY(${(1 - ease(f, 50, 68)) * 110}%)` }}>Atelier Boréal</div></div>
        <div style={{ display: 'flex', gap: 26, marginTop: 50 }}>
          {sw.map(([c, l], k) => { const p = pop(f, 70 + k * 7); return (
            <div key={l} style={{ display: 'grid', justifyItems: 'center', gap: 12, transform: `scale(${p})` }}>
              <span style={{ width: 120, height: 120, borderRadius: 30, background: c, border: '3px solid rgba(245,243,238,.35)' }} />
              <span style={{ ...text, fontSize: 26, color: 'rgba(245,243,238,.8)' }}>{l}</span>
            </div>); })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const SceneSite = () => {
  const f = useCurrentFrame();
  const p = pop(f, 4);
  const W = 520, inner = W - 20, imgH = (11788 * inner) / 780;
  const scroll = interpolate(f, [24, 112], [0, -2900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Bg src="neon.mp4" f={f} dur={120} dark={0.7} />
      <Step f={f} n="3" label="On construit le site" />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 360 }}>
        <div style={{ width: W, height: W * 2.06, borderRadius: 70, padding: 10, background: '#0d0f14', boxShadow: '0 60px 120px -40px rgba(0,0,0,.8), 0 0 0 3px #2a2e38 inset, 0 0 80px -10px rgba(47,122,85,.45)', transform: `translateY(${(1 - p) * 900}px) rotate(${(1 - p) * 8}deg)` }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 60, overflow: 'hidden', position: 'relative' }}>
            <Img src={staticFile('img/boreal-mobile.jpg')} style={{ position: 'absolute', left: 0, top: scroll, width: inner, height: imgH }} />
          </div>
        </div>
      </AbsoluteFill>
      <Tag f={f} at={30} style={{ right: 70, top: 1730 }}>Pensé d'abord pour le téléphone</Tag>
    </AbsoluteFill>
  );
};
const Tile = ({ f, at, x, y, r, bg, fg, children }) => {
  const p = pop(f, at);
  return <div style={{ position: 'absolute', left: x, top: y, width: 420, height: 525, borderRadius: 26, background: bg, color: fg, padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transform: `translateY(${(1 - p) * 600}px) rotate(${r * p}deg)`, boxShadow: '0 40px 80px -30px rgba(0,0,0,.7)' }}>{children}</div>;
};
const SceneVisuels = () => {
  const f = useCurrentFrame();
  const mini = (c) => <svg viewBox="0 0 120 120" width="70" height="70"><rect x="6" y="6" width="108" height="108" rx="30" fill={c} /><text x="60" y="78" textAnchor="middle" fontFamily="J" fontWeight="800" fontSize="52" fill={c === VERT ? '#fff' : VERT}>AB</text></svg>;
  return (
    <AbsoluteFill>
      <Bg src="retouche.mp4" f={f} dur={90} dark={0.55} />
      <Step f={f} n="4" label="On crée les visuels" />
      <Tile f={f} at={6} x={70} y={420} r={-6} bg={VERT} fg="#fff">{mini('#fff')}<div style={{ ...display, fontSize: 58 }}>Du sur-mesure, posé avec soin.</div></Tile>
      <Tile f={f} at={14} x={590} y={560} r={5} bg={VERT_CLAIR} fg={N}>{mini(VERT)}<div style={{ ...display, fontSize: 54 }}>Cuisines, escaliers, dressings.</div></Tile>
      <Tile f={f} at={22} x={330} y={1060} r={-2} bg={P} fg={N}><div style={{ ...text, fontWeight: 600, fontSize: 26, color: VERT, letterSpacing: '.1em' }}>ATELIER BORÉAL</div><div style={{ ...display, fontSize: 56 }}>Votre devis, détaillé et clair.</div></Tile>
    </AbsoluteFill>
  );
};
const Phone = ({ img, f, at, x, rot, label }) => {
  const p = pop(f, at);
  return (
    <div style={{ position: 'absolute', left: '50%', top: 640, transform: `translateX(calc(-50% + ${x}px)) translateY(${(1 - p) * 900}px) rotate(${rot * p}deg)`, display: 'grid', justifyItems: 'center', gap: 22 }}>
      <div style={{ width: 290, height: 620, borderRadius: 46, padding: 10, background: '#0d0f14', boxShadow: '0 50px 90px -30px rgba(0,0,0,.75)' }}>
        <Img src={staticFile('img/' + img)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: 36 }} />
      </div>
      <span style={{ ...display, fontSize: 40, color: P, letterSpacing: '-0.02em' }}>{label}</span>
    </div>
  );
};
const SceneVrai = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: N }}>
      <Grid />
      <AbsoluteFill style={{ padding: '220px 80px 0' }}>
        <Words f={f} start={0} step={4} words={['Et', 'en', 'vrai', '?']} accent={[2]} style={{ ...display, fontSize: 150, color: P }} />
        <div style={{ ...text, fontWeight: 600, fontSize: 34, color: A, letterSpacing: '0.12em', marginTop: 20, opacity: ease(f, 8, 18) }}>DÉJÀ EN LIGNE</div>
      </AbsoluteFill>
      <Phone img="pilotia-mobile.jpg" label="Pilotia" f={f} at={8} x={-320} rot={-7} />
      <Phone img="lallat-mobile.jpg" label="Lallat" f={f} at={16} x={320} rot={7} />
      <Phone img="jumeo-mobile.jpg" label="Jumeo" f={f} at={12} x={0} rot={0} />
    </AbsoluteFill>
  );
};
const SceneCTA = () => {
  const f = useCurrentFrame();
  const btn = pop(f, 46), sub = pop(f, 56);
  return (
    <AbsoluteFill style={{ background: N, alignItems: 'center', justifyContent: 'center' }}>
      <Grid />
      <div style={{ position: 'absolute', left: '50%', top: '36%', width: 1000, height: 1000, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(closest-side, ${A}, transparent)`, opacity: 0.35, filter: 'blur(60px)' }} />
      <div style={{ display: 'grid', justifyItems: 'center', gap: 30, textAlign: 'center' }}>
        <NY f={f} size={260} />
        <Words f={f} start={22} step={4} words={['Ta', 'marque', 'est', 'la', 'prochaine', '?']} accent={[4]} style={{ ...display, fontSize: 104, color: P, justifyContent: 'center', maxWidth: 900 }} />
        <div style={{ ...display, fontSize: 80, letterSpacing: '-0.03em', color: P, marginTop: 20, opacity: ease(f, 40, 54) }}>{ig}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          <div style={{ transform: `scale(${btn})`, background: A, color: N, fontFamily: 'I', fontWeight: 600, fontSize: 42, padding: '22px 40px', borderRadius: 99 }}>Abonne-toi</div>
          <div style={{ transform: `scale(${sub})`, border: `3px solid ${P}`, color: P, fontFamily: 'I', fontWeight: 600, fontSize: 42, padding: '19px 36px', borderRadius: 99 }}>Écris-moi</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S = { hook: [0, 75], titre: [75, 66], brief: [135, 92], logo: [225, 122], site: [345, 122], visuels: [465, 92], vrai: [555, 77], cta: [630, 90] };
export const ReelMarque = () => {
  useFonts();
  const f = useCurrentFrame();
  const seq = (k, el) => <Sequence from={S[k][0]} durationInFrames={S[k][1]}>{el}</Sequence>;
  return (
    <AbsoluteFill style={{ background: N }}>
      {seq('hook', <SceneHook />)}{seq('titre', <SceneTitre />)}{seq('brief', <SceneBrief />)}{seq('logo', <SceneLogo />)}
      {seq('site', <SceneSite />)}{seq('visuels', <SceneVisuels />)}{seq('vrai', <SceneVrai />)}{seq('cta', <SceneCTA />)}
      <Wipe f={f} at={68} /><Wipe f={f} at={218} dir={-1} /><Wipe f={f} at={338} /><Wipe f={f} at={548} dir={-1} /><Wipe f={f} at={623} />
    </AbsoluteFill>
  );
};
