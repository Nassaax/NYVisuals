// Vidéo de lancement Nayas Visuals — format vertical 1080 × 1920 (Reels, stories, TikTok), 30 images/s.
// Textes et couleurs lus dans config/studio.json (source unique).
import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, delayRender, continueRender,
} from 'remotion';
import studio from '../../../config/studio.json';

const { papier: P, nuit: N, accent: A } = studio.couleurs;
const AMBRE = '#FFB23E', ROSE = '#FF3D7F';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ig = '@' + (studio.contact.instagram || '');
const siteUrl = (studio.site.url || '').replace(/^https?:\/\//, '');
const ouverture = studio.ouverture && studio.ouverture.bandeau ? studio.ouverture.texte : '';

// Plan de montage (en images, 30 par seconde)
const S = { logo: [0, 80], studio: [70, 105], logoMot: [165, 45], site: [210, 45], visuels: [255, 45], creations: [300, 135], slogan: [425, 90], fin: [505, 125] };
export const DUREE = 630; // 21 s

const ease = (f, a, b, from = 0, to = 1) => interpolate(f, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

// ---------- Polices (hébergées dans le projet) ----------
const useFonts = () => {
  const [h] = useState(() => delayRender('polices'));
  useEffect(() => {
    const list = [new FontFace('J', `url(${staticFile('fonts/jakarta-800.woff2')})`, { weight: '800' }),
      new FontFace('I', `url(${staticFile('fonts/inter-500.woff2')})`, { weight: '500' }),
      new FontFace('I', `url(${staticFile('fonts/inter-600.woff2')})`, { weight: '600' })];
    Promise.all(list.map((f) => f.load().then((x) => document.fonts.add(x)))).then(() => continueRender(h));
  }, [h]);
};
const display = { fontFamily: 'J', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95 };
const text = { fontFamily: 'I', fontWeight: 500 };

// ---------- Monogramme NY qui se dessine ----------
const NY = ({ f, size = 420, start = 0, light = P, gap = N }) => {
  const d = (a, b) => ease(f, start + a, start + b);
  const n = d(0, 26), y1 = d(10, 34), y2 = d(16, 38);
  const beat = interpolate(f, [start + 40, start + 48, start + 58], [1, 1.07, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const id = 'm' + start;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ overflow: 'visible', transform: `scale(${beat})` }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-40" y="-10" width="200" height="140">
          <rect x="-40" y="-10" width="200" height="140" fill="#fff" />
          <path d="M54 22 78 62" stroke="#000" strokeWidth="22" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y2} opacity={y2 > 0 ? 1 : 0} />
        </mask>
      </defs>
      <g fill="none" strokeWidth="12" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="2">
        <g mask={`url(#${id})`}><path d="M18 98V22l48 76V40" stroke={light} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - n} transform={`translate(${(1 - n) * -26} 0)`} opacity={n > 0 ? 1 : 0} /></g>
        <path d="M102 22 78 62v36" stroke={A} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y1} transform={`translate(${(1 - y1) * 26} 0)`} opacity={y1 > 0 ? 1 : 0} />
        <path d="M54 22 78 62" stroke={A} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - y2} transform={`translate(${(1 - y2) * 26} 0)`} opacity={y2 > 0 ? 1 : 0} />
      </g>
    </svg>
  );
};

