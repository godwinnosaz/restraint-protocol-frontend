import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      history.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authorization Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
     * Keyboard-safe scroll pattern:
     * - overflow-y: auto so the page scrolls when keyboard pushes content up
     * - min-height: 100svh (small viewport height) collapses with keyboard
     * - padding-top centres content visually; no justifyContent: center trap
     */
    <div
      className="page-enter"
      style={{
        minHeight: '100svh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as any,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(48px, 12vh, 96px) 24px clamp(32px, 8vh, 64px)',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
      }}
    >
      <div className="max-width-container" style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontSize: 'clamp(28px, 9vw, 40px)',
            fontWeight: '900',
            letterSpacing: '-2px',
            marginBottom: '8px',
            lineHeight: 1.1,
          }}>
            RESTRAINT <span className="text-gradient-primary">PROTOCOL</span>
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8', letterSpacing: '2px', fontWeight: '800' }}>
            AUTHORIZE ACCESS TO ENGINE
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          {error && (
            <div className="glass-card" style={{
              padding: '14px',
              background: 'rgba(255, 77, 109, 0.05)',
              borderColor: 'rgba(255, 77, 109, 0.2)',
              color: '#FF4D6D',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '700',
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '10px', letterSpacing: '1.5px', fontWeight: '800' }}>IDENTIFIER (EMAIL)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@protocol.sh"
              required
              style={{
                width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(20, 241, 149, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '10px', letterSpacing: '1.5px', fontWeight: '800' }}>ACCESS KEY (PASSWORD)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(20, 241, 149, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <PrimaryButton
            label={loading ? 'AUTHORIZING...' : 'LOG IN'}
            type="submit"
            disabled={loading}
            style={{ marginTop: '12px' }}
          />
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748B', fontWeight: '600' }}>
          New operator?{' '}
          <Link to="/register" style={{ color: '#14F195', textDecoration: 'none', fontWeight: '800' }}>
            Register
          </Link>
        </div>

        <div style={{ margin: '40px 0 24px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />

        <button
          onClick={loginAsDemo}
          disabled={loading}
          style={{
            width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px',
            color: '#64748B', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
        >
          INITIALIZE DEMO ACCESS
        </button>
      </div>
    </div>
  );
};

export default Login;
