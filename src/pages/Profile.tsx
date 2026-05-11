import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import AIInsightCard from '../components/AIInsightCard';
import ProtocolBadge from '../components/ProtocolBadge';
import * as api from '../services/api';
import { useWallet } from '@solana/wallet-adapter-react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const Profile: React.FC = () => {
  const { stats, aiInsight, loadStats, setAiInsight } = useApp();
  const { user, logout } = useAuth();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (user) {
      loadStats();
      api.getUserSummary(String(user.uuid || user.id))
        .then(d => setAiInsight(d.summary))
        .catch(() => {});
    }
  }, [user, loadStats, setAiInsight]);

  const s = stats;
  const u = user;

  return (
    <div
      className="page-enter max-width-container"
      style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header — logout moved inline so it doesn't absolute-overlap content */}
      <div style={{ padding: 'clamp(48px, 10vh, 72px) 24px 32px', textAlign: 'center' }}>
        {/* Top row: logout right-aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255, 77, 109, 0.1)', border: '1px solid rgba(255, 77, 109, 0.2)',
              color: '#FF4D6D', padding: '8px 16px', borderRadius: '12px',
              fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px',
            }}
          >
            LOGOUT
          </button>
        </div>

        <div style={{
          width: '96px', height: '96px', borderRadius: '32px',
          background: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '900', color: '#050816', boxShadow: '0 0 30px rgba(20, 241, 149, 0.2)',
        }}>
          {u?.username?.charAt(0).toUpperCase() || 'O'}
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: '900', letterSpacing: '-0.5px' }}>
          {u?.username || 'Operator'}
        </h1>
        <div style={{
          fontSize: '14px', color: '#64748B', fontWeight: '500', marginBottom: '16px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {u?.email}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <ProtocolBadge
            label={`${(u?.risk_level || 'MED').toUpperCase()} RISK`}
            variant={u?.risk_level === 'high' ? 'danger' : u?.risk_level === 'medium' ? 'warning' : 'primary'}
          />
          {publicKey && (
            <ProtocolBadge
              label={`◎ ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`}
              variant="secondary"
            />
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Aggregate Focus Score */}
        <div className="glass-card" style={{ padding: 'clamp(20px, 6vw, 32px) 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '3px', fontWeight: '800', marginBottom: '12px' }}>
            AGGREGATE FOCUS POWER
          </div>
          <div className="font-score" style={{ fontWeight: '900', color: '#fff', letterSpacing: '-3px' }}>
            {s?.focus_score || u?.focus_score || 0}
          </div>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Total active enforcement: {formatTime(s?.total_focus_time || u?.total_focus_time || 0)}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatCard label="Persistence" value={`${s?.streak || 0}d`} icon="🔥" color="#FACC15" />
          <StatCard label="Compliance" value={`${s?.success_rate || 0}%`} icon="◉" color="#14F195" />
          <StatCard label="Operations" value={s?.total_sessions || 0} icon="⚡" color="#00C2FF" />
          <StatCard label="Violations" value={s?.failed_sessions || 0} icon="✗" color="#FF4D6D" />
        </div>

        {/* Financial Summary — use auto column for divider to avoid 1px collapse */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '20px',
          alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' }}>STAKED</div>
            <div style={{ fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '900', color: '#FACC15' }}>
              ₦{(s?.total_staked || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' }}>SLASHED</div>
            <div style={{ fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '900', color: '#FF4D6D' }}>
              ₦{(s?.total_slashed || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI Behavioral Analysis */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
            ◈ BEHAVIORAL ANALYSIS
          </div>
          <AIInsightCard message={aiInsight?.assessment || 'Maintaining optimal protocol compliance. Continue session streaks.'} type="summary" />
        </div>

        {/* Operation Log */}
        {s?.recent_sessions && s.recent_sessions.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
              OPERATION LOG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {s.recent_sessions.map((sess: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{formatTime(sess.duration)}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>
                      {new Date(sess.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: sess.status === 'completed' ? '#14F195' : '#FF4D6D' }}>
                      {sess.status === 'completed' ? 'MASTERED' : 'BREACHED'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', fontWeight: '700' }}>
                      {sess.stake_mode === 'solana' ? '◎' : '₦'}{sess.stake_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
