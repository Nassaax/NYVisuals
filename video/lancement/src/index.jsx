import { registerRoot, Composition } from 'remotion';
import { Lancement, DUREE } from './Lancement.jsx';

const Root = () => (
  <Composition id="Lancement" component={Lancement} durationInFrames={DUREE} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
