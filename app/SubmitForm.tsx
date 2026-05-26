'use client';

import { useState } from 'react';

export default function SubmitForm() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json() as { error?: string };

      if (res.ok) {
        setUrl('');
        setStatus('success');
        setMessage("Pizza received. You're now part of the problem. In the best way.");
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Try again.');
    }
  }

  return (
    <div className="submit-block">
      <div className="submit-row">
        <input
          type="url"
          placeholder="instagram.com/p/your-ooni-pizza"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          disabled={status === 'loading'}
          className="submit-input"
        />
        <button
          onClick={submit}
          disabled={status === 'loading'}
          className="submit-btn"
        >
          {status === 'loading' ? 'Adding...' : 'Add your pizza'}
        </button>
      </div>
      {message && (
        <p className={`submit-feedback ${status}`}>{message}</p>
      )}
    </div>
  );
}
