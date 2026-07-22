import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';

// Discrete, compliant cookie/consent banner. This site stores NO tracking
// cookies by default — the banner documents that and records the visitor's
// choice in localStorage so it isn't shown again.
export default function CookieBanner() {
  const cookieChoice = useGame((s) => s.cookieChoice);
  const setCookieChoice = useGame((s) => s.setCookieChoice);

  if (cookieChoice !== 'unset') return null;

  const choose = (c: 'accepted' | 'declined') => {
    audio.sfx('click');
    try {
      localStorage.setItem('cookie-consent', c);
    } catch {
      /* storage may be blocked — choice still applies for this session */
    }
    setCookieChoice(c);
  };

  return (
    <div style={styles.wrap} role="region" aria-label="Cookie consent">
      <p className="mono" style={styles.text}>
        🍪 This portfolio stores only a small preference (your consent + settings)
        in your browser — no third-party tracking. EmailJS is used only when you
        submit the contact form.
      </p>
      <div style={styles.actions}>
        <button className="btn" onClick={() => choose('accepted')}>
          Accept
        </button>
        <button className="btn pink" onClick={() => choose('declined')}>
          Decline
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    background: 'var(--panel)',
    borderTop: '2px solid var(--panel-border)',
    backdropFilter: 'blur(8px)',
  },
  text: { fontSize: 12, color: 'var(--muted)', margin: 0, maxWidth: 720, lineHeight: 1.6 },
  actions: { display: 'flex', gap: 10 },
};
