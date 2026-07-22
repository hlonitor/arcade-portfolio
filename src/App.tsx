import { useEffect } from 'react';
import { useGame } from './store';
import BootScreen from './components/BootScreen';
import WorldMap from './components/WorldMap';
import Platformer from './game/Platformer';
import ProjectPanel from './components/ProjectPanel';
import ContactTerminal from './components/ContactTerminal';
import CookieBanner from './components/CookieBanner';
import AchievementToasts from './components/AchievementToasts';
import AccessibleView from './components/AccessibleView';
import { audio } from './audio/AudioEngine';

export default function App() {
  const mode = useGame((s) => s.mode);
  const audioOn = useGame((s) => s.audioOn);
  const activePanel = useGame((s) => s.activePanel);
  const setCookieChoice = useGame((s) => s.setCookieChoice);

  // Keep the WebAudio music in sync with the audio toggle + mode.
  useEffect(() => {
    if (audioOn && mode !== 'boot') audio.startMusic();
    else audio.stopMusic();
  }, [audioOn, mode]);

  // Restore a previously-saved cookie consent choice.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cookie-consent');
      if (saved === 'accepted' || saved === 'declined') setCookieChoice(saved);
    } catch {
      /* storage unavailable — banner shows for this session */
    }
  }, [setCookieChoice]);

  return (
    <div className="scanlines" style={{ height: '100%', width: '100%' }}>
      {mode === 'boot' && <BootScreen />}
      {mode === 'worldmap' && <WorldMap />}
      {mode === 'playing' && <Platformer />}
      {mode === 'accessible' && <AccessibleView />}

      {/* Overlays available on top of map + gameplay */}
      {mode !== 'accessible' && activePanel === 'contact' && <ContactTerminal />}
      {mode !== 'accessible' && activePanel && activePanel !== 'contact' && (
        <ProjectPanel id={activePanel} />
      )}
      {mode !== 'boot' && mode !== 'accessible' && <AchievementToasts />}

      <CookieBanner />
    </div>
  );
}
