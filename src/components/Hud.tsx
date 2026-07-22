import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE, SKILLS, PROJECTS } from '../data/content';

// Heads-Up Display overlaid on the 3D canvas: skill "health" bars, quest log,
// social link, audio toggle, and the accessible-view escape hatch.
export default function Hud() {
  const audioOn = useGame((s) => s.audioOn);
  const toggleAudio = useGame((s) => s.toggleAudio);
  const enterAccessible = useGame((s) => s.enterAccessible);
  const openPanel = useGame((s) => s.openPanel);
  const visited = useGame((s) => s.visitedLevels);
  const hudVisible = useGame((s) => s.hudVisible);
  const toggleHud = useGame((s) => s.toggleHud);

  const unlockedCount = PROJECTS.filter((p) => p.status !== 'locked').length;

  return (
    <div style={styles.layer} aria-hidden={false}>
      {/* Top-left: player identity + skill bars */}
      {hudVisible && (
        <div style={{ ...styles.card, ...styles.topLeft }}>
          <div className="mono neon-text" style={styles.name}>
            {PROFILE.name}
          </div>
          <div className="mono" style={styles.role}>
            {PROFILE.title}
          </div>
          <div style={{ marginTop: 10 }}>
            {SKILLS.map((s) => (
              <div key={s.name} style={styles.skillRow}>
                <span className="mono" style={styles.skillName}>
                  {s.name}
                </span>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${s.level}%`,
                      background: s.color,
                      boxShadow: `0 0 8px ${s.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-right: system controls */}
      <div style={{ ...styles.topRight }}>
        <a
          className="btn"
          style={styles.iconBtn}
          href={PROFILE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => audioOn && audio.sfx('hover')}
          onClick={() => audio.sfx('click')}
          aria-label="Open Lydron's LinkedIn profile (opens in new tab)"
        >
          in · LinkedIn ↗
        </a>
        <button
          className="btn"
          style={styles.iconBtn}
          onClick={() => {
            audio.sfx('click');
            toggleAudio();
          }}
          aria-pressed={audioOn}
          aria-label={audioOn ? 'Mute audio' : 'Unmute audio'}
        >
          {audioOn ? '🔊 Audio On' : '🔇 Audio Off'}
        </button>
        <button
          className="btn"
          style={styles.iconBtn}
          onClick={() => {
            audio.sfx('click');
            toggleHud();
          }}
          aria-label="Toggle HUD visibility"
        >
          {hudVisible ? '👁 Hide HUD' : '👁 Show HUD'}
        </button>
        <button
          className="btn pink"
          style={styles.iconBtn}
          onClick={() => {
            audio.sfx('click');
            enterAccessible();
          }}
          aria-label="Switch to 2D accessible view"
        >
          ♿ 2D View
        </button>
      </div>

      {/* Bottom-left: quest log */}
      {hudVisible && (
        <div style={{ ...styles.card, ...styles.bottomLeft }}>
          <div className="mono neon-text" style={styles.questTitle}>
            ▣ QUEST LOG
          </div>
          <div className="mono" style={styles.questMeta}>
            Levels unlocked: {unlockedCount}/{PROJECTS.length} · Visited:{' '}
            {visited.size}
          </div>
          <ul style={styles.questList}>
            {PROJECTS.map((p) => (
              <li key={p.id} style={styles.questItem}>
                <button
                  className="mono"
                  style={{
                    ...styles.questBtn,
                    color:
                      p.status === 'locked'
                        ? '#64748b'
                        : visited.has(p.id)
                          ? '#34d399'
                          : '#e6f1ff',
                  }}
                  disabled={p.status === 'locked'}
                  onMouseEnter={() => audioOn && audio.sfx('hover')}
                  onClick={() => {
                    audio.sfx('click');
                    openPanel(p.id);
                  }}
                >
                  {p.status === 'locked' ? '🔒' : visited.has(p.id) ? '✓' : '◆'} L
                  {p.level} · {p.title}
                </button>
              </li>
            ))}
            <li style={styles.questItem}>
              <button
                className="mono"
                style={{ ...styles.questBtn, color: '#f472b6' }}
                onMouseEnter={() => audioOn && audio.sfx('hover')}
                onClick={() => {
                  audio.sfx('click');
                  openPanel('contact');
                }}
              >
                ✉ Contact Terminal
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Bottom-center: controls hint */}
      {hudVisible && (
        <div style={styles.controlsHint} className="mono">
          WASD / ARROWS to move · walk into a glowing kiosk to open a level
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 40,
  },
  card: {
    position: 'absolute',
    pointerEvents: 'auto',
    background: 'var(--panel)',
    border: '1px solid var(--panel-border)',
    borderRadius: 8,
    padding: '12px 14px',
    backdropFilter: 'blur(6px)',
    maxWidth: 'min(84vw, 320px)',
  },
  topLeft: { top: 12, left: 12 },
  topRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    maxWidth: '70vw',
    pointerEvents: 'auto',
  },
  bottomLeft: { bottom: 56, left: 12 },
  iconBtn: { fontSize: 12, padding: '8px 10px' },
  name: { fontSize: 18, fontWeight: 700 },
  role: { fontSize: 12, color: '#a78bfa' },
  skillRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  skillName: { fontSize: 10, width: 120, color: '#c7d6ee' },
  barTrack: {
    flex: 1,
    height: 8,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
  questTitle: { fontSize: 14, fontWeight: 700 },
  questMeta: { fontSize: 10, color: '#8aa0c0', marginTop: 2 },
  questList: { listStyle: 'none', margin: '8px 0 0', padding: 0 },
  questItem: { margin: '2px 0' },
  questBtn: {
    background: 'none',
    border: 'none',
    padding: '3px 0',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  controlsHint: {
    position: 'absolute',
    bottom: 52,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 11,
    color: '#8aa0c0',
    background: 'rgba(6,6,15,0.6)',
    padding: '6px 12px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
};
