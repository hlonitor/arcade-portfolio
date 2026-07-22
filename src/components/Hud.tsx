import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE, SKILLS, ALL_LEVELS } from '../data/content';

// Heads-Up Display overlaid on the Snake arena (v1-style): skill "health" bars,
// a project collection log, a permanent LinkedIn link, and audio/HUD toggles.
export default function Hud() {
  const audioOn = useGame((s) => s.audioOn);
  const toggleAudio = useGame((s) => s.toggleAudio);
  const openPanel = useGame((s) => s.openPanel);
  const collected = useGame((s) => s.collected);
  const coins = useGame((s) => s.coins);
  const hudVisible = useGame((s) => s.hudVisible);
  const toggleHud = useGame((s) => s.toggleHud);

  return (
    <div style={styles.layer}>
      {/* Top-right controls */}
      <div style={styles.topRight}>
        <span className="mono" style={styles.coins}>🪙 {coins}</span>
        <a className="btn" style={styles.iconBtn} href={PROFILE.linkedin} target="_blank"
           rel="noopener noreferrer"
           onMouseEnter={() => audioOn && audio.sfx('hover')}
           onClick={() => audio.sfx('click')}
           aria-label="Open Lydron's LinkedIn profile (opens in new tab)">
          in · LinkedIn ↗
        </a>
        <button className="btn" style={styles.iconBtn}
                onClick={() => { audio.sfx('click'); toggleAudio(); }}
                aria-pressed={audioOn} aria-label={audioOn ? 'Mute audio' : 'Unmute audio'}>
          {audioOn ? '🔊' : '🔇'}
        </button>
        <button className="btn" style={styles.iconBtn}
                onClick={() => { audio.sfx('click'); toggleHud(); }}
                aria-label="Toggle HUD">👁</button>
      </div>

      {hudVisible && (
        <>
          {/* Top-left: identity + skill bars */}
          <div style={{ ...styles.card, ...styles.topLeft }}>
            <div className="mono neon-text" style={styles.name}>{PROFILE.name}</div>
            <div className="mono" style={styles.role}>{PROFILE.title}</div>
            <div style={{ marginTop: 10 }}>
              {SKILLS.map((s) => (
                <div key={s.name} style={styles.skillRow}>
                  <span className="mono" style={styles.skillName}>{s.name}</span>
                  <div style={styles.track}>
                    <div style={{ ...styles.fill, width: `${s.level}%`, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-left: project collection log */}
          <div style={{ ...styles.card, ...styles.bottomLeft }}>
            <div className="mono neon-text" style={styles.logTitle}>◆ DATA NODES</div>
            <div className="mono" style={styles.logMeta}>
              Collected {collected.size}/{ALL_LEVELS.length}
            </div>
            <ul style={styles.list}>
              {ALL_LEVELS.map((l) => {
                const got = collected.has(l.id);
                const locked = l.status === 'locked';
                return (
                  <li key={l.id}>
                    <button className="mono" style={{
                      ...styles.logBtn,
                      color: locked ? '#64748b' : got ? '#34d399' : '#e6f1ff',
                    }}
                      onMouseEnter={() => audioOn && audio.sfx('hover')}
                      onClick={() => { audio.sfx('click'); openPanel(l.id); }}>
                      {got ? '✓' : locked ? '🔒' : '◆'} {l.title}
                    </button>
                  </li>
                );
              })}
              <li>
                <button className="mono" style={{ ...styles.logBtn, color: '#f472b6' }}
                        onMouseEnter={() => audioOn && audio.sfx('hover')}
                        onClick={() => { audio.sfx('click'); openPanel('contact'); }}>
                  ✉ Contact Terminal
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layer: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 },
  card: {
    position: 'absolute', pointerEvents: 'auto', background: 'var(--panel)',
    border: '1px solid var(--panel-border)', borderRadius: 8, padding: '12px 14px',
    backdropFilter: 'blur(6px)', maxWidth: 'min(80vw, 300px)',
  },
  topLeft: { top: 56, left: 12 },
  bottomLeft: { bottom: 12, left: 12 },
  topRight: {
    position: 'absolute', top: 56, right: 12, display: 'flex', gap: 8,
    flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '70vw', pointerEvents: 'auto',
    alignItems: 'center',
  },
  coins: { color: '#ffd23f', fontSize: 14, fontWeight: 700 },
  iconBtn: { fontSize: 12, padding: '8px 10px' },
  name: { fontSize: 17, fontWeight: 700 },
  role: { fontSize: 12, color: '#a78bfa' },
  skillRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  skillName: { fontSize: 10, width: 120, color: '#c7d6ee' },
  track: { flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' },
  fill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
  logTitle: { fontSize: 13, fontWeight: 700 },
  logMeta: { fontSize: 10, color: '#8aa0c0', marginTop: 2 },
  list: { listStyle: 'none', margin: '8px 0 0', padding: 0 },
  logBtn: {
    background: 'none', border: 'none', padding: '3px 0', fontSize: 12,
    cursor: 'pointer', textAlign: 'left', width: '100%',
  },
};
