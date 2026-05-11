import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import ProtocolBadge from '../components/ProtocolBadge';
import * as api from '../services/api';
import RestraintMonitor from '../plugins/RestraintMonitor';

const ActiveSession: React.FC = () => {
  const history = useHistory();
  const { activeSession, setActiveSession, setSessionResult } = useApp();
  const [timeLeft, setTimeLeft] = useState(activeSession?.duration || 0);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [failing, setFailing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = useCallback(async () => {
    if (!activeSession) return;
    try {
      const data = await api.completeSession(activeSession.id);
      setSessionResult(data);
      setActiveSession(null);
      history.push('/session-result');
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  }, [activeSession, history, setActiveSession, setSessionResult]);

  const handleFail = useCallback(async () => {
    if (!activeSession) return;
    setFailing(true);
    try {
      const data = await api.failSession(activeSession.id);
      setSessionResult(data);
      setActiveSession(null);
      history.push('/session-result');
    } catch (err) {
      console.error('Failed to fail session:', err);
    } finally {
      setFailing(false);
    }
  }, [activeSession, history, setActiveSession, setSessionResult]);

  useEffect(() => {
    if (!activeSession) { history.replace('/dashboard'); return; }

    RestraintMonitor.startMonitoring();

    const violationListener = (RestraintMonitor as any).addListener('onViolation', (data: any) => {
      console.log('Violation detected during active session:', data);
      api.logViolation({
        sessionId: activeSession.id,
        userId: activeSession.user_id,
        type: data.type,
        data: data.packageName || data.domain || 'unknown',
        category: data.category || 'general',
        severity: data.severity || 'low',
        timestamp: new Date().toISOString(),
        actionTaken: activeSession.strict_mode ? 'session_terminated' : 'warning_issued',
      });
      if (activeSession.strict_mode && data.severity === 'high') { handleFail(); }
    });

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      RestraintMonitor.stopMonitoring();
      // Capacitor addListener() returns Promise<PluginListenerHandle> on web,
      // so .remove may be a property rather than a callable function. Guard both.
      try {
        if (violationListener && typeof violationListener.remove === 'function') {
          violationListener.remove();
        }
      } catch (e) {
        console.warn('Could not remove violation listener:', e);
      }
    };
  }, [activeSession, history, handleComplete, handleFail]);

  if (!activeSession) return null;

  const progress = (timeLeft / activeSession.duration) * 100;
  const stakeAmount = activeSession.stake_mode === 'solana'
    ? `◎ ${(activeSession.stake_amount / 1e9).toFixed(2)} SOL`
    : `₦ ${activeSession.stake_amount.toLocaleString()}`;

  /*
   * Ring size: responsive using CSS custom property so SVG and container stay in sync.
   * We use min(80vw, 300px) as the ring diameter — fits any mobile screen width.
   */
  const ringSize = 'min(80vw, 300px)';
  const ringRadius = 148; /* cx/cy = 150, stroke-width = 4 → r = 150-2 = 148 */
  const circumference = 2 * Math.PI * ringRadius;

  return (
    <div
      className="page-enter"
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% 50%, #080B12 0%, #050816 100%)',
        padding: 'clamp(40px, 10vh, 56px) 24px',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as any,
      }}
    >
      {/* Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '8px' }}>
        <ProtocolBadge label="ENFORCEMENT ACTIVE" variant="primary" glow />
        <ProtocolBadge label="STAKE LOCKED" variant="secondary" />
      </div>

      {/* Timer Area — flex: 1 fills vertical space; ring scales with viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '280px' }}>
        {/* Ring container: uses CSS width/height via ringSize */}
        <div style={{ position: 'relative', width: ringSize, height: ringSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Background ring */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)', overflow: 'visible' }}
            viewBox="0 0 300 300"
          >
            <circle cx="150" cy="150" r={ringRadius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
            <circle
              cx="150" cy="150" r={ringRadius}
              fill="transparent"
              stroke="url(#timerGradient)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14F195" />
                <stop offset="100%" stopColor="#9945FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer text centred inside ring */}
          <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '4px', fontWeight: '800', marginBottom: '12px' }}>
              REMAINING TIME
            </div>
            <div style={{
              fontSize: 'clamp(44px, 14vw, 72px)',
              fontWeight: '900',
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              letterSpacing: '-2px',
            }}>
              {formatTimer(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Info */}
      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '700' }}>
            PROTECTED ASSETS
          </div>
          <div style={{ fontSize: 'clamp(18px, 6vw, 24px)', fontWeight: '900', color: activeSession.stake_mode === 'solana' ? '#14F195' : '#FACC15' }}>
            {stakeAmount}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748B', fontWeight: '800', marginBottom: '4px' }}>MONITORING</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#14F195' }}>SHIELD ON</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748B', fontWeight: '800', marginBottom: '4px' }}>MODE</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9945FF' }}>STRICT</div>
          </div>
        </div>

        <button
          onClick={() => setIsWarningOpen(true)}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '700', padding: '16px', cursor: 'pointer', letterSpacing: '0.5px' }}
        >
          TERMINATE PROTOCOL (SLASH RISK)
        </button>
      </div>

      {/* Termination Modal */}
      {isWarningOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
          background: 'rgba(5, 8, 22, 0.92)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div
            className="glass-card"
            style={{
              width: '100%', maxWidth: '360px', maxHeight: '85vh', overflowY: 'auto',
              padding: '32px 24px',
              paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
              textAlign: 'center', border: '1px solid rgba(255, 77, 109, 0.3)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 12px' }}>TERMINATE SESSION?</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 24px' }}>
              Forfeiting the protocol will result in an immediate <span style={{ color: '#FF4D6D', fontWeight: '800' }}>SLASH</span> of your security deposit ({stakeAmount}).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PrimaryButton label={failing ? 'SLASHING...' : 'YES, FORFEIT STAKE'} variant="danger" onClick={handleFail} disabled={failing} />
              <PrimaryButton label="BACK TO FOCUS" variant="ghost" onClick={() => setIsWarningOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSession;
