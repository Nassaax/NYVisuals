import { registerRoot, Composition } from 'remotion';
import { Lancement, DUREE } from './Lancement.jsx';
import { ReelMarque, DUREE_REEL } from './ReelMarque.jsx';

const Root = () => (
  <>
    <Composition id="Lancement" component={Lancement} durationInFrames={DUREE} fps={30} width={1080} height={1920} />
    <Composition id="ReelMarque" component={ReelMarque} durationInFrames={DUREE_REEL} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
