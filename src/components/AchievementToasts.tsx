import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';

// Watches the achievements list and pops a transient "Achievement Unlocked"
// toast (with a chime) whenever a new one is added.
export default function AchievementToasts() {
  const achievements = useGame((s) => s.achievements);
  const audioOn = useGame((s) => s.audioOn);
  const [toasts, setToasts] = useState<string[]>([]);
  const seen = useRef(0);

  useEffect(() => {
    if (achievements.length > seen.current) {
      const fresh = achievements.slice(seen.current);
      seen.current = achievements.length;
      if (audioOn) audio.sfx('achievement');
      fresh.forEach((label) => {
        setToasts((t) => [...t, label]);
        window.setTimeout(
          () => setToasts((t) => t.filter((x) => x !== label)),
          4200,
        );
      });
    }
  }, [achievements, audioOn]);

  return (
    <div style={styles.wrap} aria-live="polite">
      {toasts.map((label, i) => (
        <div key={`${label}-${i}`} style={styles.toast} className="mono">
          <div style={styles.header}>🏆 ACHIEVEMENT UNLOCKED</div>
          <div style={styles.body}>{label}</div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'fixed',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'none',
  },
  toast: {
    background: 'linear-gradient(135deg, rgba(255,153,0,0.95), rgba(244,114,182,0.95))',
    color: '#0a0a1a',
    padding: '10px 18px',
    borderRadius: 8,
    boxShadow: '0 0 24px rgba(255,153,0,0.6)',
    textAlign: 'center',
    animation: 'pulse 1.2s ease',
  },
  header: { fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  body: { fontSize: 14, fontWeight: 700, marginTop: 2 },
};
