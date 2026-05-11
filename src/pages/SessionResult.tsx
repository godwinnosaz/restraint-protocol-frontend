import React from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import AIInsightCard from '../components/AIInsightCard';
import ProtocolBadge from '../components/ProtocolBadge';

const SessionResult: React.FC = () => {
  const history = useHistory();
  const { sessionResult } = useApp();

  if (!sessionResult) {
    history.replace('/dashboard');
    return null;
  }

  const { session, insight } = sessionResult;
  const isSuccess = session.status === 'completed';

  const stakeDisplay = session.stake_mode === 'solana'
    ? `◎ ${(session.stake_amount / 1e9).toFixed(2)} SOL`
    : `₦ ${session.stake_amount.toLocaleString()}`;

  return (
    /*
     * Removed minHeight+flex+justifyContent wrapper — let content flow naturally.
     * Padding bottom clears the tab bar that reappears after leaving active session.
     */
    <div
      className="page-enter max-width-container"
      style={{
        padding: 'clamp(48px, 12vh, 72px) 24px',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
        background: isSuccess
          ? 'radial-gradient(circle at 50% 0%, rgba(20, 241, 149, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 50% 0%, rgba(255, 77, 109, 0.15) 0%, transparent 50%)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 3s ease-in-out infinite' }}>
          {isSuccess ? '🏆' : '💀'}
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 7vw, 32px)',
            fontWeight: '900',
            margin: '0 0 8px',
            color: isSuccess ? '#14F195' : '#FF4D6D',
          }}>
            {isSuccess ? 'PROTOCOL MASTERED' : 'PROTOCOL BREACH'}
          </h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', fontWeight: '500' }}>
            {isSuccess
              ? `You successfully focused for ${Math.floor(session.duration / 60)} minutes.`
              : 'Discipline failed. Session terminated prematurely.'}
          </p>
        </div>

        <div className="glass-card" style={{
          padding: '24px',
          marginBottom: '32px',
          border: `1px solid ${isSuccess ? 'rgba(20, 241, 149, 0.2)' : 'rgba(255, 77, 109, 0.2)'}`,
          background: isSuccess ? 'rgba(20, 241, 149, 0.02)' : 'rgba(255, 77, 109, 0.02)',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '2px', fontWeight: '800', marginBottom: '20px' }}>
            STAKE RESOLUTION
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              fontSize: 'clamp(24px, 8vw, 40px)',
              fontWeight: '900',
              color: isSuccess ? '#14F195' : '#FF4D6D',
              letterSpacing: '-1px',
              wordBreak: 'break-word',
            }}>
              {isSuccess ? '+' : '-'}{stakeDisplay}
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <ProtocolBadge
              label={isSuccess ? 'STAKE RETURNED' : 'STAKE SLASHED'}
              variant={isSuccess ? 'primary' : 'danger'}
              glow={!isSuccess}
            />
          </div>
        </div>

        {insight && (
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '800' }}>
              ◈ POST-SESSION ANALYSIS
            </div>
            <AIInsightCard
              message={insight.recommendation || insight.assessment}
              type={isSuccess ? 'summary' : 'risk'}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <PrimaryButton label="Return to Command Center" variant="primary" onClick={() => history.push('/dashboard')} />
        <PrimaryButton label="View Protocol History" variant="ghost" onClick={() => history.push('/profile')} />
      </div>
    </div>
  );
};

export default SessionResult;
