import { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { PROFILE } from '../data/content';

// EmailJS config comes from build-time env (public, client-side identifiers).
// If unset, the form degrades gracefully to a mailto/LinkedIn fallback so the
// site never ships a broken contact path.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactTerminal() {
  const closePanel = useGame((s) => s.closePanel);
  const unlock = useGame((s) => s.unlock);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePanel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.sfx('click');
    setErr('');

    if (!CONFIGURED) {
      // Fallback: open the visitor's mail client pre-filled.
      const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        {
          from_name: form.name,
          reply_to: form.email,
          message: form.message,
        },
        { publicKey: PUBLIC_KEY! },
      );
      setStatus('sent');
      audio.sfx('achievement');
      unlock('First Contact — sent a message');
    } catch (e) {
      setStatus('error');
      setErr(e instanceof Error ? e.message : 'Transmission failed.');
    }
  };

  return (
    <div style={styles.backdrop} onClick={closePanel}>
      <div
        style={styles.terminal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Contact terminal"
      >
        <div style={styles.bar}>
          <span className="mono" style={{ color: '#34d399' }}>
            ● ● ●
          </span>
          <span className="mono" style={styles.barTitle}>
            contact@{PROFILE.name.split(' ')[0].toLowerCase()} — secure terminal
          </span>
          <button className="btn" style={styles.close} onClick={closePanel} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={styles.screen}>
          <p className="mono" style={styles.prompt}>
            &gt; Establishing encrypted channel to {PROFILE.name}…
            <br />
            &gt; Ready. Enter your credentials, operative.
          </p>

          {status === 'sent' ? (
            <div className="mono" style={styles.success}>
              ✓ MESSAGE TRANSMITTED.
              <br />
              <br />
              Thanks, {form.name || 'operative'} — I'll reply to {form.email || 'you'} soon.
              <br />
              <br />
              <button
                className="btn"
                onClick={() => {
                  setStatus('idle');
                  setForm({ name: '', email: '', message: '' });
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={styles.form}>
              <label className="mono" style={styles.label}>
                &gt; NAME
                <input
                  className="mono"
                  style={styles.input}
                  required
                  value={form.name}
                  onFocus={() => audio.sfx('hover')}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="your_name"
                />
              </label>
              <label className="mono" style={styles.label}>
                &gt; EMAIL
                <input
                  className="mono"
                  style={styles.input}
                  type="email"
                  required
                  value={form.email}
                  onFocus={() => audio.sfx('hover')}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@domain.com"
                />
              </label>
              <label className="mono" style={styles.label}>
                &gt; MESSAGE
                <textarea
                  className="mono"
                  style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
                  required
                  value={form.message}
                  onFocus={() => audio.sfx('hover')}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Type your transmission…"
                />
              </label>

              {!CONFIGURED && (
                <p className="mono" style={styles.note}>
                  ⚠ Live email not configured on this deployment — submitting opens
                  your mail client instead. (Set the EmailJS build vars to enable
                  in-page send.)
                </p>
              )}
              {status === 'error' && (
                <p className="mono" style={{ ...styles.note, color: '#f87171' }}>
                  ✕ {err || 'Transmission failed. Try LinkedIn below.'}
                </p>
              )}

              <div style={styles.actions}>
                <button className="btn" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'TRANSMITTING…' : '▶ SEND TRANSMISSION'}
                </button>
                <a
                  className="btn pink"
                  href={PROFILE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audio.sfx('click')}
                >
                  in · LinkedIn ↗
                </a>
              </div>
            </form>
          )}
        </div>
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
  terminal: {
    width: '100%',
    maxWidth: 560,
    background: '#050810',
    border: '2px solid var(--neon-green)',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(52,211,153,0.3)',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: 'rgba(52,211,153,0.12)',
    borderBottom: '1px solid rgba(52,211,153,0.4)',
  },
  barTitle: { fontSize: 11, color: '#8aa0c0' },
  close: { marginLeft: 'auto', padding: '2px 8px', fontSize: 12 },
  screen: { padding: '16px 18px', overflowY: 'auto' },
  prompt: { color: '#34d399', fontSize: 12, lineHeight: 1.7, marginTop: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 11, color: '#8aa0c0', display: 'flex', flexDirection: 'column', gap: 4 },
  input: {
    background: '#0a0f1c',
    border: '1px solid rgba(52,211,153,0.4)',
    borderRadius: 4,
    color: '#e6f1ff',
    padding: '10px 12px',
    fontSize: 14,
  },
  note: { fontSize: 11, color: '#fbbf24', lineHeight: 1.6, margin: 0 },
  success: { color: '#34d399', fontSize: 15, lineHeight: 1.7, padding: '12px 0' },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 },
};
