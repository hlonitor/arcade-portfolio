import { Suspense, lazy, useEffect, useState } from 'react';
import { useGame } from './store';
import BootScreen from './components/BootScreen';
import Hud from './components/Hud';
import ProjectPanel from './components/ProjectPanel';
import ContactTerminal from './components/ContactTerminal';
import CookieBanner from './components/CookieBanner';
import AchievementToasts from './components/AchievementToasts';
import AccessibleView from './components/AccessibleView';
import LoadingScreen from './components/LoadingScreen';
import Joystick from './components/Joystick';
import { audio } from './audio/AudioEngine';

// The heavy Three.js world is code-split: it only downloads once the visitor
// presses Start, keeping the initial paint (boot screen) tiny and fast.
const World = lazy(() => import('./three/World'));

export default function App() {
  const mode = useGame((s) => s.mode);
  const audioOn = useGame((s) => s.audioOn);
  const activePanel = useGame((s) => s.activePanel);
  const unlock = useGame((s) => s.unlock);
  const setCookieChoice = useGame((s) => s.setCookieChoice);
  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches,
  );

  // Keep the WebAudio music in sync with the audio toggle.
  useEffect(() => {
    if (audioOn && mode !== 'boot') audio.startMusic();
    else audio.stopMusic();
  }, [audioOn, mode]);

  // Welcome achievement when the world first loads.
  useEffect(() => {
    if (mode === 'playing') unlock('Game Start — welcome to the arcade');
  }, [mode, unlock]);

  // Restore a previously-saved cookie consent choice.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cookie-consent');
      if (saved === 'accepted' || saved === 'declined') setCookieChoice(saved);
    } catch {
      /* storage unavailable — banner will show for this session */
    }
  }, [setCookieChoice]);

  return (
    <div className="scanlines" style={{ height: '100%', width: '100%' }}>
      {mode === 'boot' && <BootScreen />}

      {mode === 'playing' && (
        <>
          <Suspense fallback={<LoadingScreen />}>
            <World />
          </Suspense>
          <Hud />
          {isTouch && !activePanel && <Joystick />}
          {activePanel === 'contact' ? (
            <ContactTerminal />
          ) : activePanel ? (
            <ProjectPanel id={activePanel} />
          ) : null}
          <AchievementToasts />
        </>
      )}

      {mode === 'accessible' && <AccessibleView />}

      <CookieBanner />
    </div>
  );
}
