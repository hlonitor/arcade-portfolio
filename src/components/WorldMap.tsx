import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE, SKILLS, WORLDS } from '../data/content';

// Mario-style overworld: each certification is a WORLD, and the projects under
// it are the selectable LEVELS (side-stages). Picking a level launches the
// platformer; picking a locked level still lets you walk it (with a wink).
export default function WorldMap() {
  const playLevel = useGame((s) => s.playLevel);
  const openPanel = useGame((s) => s.openPanel);
  const enterAccessible = useGame((s) => s.enterAccessible);
  const toggleAudio = useGame((s) => s.toggleAudio);
  const audioOn = useGame((s) => s.audioOn);
  const completed = useGame((s) => s.completedLevels);
  const coins = useGame((s) => s.coins);

  return (
    <div style={styles.page}>
      {/* Header / HUD */}
      <header style={styles.header}>
        <div>
          <div className="mono neon-text" style={styles.name}>{PROFILE.name}</div>
          <div className="mono" style={styles.role}>{PROFILE.title} — {PROFILE.tagline}</div>
        </div>
        <div style={styles.controls}>
          <span className="mono" style={styles.coins}>🪙 {coins}</span>
          <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer"
             onClick={() => audio.sfx('click')}>in · LinkedIn ↗</a>
          <button className="btn" onClick={() => { audio.sfx('click'); toggleAudio(); }}
                  aria-pressed={audioOn}>{audioOn ? '🔊 Audio' : '🔇 Audio'}</button>
          <button className="btn pink" onClick={() => { audio.sfx('click'); enterAccessible(); }}>
            ♿ 2D View
          </button>
        </div>
      </header>

      {/* Skill bars */}
      <section style={styles.skills}>
        {SKILLS.map((s) => (
          <div key={s.name} style={styles.skillRow}>
            <span className="mono" style={styles.skillName}>{s.name}</span>
            <div style={styles.track}>
              <div style={{ ...styles.fill, width: `${s.level}%`, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            </div>
          </div>
        ))}
      </section>

      <p className="mono" style={styles.instructions}>
        ▸ Pick a <strong>World</strong> (an AWS certification). Its <strong>Levels</strong> are
        the projects under it. Jump into a level to play it as a platformer, or tap ℹ for the case study.
      </p>

      {/* Worlds */}
      <main style={styles.worlds}>
        {WORLDS.map((world) => (
          <section key={world.id} style={{ ...styles.world, borderColor: world.color }}
                   aria-label={world.name}>
            <div style={styles.worldHead}>
              <div>
                <div className="mono" style={{ ...styles.worldName, color: world.color }}>
                  {world.name}
                </div>
                <div className="mono" style={styles.cert}>
                  🎓 {world.cert}{' '}
                  <span style={{
                    color: world.certStatus === 'earned' ? '#34d399'
                      : world.certStatus === 'in-progress' ? '#fbbf24' : '#8aa0c0',
                  }}>
                    ({world.certStatus === 'earned' ? 'earned ✅'
                      : world.certStatus === 'in-progress' ? 'in progress ⏳' : 'planned'})
                  </span>
                </div>
              </div>
            </div>
            <p style={styles.blurb}>{world.blurb}</p>

            <div style={styles.levels}>
              {world.levels.map((lvl) => {
                const locked = lvl.status === 'locked';
                const done = completed.has(lvl.id);
                return (
                  <div key={lvl.id}
                       style={{ ...styles.level, borderColor: locked ? '#3a4159' : lvl.color }}>
                    <div style={styles.levelTop}>
                      <span className="mono" style={{ ...styles.levelTag, background: locked ? '#3a4159' : lvl.color }}>
                        {world.index}-{lvl.index}
                      </span>
                      <span className="mono" style={styles.levelStatus}>
                        {done ? '🏁 cleared' : locked ? '🔒 locked' : lvl.status === 'live' ? '● live' : '◐ building'}
                      </span>
                    </div>
                    <div className="mono" style={styles.levelTitle}>{lvl.title}</div>
                    <p style={styles.levelSummary}>{lvl.summary}</p>
                    <div style={styles.levelBtns}>
                      <button className="btn"
                              onMouseEnter={() => audioOn && audio.sfx('hover')}
                              onClick={() => { audio.sfx('start'); playLevel(lvl.id); }}>
                        ▶ {locked ? 'Peek' : 'Play'} Level
                      </button>
                      <button className="btn pink"
                              onClick={() => { audio.sfx('click'); openPanel(lvl.id); }}
                              aria-label={`Details for ${lvl.title}`}>
                        ℹ Info
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer style={styles.footer} className="mono">
        Contact the developer →{' '}
        <button style={styles.link} onClick={() => { audio.sfx('click'); openPanel('contact'); }}>
          ✉ Open Contact Terminal
        </button>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'fixed', inset: 0, overflowY: 'auto',
    background: 'radial-gradient(ellipse at 50% -10%, #1a1040 0%, #06060f 60%)',
    color: 'var(--text)',
  },
  header: {
    display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between',
    alignItems: 'center', padding: '16px clamp(12px,4vw,40px)',
    borderBottom: '1px solid var(--panel-border)', position: 'sticky', top: 0,
    background: 'rgba(6,6,15,0.8)', backdropFilter: 'blur(8px)', zIndex: 5,
  },
  name: { fontSize: 20, fontWeight: 700 },
  role: { fontSize: 12, color: '#a78bfa' },
  controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  coins: { color: '#ffd23f', fontSize: 15, fontWeight: 700 },
  skills: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '6px 20px', padding: '14px clamp(12px,4vw,40px)',
    maxWidth: 1100, margin: '0 auto', width: '100%',
  },
  skillRow: { display: 'flex', alignItems: 'center', gap: 8 },
  skillName: { fontSize: 10, width: 150, color: '#c7d6ee' },
  track: { flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' },
  fill: { height: '100%', borderRadius: 4 },
  instructions: {
    maxWidth: 1100, margin: '0 auto', padding: '0 clamp(12px,4vw,40px)',
    fontSize: 12, color: '#8aa0c0', lineHeight: 1.7,
  },
  worlds: {
    maxWidth: 1100, margin: '0 auto', padding: 'clamp(12px,3vw,24px) clamp(12px,4vw,40px)',
    display: 'grid', gap: 20,
  },
  world: {
    border: '2px solid', borderRadius: 14, padding: 'clamp(14px,3vw,22px)',
    background: 'rgba(10,12,28,0.6)',
  },
  worldHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  worldName: { fontSize: 20, fontWeight: 700 },
  cert: { fontSize: 12, color: '#c7d6ee', marginTop: 4 },
  blurb: { color: '#8aa0c0', fontSize: 13, margin: '8px 0 14px' },
  levels: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' },
  level: { border: '2px solid', borderRadius: 10, padding: 14, background: 'rgba(6,8,20,0.6)', display: 'flex', flexDirection: 'column' },
  levelTop: { display: 'flex', alignItems: 'center', gap: 8 },
  levelTag: { color: '#06060f', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 4 },
  levelStatus: { fontSize: 11, color: '#8aa0c0' },
  levelTitle: { fontSize: 15, fontWeight: 700, marginTop: 8 },
  levelSummary: { fontSize: 12, color: '#c7d6ee', lineHeight: 1.6, flex: 1, marginTop: 4 },
  levelBtns: { display: 'flex', gap: 8, marginTop: 12 },
  footer: { textAlign: 'center', padding: '20px', borderTop: '1px solid var(--panel-border)', fontSize: 13, color: '#8aa0c0' },
  link: { background: 'none', border: 'none', color: 'var(--neon-pink)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 },
};
