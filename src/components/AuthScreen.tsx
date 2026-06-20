import { useState } from 'react';
import {
  Trees, Mail, Lock, User, Eye, EyeOff,
  ChevronRight, Leaf, LogIn, UserPlus, WifiOff
} from 'lucide-react';
import type { UseAuthReturn } from '../hooks/useAuth';

interface AuthScreenProps {
  auth: UseAuthReturn;
  onContinueAsGuest: () => void;
}

type AuthMode = 'signin' | 'signup';

export default function AuthScreen({ auth: authHook, onContinueAsGuest }: AuthScreenProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    authError,
    clearError,
    isFirebaseConfigured
  } = authHook;

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    clearError();
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>

      {/* Background decorative blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: 'var(--primary)', marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
            animation: 'fadeIn 0.4s ease'
          }}>
            <Leaf size={32} color="white" fill="white" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
            fontWeight: 800, color: 'var(--text-main)', margin: 0
          }}>
            EcoSphere
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Track your carbon footprint. Save the planet.
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="card" style={{
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.5s ease'
        }}>

          {/* Firebase Not Configured Banner */}
          {!isFirebaseConfigured && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(245,158,11,0.1)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem'
            }}>
              <WifiOff size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                <strong>Firebase not configured yet.</strong> Auth buttons are disabled.
                Set up your Firebase project and add your API keys to{' '}
                <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-app)', padding: '1px 4px', borderRadius: '3px' }}>
                  src/firebase.ts
                </code>{' '}
                to enable accounts. You can still <strong>Continue as Guest</strong> below.
              </div>
            </div>
          )}


          {/* Mode Toggle Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '0.25rem',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px',
            marginBottom: '1.5rem'
          }}>
            {(['signin', 'signup'] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {m === 'signin' ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <LogIn size={14} /> Sign In
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <UserPlus size={14} /> Create Account
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isFirebaseConfigured ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s ease',
              opacity: isFirebaseConfigured ? 1 : 0.5,
              marginBottom: '1rem'
            }}
            onMouseEnter={e => {
              if (!isFirebaseConfigured) return;
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary-light)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-card)';
            }}
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'grid', gap: '0.75rem' }}>

            {/* Display Name — only on signup */}
            {mode === 'signup' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  id="auth-displayname"
                  type="text"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="form-control"
                  style={{
                    paddingLeft: '2.5rem',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                id="auth-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
                className="form-control"
                style={{
                  paddingLeft: '2.5rem',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                required
                className="form-control"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.7rem 2.5rem 0.7rem 2.5rem',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error display */}
            {authError && (
              <div style={{
                padding: '0.65rem 0.75rem',
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                ⚠️ {authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={!isFirebaseConfigured || isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                gap: '0.5rem',
                opacity: isFirebaseConfigured ? 1 : 0.5,
                cursor: isFirebaseConfigured ? 'pointer' : 'not-allowed'
              }}
            >
              {isSubmitting ? (
                <span>Signing in…</span>
              ) : mode === 'signin' ? (
                <><LogIn size={16} /> Sign In to My Account</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
              {!isSubmitting && <ChevronRight size={16} />}
            </button>
          </form>

        </div>

        {/* Guest option — below the card */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            id="guest-continue-btn"
            onClick={onContinueAsGuest}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Trees size={14} />
            Continue as Guest (data stays on this device)
          </button>
        </div>

        {/* Footer tagline */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '1.5rem'
        }}>
          🌍 Your data is encrypted and stored securely on Google Firebase.
        </p>

      </div>
    </div>
  );
}