// ---------- Éléments de motion design ----------
const Grid = ({ opacity = 0.5 }) => (
  <AbsoluteFill style={{ opacity, backgroundImage: 'linear-gradient(rgba(245,243,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(245,243,238,.07) 1px,transparent 1px)', backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%,#000 20%,transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%,#000 20%,transparent 75%)' }} />
);
const Glow = ({ x = 50, y = 42, s = 900, o = 0.45 }) => (
  <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(closest-side, ${A}, transparent)`, opacity: o, filter: 'blur(60px)' }} />
);
// Mots qui montent un par un
const Words = ({ f, words, start = 0, step = 4, style, accentFrom = Infinity, accent = [] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em', ...style }}>
    {words.map((w, i) => {
      const p = ease(f, start + i * step, start + i * step + 18);
      return (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block', paddingBottom: '0.08em' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, color: i >= accentFrom || accent.includes(i) ? A : undefined }}>{w}</span>
        </span>
      );
    })}
  </div>
);
// Volet orange qui balaie l'écran entre deux scènes
const Wipe = ({ f, at, dir = 1 }) => {
  const p = interpolate(f, [at, at + 8, at + 16], [0, 1, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  if (p <= 0 || p >= 2) return null;
  const x = p <= 1 ? (1 - p) * 100 * dir : -(p - 1) * 100 * dir;
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}%) skewX(-8deg)`, background: `linear-gradient(90deg, ${AMBRE}, ${A} 45%, ${ROSE})`, width: '130%', left: '-15%' }} />
  );
};
// Fond vidéo plein écran, assombri, avec léger zoom
const Clip = ({ src, f, dur, dark = 0.55 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <OffthreadVideo src={staticFile('clips/' + src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(f, [0, dur], [1.08, 1.0])})` }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(11,19,36,${dark * 0.6}) 0%, rgba(11,19,36,${dark}) 55%, rgba(11,19,36,${Math.min(0.95, dark + 0.3)}) 100%)` }} />
  </AbsoluteFill>
);
const Pill = ({ children, f, at = 0, style }) => {
  const p = ease(f, at, at + 16);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 26px 16px 20px', borderRadius: 99, border: '2px solid rgba(245,243,238,.18)', background: 'rgba(245,243,238,.06)', color: P, fontFamily: 'I', fontWeight: 600, fontSize: 34, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, ...style }}>
      <i style={{ width: 16, height: 16, borderRadius: 99, background: A, boxShadow: `0 0 0 8px ${A}40` }} />{children}
    </div>
  );
};
// Carte vidéo (pour les vidéos horizontales)
const Card = ({ src, f, at = 0, w = 940, rotate = -3 }) => {
  const p = spring({ frame: f - at, fps: 30, config: { damping: 18, mass: 0.8 } });
  return (
    <div style={{ width: w, aspectRatio: '16/9', borderRadius: 36, overflow: 'hidden', boxShadow: '0 60px 120px -40px rgba(0,0,0,.7)', transform: `translateY(${(1 - p) * 300}px) rotate(${rotate * p}deg) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5), border: '3px solid rgba(245,243,238,.12)' }}>
      <OffthreadVideo src={staticFile('clips/' + src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};
const Phone = ({ img, f, at, x, rot, label }) => {
  const p = spring({ frame: f - at, fps: 30, config: { damping: 16, mass: 0.9 } });
  return (
    <div style={{ position: 'absolute', left: '50%', top: 650, transform: `translateX(calc(-50% + ${x}px)) translateY(${(1 - p) * 900}px) rotate(${rot * p}deg)`, display: 'grid', justifyItems: 'center', gap: 26 }}>
      <div style={{ width: 300, height: 640, borderRadius: 48, padding: 10, background: '#0d0f14', boxShadow: '0 50px 90px -30px rgba(0,0,0,.75), 0 0 0 3px #2a2e38 inset' }}>
        <Img src={staticFile('img/' + img)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: 38 }} />
      </div>
      <span style={{ ...display, fontSize: 40, color: P, letterSpacing: '-0.02em' }}>{label}</span>
    </div>
  );
};

// ---------- Scènes ----------
const SceneLogo = () => {
  const f = useCurrentFrame();
  const w = ease(f, 44, 66);
  return (
    <AbsoluteFill style={{ background: N, alignItems: 'center', justifyContent: 'center' }}>
      <Grid /><Glow o={ease(f, 10, 50, 0, 0.35)} />
      <div style={{ display: 'grid', justifyItems: 'center', gap: 50 }}>
        <NY f={f} size={420} start={4} />
        <div style={{ overflow: 'hidden', paddingBottom: '0.14em' }}><div style={{ ...display, fontSize: 110, color: P, transform: `translateY(${(1 - w) * 110}%)` }}>{studio.nom}</div></div>
      </div>
    </AbsoluteFill>
  );
};
const SceneStudio = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: N }}>
      <Clip src="camera-trepied.mp4" f={f} dur={105} dark={0.5} />
      <AbsoluteFill style={{ padding: '0 80px 330px', justifyContent: 'flex-end' }}>
        <Pill f={f} at={8} style={{ alignSelf: 'flex-start', marginBottom: 40 }}>Nouveau · {studio.zone}</Pill>
        <Words f={f} start={14} words={['Un', 'nouveau', 'studio', 'créatif', 'est', 'né.']} accent={[2, 3]} style={{ ...display, fontSize: 150, color: P }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const SceneService = ({ n, mot, sous, clip, card }) => {
  const f = useCurrentFrame();
  const bar = ease(f, 8, 26);
  return (
    <AbsoluteFill style={{ background: N }}>
      {card ? (<><Grid /><Glow y={40} o={0.3} /><AbsoluteFill style={{ alignItems: 'center', paddingTop: 360 }}><Card src={clip} f={f} at={0} /></AbsoluteFill></>) : <Clip src={clip} f={f} dur={45} dark={0.45} />}
      <AbsoluteFill style={{ padding: '0 80px 300px', justifyContent: 'flex-end' }}>
        <div style={{ ...text, fontWeight: 600, fontSize: 36, color: A, letterSpacing: '0.12em', marginBottom: 24, opacity: ease(f, 2, 12) }}>{n} / 03</div>
        <Words f={f} start={2} step={5} words={mot.split(' ')} style={{ ...display, fontSize: 190, color: P }} />
        <div style={{ height: 14, width: 420 * bar, background: `linear-gradient(90deg, ${A}, ${ROSE})`, borderRadius: 14, marginTop: 30 }} />
        <div style={{ ...text, fontSize: 44, color: 'rgba(245,243,238,.8)', marginTop: 34, opacity: ease(f, 12, 26), transform: `translateY(${(1 - ease(f, 12, 26)) * 20}px)` }}>{sous}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const SceneCreations = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: N }}>
      <Grid /><Glow y={55} s={1100} o={0.35} />
      <AbsoluteFill style={{ padding: '210px 80px 0' }}>
        <div style={{ ...text, fontWeight: 600, fontSize: 36, color: A, letterSpacing: '0.12em', opacity: ease(f, 0, 12) }}>DÉJÀ EN LIGNE</div>
        <Words f={f} start={2} words={['Mes', 'créations.']} accentFrom={1} style={{ ...display, fontSize: 150, color: P, marginTop: 18 }} />
      </AbsoluteFill>
      <Phone img="pilotia-mobile.jpg" label="Pilotia" f={f} at={14} x={-330} rot={-7} />
      <Phone img="lallat-mobile.jpg" label="Lallat" f={f} at={26} x={330} rot={7} />
      <Phone img="jumeo-mobile.jpg" label="Jumeo" f={f} at={20} x={0} rot={0} />
    </AbsoluteFill>
  );
};
const SceneSlogan = () => {
  const f = useCurrentFrame();
  const words = studio.slogan.split(' ');
  return (
    <AbsoluteFill style={{ background: N }}>
      <Grid opacity={0.35} /><Glow y={30} o={0.25} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 260 }}><Card src="clavier-appareil.mp4" f={f} at={0} rotate={3} /></AbsoluteFill>
      <AbsoluteFill style={{ padding: '0 80px 320px', justifyContent: 'flex-end' }}>
        <Words f={f} start={10} step={5} words={words} accentFrom={words.length - 1} style={{ ...display, fontSize: 170, color: P }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const SceneFin = () => {
  const f = useCurrentFrame();
  const btn = ease(f, 40, 58);
  return (
    <AbsoluteFill style={{ background: N, alignItems: 'center', justifyContent: 'center' }}>
      <Grid /><Glow y={36} s={1000} o={0.4} />
      <div style={{ display: 'grid', justifyItems: 'center', gap: 34, textAlign: 'center' }}>
        <NY f={f} size={300} start={0} />
        <div style={{ overflow: 'hidden', paddingBottom: '0.14em' }}><div style={{ ...display, fontSize: 96, color: P, transform: `translateY(${(1 - ease(f, 30, 50)) * 110}%)` }}>{studio.nom}</div></div>
        {ouverture && <Pill f={f} at={44}>{ouverture}</Pill>}
        <div style={{ ...display, fontSize: 84, letterSpacing: '-0.03em', color: P, marginTop: 40, opacity: ease(f, 52, 66), transform: `translateY(${(1 - ease(f, 52, 66)) * 30}px)` }}>{ig}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, padding: '14px 14px 14px 44px', borderRadius: 99, background: A, color: N, fontFamily: 'I', fontWeight: 600, fontSize: 44, transform: `scale(${0.8 + 0.2 * btn})`, opacity: btn }}>
          Parlons de votre projet
          <span style={{ width: 84, height: 84, borderRadius: 99, background: N, color: A, display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
        {siteUrl && <div style={{ ...text, fontSize: 36, color: 'rgba(245,243,238,.65)', marginTop: 10, opacity: ease(f, 62, 76) }}>{siteUrl}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const Lancement = () => {
  useFonts();
  const f = useCurrentFrame();
  const seq = (k, el) => <Sequence from={S[k][0]} durationInFrames={S[k][1]}>{el}</Sequence>;
  return (
    <AbsoluteFill style={{ background: N }}>
      {seq('logo', <SceneLogo />)}
      {seq('studio', <SceneStudio />)}
      {seq('logoMot', <SceneService n="01" mot="Logo." sous="Une identité qui vous ressemble." clip="graphiste.mp4" />)}
      {seq('site', <SceneService n="02" mot="Site web." sous="Rapide, animé, pensé pour le téléphone." clip="portable-site.mp4" card />)}
      {seq('visuels', <SceneService n="03" mot="Visuels." sous="Pour vos réseaux sociaux." clip="creatrices.mp4" />)}
      {seq('creations', <SceneCreations />)}
      {seq('slogan', <SceneSlogan />)}
      {seq('fin', <SceneFin />)}
      <Wipe f={f} at={64} />
      <Wipe f={f} at={292} dir={-1} />
      <Wipe f={f} at={497} />
    </AbsoluteFill>
  );
};
