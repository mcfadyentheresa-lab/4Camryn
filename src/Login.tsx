import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <h2>Check your email</h2>
        <p>We sent a sign-in link to {email}. Click it to continue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <h2>Sign in</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '12px' }}
        />
        <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
          {status === 'sending' ? 'Sending...' : 'Send sign-in link'}
        </button>
        {status === 'error' && <p style={{ color: 'red', marginTop: '12px' }}>{errorMsg}</p>}
      </form>
    </div>
  );
}
