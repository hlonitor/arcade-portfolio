import { useEffect } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { findLevel, findWorldOfLevel } from '../data/content';

// Modal project briefing — shown from the HUD data-node log and when the snake
// eats a project core. Includes the per-project programming-language breakdown.
export default function ProjectPanel({ id }: { id: string }) {
  const closePanel = useGame((s) => s.closePanel);
  const level = findLevel(id);
  const world = findWorldOfLevel(id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { audio.sfx('click'); closePanel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel]);

  if (!level || !world) return null;
  const locked = level.status === 'locked';

  return (
    <div style={styles.backdrop} onClick={closePanel}>
      <div style={{ ...styles.panel, borderColor: level.color }}
           onClick={(e) => e.stopPropagation()}
           role="dialog" aria-modal="true"
           aria-label={`Level ${world.index}-${level.index}: ${level.title}`}>
        <div style={styles.header}>
          <span className="mono" style={{ ...styles.badge, background: level.color }}>
            LEVEL {world.index}-{level.index}
          </span>
          <span className="mono" style={{ ...styles.status, color: locked ? '#64748b' : level.color, borderColor: locked ? '#64748b' : level.color }}>
            {locked ? '🔒 LOCKED' : level.status === 'live' ? '● LIVE' : '◐ BUILDING'}
          </span>
          <button className="btn" style={styles.close} onClick={closePanel} aria-label="Close">✕</button>
        </div>

        <div className="mono" style={styles.worldLine}>🎓 {world.cert}</div>
        <h2 className="mono neon-text" style={{ ...styles.title, color: level.color }}>{level.title}</h2>
        <p style={styles.summary}>{level.summary}</p>

        {!locked && (
          <>
            <div style={styles.tags}>
              {level.tags.map((t) => <span key={t} className="mono" style={styles.tag}>{t}</span>)}
            </div>

            <h3 className="mono" style={styles.sectionTitle}>⚙ TECH STACK</h3>
            <ul style={styles.list}>
              {level.stack.map((s) => <li key={s} className="mono" style={styles.item}>▹ {s}</li>)}
            </ul>

            <h3 className="mono" style={styles.sectionTitle}>▤ MISSION BRIEFING</h3>
            <p style={styles.detail}>{level.detail}</p>
          </>
        )}

        {/* Language breakdown — shown for every level, even locked/planned ones */}
        <div style={{ ...styles.langBox, borderColor: level.color }}>
          <h3 className="mono" style={{ ...styles.sectionTitle, marginTop: 0, color: level.color }}>
            💻 LANGUAGE: {level.language.name.toUpperCase()}
          </h3>
          <p style={styles.langWhy}><strong style={{ color: '#e6f1ff' }}>Why this language:</strong> {level.language.why}</p>
          <div className="mono" style={styles.tipsHeader}>🎯 How to level up your {level.language.name}:</div>
          <ul style={styles.tips}>
            {level.language.tips.map((t, i) => (
              <li key={i} style={styles.tip}>⭐ {t}</li>
            ))}
          </ul>
        </div>

        <div style={styles.links}>
          <button className="btn" onClick={() => { audio.sfx('click'); closePanel(); }}>
            ◀ Back to the game
          </button>
          {level.repoUrl && (
            <a className="btn" href={level.repoUrl} target="_blank" rel="noopener noreferrer"
               onClick={() => audio.sfx('click')}>⌥ View Code ↗</a>
          )}
          {level.demoUrl && (
            <a className="btn pink" href={level.demoUrl} target="_blank" rel="noopener noreferrer"
               onClick={() => audio.sfx('click')}>▶ Live Demo ↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(3,4,12,0.75)', display: 'grid', placeItems: 'center', zIndex: 300, padding: 16, backdropFilter: 'blur(4px)' },
  panel: { background: 'var(--panel)', border: '2px solid var(--neon-cyan)', borderRadius: 12, padding: '20px 24px', maxWidth: 660, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 0 40px rgba(34,211,238,0.25)' },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: { color: '#06060f', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 4 },
  status: { fontSize: 11, padding: '3px 8px', border: '1px solid', borderRadius: 4 },
  close: { marginLeft: 'auto', padding: '4px 10px', fontSize: 14 },
  worldLine: { fontSize: 12, color: '#a78bfa', marginTop: 14 },
  title: { fontSize: 24, margin: '4px 0 6px' },
  summary: { color: '#c7d6ee', lineHeight: 1.6, fontSize: 15 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { fontSize: 10, padding: '3px 8px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 12, color: '#c4b5fd' },
  sectionTitle: { fontSize: 12, color: '#8aa0c0', marginTop: 20, marginBottom: 6 },
  list: { margin: 0, padding: 0, listStyle: 'none' },
  item: { fontSize: 13, color: '#c7d6ee', padding: '2px 0' },
  detail: { color: '#c7d6ee', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-line' },
  langBox: { marginTop: 20, padding: '14px 16px', border: '1px solid', borderRadius: 10, background: 'rgba(6,8,20,0.5)' },
  langWhy: { fontSize: 14, color: '#c7d6ee', lineHeight: 1.7, margin: '0 0 10px' },
  tipsHeader: { fontSize: 12, color: '#8aa0c0', marginBottom: 6 },
  tips: { margin: 0, paddingLeft: 0, listStyle: 'none' },
  tip: { fontSize: 13, color: '#d7e3f5', lineHeight: 1.6, padding: '3px 0' },
  links: { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' },
};
