import { useEffect } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROJECTS } from '../data/content';

// Modal "level briefing" that appears when a project kiosk is activated.
export default function ProjectPanel({ id }: { id: string }) {
  const closePanel = useGame((s) => s.closePanel);
  const project = PROJECTS.find((p) => p.id === id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audio.sfx('click');
        closePanel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel]);

  if (!project) return null;

  const locked = project.status === 'locked';

  return (
    <div style={styles.backdrop} onClick={closePanel}>
      <div
        style={{ ...styles.panel, borderColor: project.color }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Level ${project.level}: ${project.title}`}
      >
        <div style={styles.header}>
          <span className="mono" style={{ ...styles.badge, background: project.color }}>
            LEVEL {project.level}
          </span>
          <span
            className="mono"
            style={{
              ...styles.status,
              color: locked ? '#64748b' : project.color,
              borderColor: locked ? '#64748b' : project.color,
            }}
          >
            {locked ? '🔒 LOCKED' : project.status === 'live' ? '● LIVE' : '◐ BUILDING'}
          </span>
          <button className="btn" style={styles.close} onClick={closePanel} aria-label="Close">
            ✕
          </button>
        </div>

        <h2 className="mono neon-text" style={{ ...styles.title, color: project.color }}>
          {project.title}
        </h2>
        <p style={styles.summary}>{project.summary}</p>

        {!locked && (
          <>
            <div style={styles.tags}>
              {project.tags.map((t) => (
                <span key={t} className="mono" style={styles.tag}>
                  {t}
                </span>
              ))}
            </div>

            <h3 className="mono" style={styles.sectionTitle}>
              ⚙ TECH STACK
            </h3>
            <ul style={styles.stackList}>
              {project.stack.map((s) => (
                <li key={s} className="mono" style={styles.stackItem}>
                  ▹ {s}
                </li>
              ))}
            </ul>

            <h3 className="mono" style={styles.sectionTitle}>
              ▤ MISSION BRIEFING
            </h3>
            <p style={styles.detail}>{project.detail}</p>

            <div style={styles.links}>
              {project.repoUrl && (
                <a
                  className="btn"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audio.sfx('click')}
                >
                  ⌥ View Code ↗
                </a>
              )}
              {project.demoUrl && (
                <a
                  className="btn pink"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audio.sfx('click')}
                >
                  ▶ Live Demo ↗
                </a>
              )}
            </div>
          </>
        )}

        {locked && (
          <p className="mono" style={styles.lockedMsg}>
            {project.detail}
            <br />
            <br />
            🔓 Check back soon — new IT/AI quests are in development.
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3,4,12,0.72)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 300,
    padding: 16,
    backdropFilter: 'blur(4px)',
  },
  panel: {
    background: 'var(--panel)',
    border: '2px solid var(--neon-cyan)',
    borderRadius: 12,
    padding: '20px 24px',
    maxWidth: 640,
    width: '100%',
    maxHeight: '86vh',
    overflowY: 'auto',
    boxShadow: '0 0 40px rgba(34,211,238,0.25)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: {
    color: '#06060f',
    fontWeight: 700,
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 4,
  },
  status: { fontSize: 11, padding: '3px 8px', border: '1px solid', borderRadius: 4 },
  close: { marginLeft: 'auto', padding: '4px 10px', fontSize: 14 },
  title: { fontSize: 24, margin: '14px 0 6px' },
  summary: { color: '#c7d6ee', lineHeight: 1.6, fontSize: 15 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: {
    fontSize: 10,
    padding: '3px 8px',
    background: 'rgba(167,139,250,0.15)',
    border: '1px solid rgba(167,139,250,0.4)',
    borderRadius: 12,
    color: '#c4b5fd',
  },
  sectionTitle: { fontSize: 12, color: '#8aa0c0', marginTop: 20, marginBottom: 6 },
  stackList: { margin: 0, padding: 0, listStyle: 'none' },
  stackItem: { fontSize: 13, color: '#c7d6ee', padding: '2px 0' },
  detail: { color: '#c7d6ee', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-line' },
  links: { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' },
  lockedMsg: { color: '#8aa0c0', lineHeight: 1.7, marginTop: 16, fontSize: 14 },
};
