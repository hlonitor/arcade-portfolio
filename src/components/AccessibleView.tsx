import { useState } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE, SKILLS, PROJECTS, CERTIFICATIONS } from '../data/content';
import AccessibleContact from './AccessibleContact';

// A fully static, screen-reader-friendly, motion-free rendering of ALL portfolio
// content. This is the WCAG 2.1 AA fallback (Reliability & Accessibility pillar):
// semantic HTML, real headings, keyboard-navigable, no canvas, no autoplay.
export default function AccessibleView() {
  const exitAccessible = useGame((s) => s.exitAccessible);
  const [showContact, setShowContact] = useState(false);

  return (
    <div style={styles.page} className="scroll-view">
      <style>{scrollCss}</style>
      <a href="#main" className="sr-only">
        Skip to main content
      </a>

      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>{PROFILE.name}</h1>
          <p style={styles.role}>
            {PROFILE.title} — {PROFILE.tagline}
          </p>
        </div>
        <nav style={styles.nav} aria-label="Primary">
          <a
            className="btn"
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <button
            className="btn pink"
            onClick={() => {
              audio.sfx('click');
              exitAccessible();
            }}
          >
            ▶ Enter 3D Arcade
          </button>
        </nav>
      </header>

      <main id="main" style={styles.main}>
        <section aria-labelledby="about-h" style={styles.section}>
          <h2 id="about-h" style={styles.h2}>
            About
          </h2>
          <p style={styles.p}>{PROFILE.bio}</p>
        </section>

        <section aria-labelledby="skills-h" style={styles.section}>
          <h2 id="skills-h" style={styles.h2}>
            Skills
          </h2>
          <ul style={styles.skillList}>
            {SKILLS.map((s) => (
              <li key={s.name} style={styles.skillItem}>
                <div style={styles.skillHead}>
                  <span>{s.name}</span>
                  <span aria-hidden="true">{s.level}%</span>
                </div>
                <div
                  style={styles.barTrack}
                  role="meter"
                  aria-valuenow={s.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.name} proficiency`}
                >
                  <div style={{ ...styles.barFill, width: `${s.level}%`, background: s.color }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="proj-h" style={styles.section}>
          <h2 id="proj-h" style={styles.h2}>
            Projects
          </h2>
          <div style={styles.grid}>
            {PROJECTS.map((p) => (
              <article
                key={p.id}
                style={{
                  ...styles.projCard,
                  borderColor: p.status === 'locked' ? '#334155' : p.color,
                  opacity: p.status === 'locked' ? 0.6 : 1,
                }}
              >
                <div style={styles.projTop}>
                  <span style={{ ...styles.level, background: p.color }}>L{p.level}</span>
                  <span style={styles.projStatus}>
                    {p.status === 'locked'
                      ? '🔒 Locked'
                      : p.status === 'live'
                        ? '● Live'
                        : '◐ Building'}
                  </span>
                </div>
                <h3 style={styles.h3}>{p.title}</h3>
                <p style={styles.p}>{p.summary}</p>
                {p.status !== 'locked' && (
                  <>
                    <p style={styles.stackLine}>
                      <strong>Stack:</strong> {p.stack.join(' · ')}
                    </p>
                    <details style={styles.details}>
                      <summary style={styles.summary}>Mission briefing</summary>
                      <p style={{ ...styles.p, whiteSpace: 'pre-line' }}>{p.detail}</p>
                    </details>
                    <div style={styles.projLinks}>
                      {p.repoUrl && (
                        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                          View code ↗
                        </a>
                      )}
                      {p.demoUrl && (
                        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                          Live demo ↗
                        </a>
                      )}
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="cert-h" style={styles.section}>
          <h2 id="cert-h" style={styles.h2}>
            Certifications
          </h2>
          <ul style={styles.certList}>
            {CERTIFICATIONS.map((c) => (
              <li key={c.name} style={styles.certItem}>
                {c.status === 'earned' ? '✅' : '⏳'} {c.name}
                <span style={styles.certStatus}> — {c.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="contact-h" style={styles.section}>
          <h2 id="contact-h" style={styles.h2}>
            Contact
          </h2>
          {showContact ? (
            <AccessibleContact />
          ) : (
            <button
              className="btn"
              onClick={() => {
                audio.sfx('click');
                setShowContact(true);
              }}
            >
              ✉ Open contact form
            </button>
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        <p style={styles.p}>
          © {PROFILE.name} · Built with React Three Fiber. This is the accessible
          2D view — <button
            style={styles.linkBtn}
            onClick={() => exitAccessible()}
          >
            switch to the 3D arcade
          </button>
          .
        </p>
      </footer>
    </div>
  );
}

const scrollCss = `
  .scroll-view { overflow-y: auto !important; }
  .scroll-view a { text-decoration: underline; }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'fixed',
    inset: 0,
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #0a0a1a, #06060f)',
    color: 'var(--text)',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px clamp(16px, 5vw, 64px)',
    borderBottom: '1px solid var(--panel-border)',
  },
  h1: { margin: 0, fontSize: 'clamp(24px,5vw,40px)' },
  role: { margin: '6px 0 0', color: '#a78bfa' },
  nav: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  main: { maxWidth: 900, margin: '0 auto', padding: 'clamp(16px,5vw,48px)' },
  section: { marginBottom: 40 },
  h2: {
    fontSize: 22,
    borderLeft: '4px solid var(--neon-cyan)',
    paddingLeft: 12,
    color: 'var(--neon-cyan)',
  },
  h3: { fontSize: 18, margin: '4px 0 8px' },
  p: { lineHeight: 1.7, color: '#c7d6ee' },
  skillList: { listStyle: 'none', padding: 0, display: 'grid', gap: 14 },
  skillItem: {},
  skillHead: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 },
  barTrack: {
    height: 12,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  barFill: { height: '100%', borderRadius: 6 },
  grid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
  projCard: {
    border: '2px solid',
    borderRadius: 10,
    padding: 16,
    background: 'rgba(10,12,28,0.6)',
  },
  projTop: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 },
  level: { color: '#06060f', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 4 },
  projStatus: { fontSize: 12, color: '#8aa0c0' },
  stackLine: { fontSize: 13, color: '#8aa0c0' },
  details: { marginTop: 8 },
  summary: { cursor: 'pointer', color: 'var(--neon-cyan)', fontSize: 14 },
  projLinks: { display: 'flex', gap: 16, marginTop: 10, fontSize: 14 },
  certList: { listStyle: 'none', padding: 0, display: 'grid', gap: 8 },
  certItem: { fontSize: 15 },
  certStatus: { color: '#8aa0c0', fontSize: 13 },
  footer: {
    borderTop: '1px solid var(--panel-border)',
    padding: '24px clamp(16px,5vw,64px)',
    textAlign: 'center',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--neon-cyan)',
    textDecoration: 'underline',
    cursor: 'pointer',
    font: 'inherit',
    padding: 0,
  },
};
