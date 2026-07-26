import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('idle');
      setStep('code');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus('verifying');
    setErrorMsg('');
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    }
    // On success, the onAuthStateChange listener in App.tsx picks up the new session automatically.
  };

  if (step === 'code') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <h2>Enter your code</h2>
        <p>We sent a 6-digit code to {email}. Enter it below.</p>
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
            style={{ width: '100%', padding: '10px', fontSize: '20px', letterSpacing: '4px', textAlign: 'center', marginBottom: '12px' }}
          />
          <button type="submit" disabled={status === 'verifying'} style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
            {status === 'verifying' ? 'Verifying...' : 'Verify code'}
          </button>
          {status === 'error' && <p style={{ color: 'red', marginTop: '12px' }}>{errorMsg}</p>}
        </form>
        <button
          onClick={() => { setStep('email'); setCode(''); setStatus('idle'); setErrorMsg(''); }}
          style={{ marginTop: '16px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <h2>Sign in</h2>
      <form onSubmit={handleSendCode}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '12px' }}
        />
        <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
          {status === 'sending' ? 'Sending...' : 'Send code'}
        </button>
        {status === 'error' && <p style={{ color: 'red', marginTop: '12px' }}>{errorMsg}</p>}
      </form>
    </div>
  );
}
