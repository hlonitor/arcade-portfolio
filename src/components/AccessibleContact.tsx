import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { PROFILE } from '../data/content';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Plain, accessible version of the contact form (no terminal theming), sharing
// the same EmailJS backend. Labels are properly associated for screen readers.
export default function AccessibleContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONFIGURED) {
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
        { from_name: form.name, reply_to: form.email, message: form.message },
        { publicKey: PUBLIC_KEY! },
      );
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <p style={{ color: '#34d399', lineHeight: 1.7 }}>
        ✓ Message sent — thanks, {form.name}. I'll reply to {form.email} soon.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
      <label style={label}>
        Name
        <input
          style={input}
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label style={label}>
        Email
        <input
          style={input}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label style={label}>
        Message
        <textarea
          style={{ ...input, minHeight: 100 }}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {!CONFIGURED && (
        <p style={{ fontSize: 13, color: '#fbbf24' }}>
          Live email isn't configured on this deployment — submitting opens your
          mail client. You can also reach me on{' '}
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          .
        </p>
      )}
      {status === 'error' && (
        <p style={{ color: '#f87171' }}>Something went wrong — please try LinkedIn.</p>
      )}
      <button className="btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

const label: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
  color: '#c7d6ee',
};
const input: React.CSSProperties = {
  background: '#0a0f1c',
  border: '1px solid var(--panel-border)',
  borderRadius: 6,
  color: '#e6f1ff',
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
};
