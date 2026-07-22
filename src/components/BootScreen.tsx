import { useState } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE } from '../data/content';

export default function BootScreen() {
  const start = useGame((s) => s.start);
  const enterAccessible = useGame((s) => s.enterAccessible);
  const toggleAudio = useGame((s) => s.toggleAudio);
  const [booting, setBooting] = useState(false);

  const pressStart = () => {
    // First user gesture — safe to init audio + enable music.
    audio.sfx('start');
    toggleAudio(); // turns audio ON
    setBooting(true);
    // Brief boot animation, then drop into the 3D hub.
    window.setTimeout(() => start(), 700);
  };

  const goAccessible = () => {
    audio.sfx('click');
    enterAccessible();
  };

  return (
    <div style={styles.wrap} role="dialog" aria-label="Start screen">
      <div style={styles.crt}>
        <p className="mono" style={styles.system}>
          &gt; INITIALIZING PORTFOLIO_OS v1.0 ...
        </p>
        <h1 className="mono neon-text" style={styles.title}>
          {PROFILE.name.toUpperCase()}
        </h1>
        <p className="mono" style={styles.subtitle}>
          {PROFILE.title} — {PROFILE.tagline}
        </p>

        {!booting ? (
          <>
            <button
              className="btn"
              style={styles.start}
              onClick={pressStart}
              autoFocus
            >
              ▶ Press Start to Begin
            </button>
            <div style={styles.row}>
              <button className="btn pink" onClick={goAccessible}>
                ♿ 2D / Accessible View
              </button>
            </div>
            <p className="mono" style={styles.hint}>
              Move: WASD / Arrow keys · Look: drag · Interact: walk into a kiosk
              <br />
              Audio will start with the game — toggle it anytime in the HUD.
            </p>
          </>
        ) : (
          <p className="mono neon-text" style={{ ...styles.start, animation: 'blink 0.4s infinite' }}>
            LOADING HUB…
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    background:
      'radial-gradient(ellipse at 50% 40%, #1a1040 0%, #06060f 70%), #06060f',
    zIndex: 100,
  },
  crt: {
    textAlign: 'center',
    padding: '32px',
    maxWidth: 620,
  },
  system: { color: '#34d399', fontSize: 13, opacity: 0.8 },
  title: { fontSize: 'clamp(32px, 8vw, 64px)', margin: '8px 0 0', lineHeight: 1 },
  subtitle: { color: '#a78bfa', fontSize: 'clamp(12px,3vw,16px)', marginTop: 12 },
  start: {
    fontSize: 20,
    padding: '16px 28px',
    marginTop: 32,
    animation: 'pulse 1.6s infinite',
  },
  row: { marginTop: 16 },
  hint: { color: '#8aa0c0', fontSize: 12, marginTop: 28, lineHeight: 1.7 },
};
