import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import PrimaryButton from '../components/PrimaryButton';
import AIInsightCard from '../components/AIInsightCard';
import ProtocolBadge from '../components/ProtocolBadge';
import * as api from '../services/api';
import RestraintMonitor from '../plugins/RestraintMonitor';
import { useWallet } from '@solana/wallet-adapter-react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { user, stats, loadStats, isDemoMode, setIsDemoMode } = useApp();
  const { publicKey } = useWallet();
  const [headerTaps, setHeaderTaps] = useState(0);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [hasUsagePermission, setHasUsagePermission] = useState(true);
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(true);

  useEffect(() => {
    const checkPermissionsAndSync = async () => {
      try {
        const usage = await RestraintMonitor.hasUsageAccessPermission();
        setHasUsagePermission(usage.granted);
        const accessibility = await RestraintMonitor.hasAccessibilityPermission();
        setHasAccessibilityPermission(accessibility.granted);
        const blacklist = await api.getBlacklist();
        await RestraintMonitor.updateBlacklist(blacklist);
      } catch (err) {
        console.warn('Sync/Permission check failed', err);
      }
    };
    checkPermissionsAndSync();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
      api.getUserSummary(user.uuid || user.id)
        .then(res => setAiSummary(res.summary))
        .catch(() => setAiSummary(null));
    }
  }, [user, loadStats]);

  const handleHeaderTap = () => {
    setHeaderTaps(t => t + 1);
    if (headerTaps + 1 >= 5) { setIsDemoMode(!isDemoMode); setHeaderTaps(0); }
  };

  const displayStats = stats || {
    focus_score: user?.focus_score || 0,
    streak: user?.streak || 0,
    total_focus_time: user?.total_focus_time || 0,
    success_rate: 0,
    total_staked: 0,
    recent_sessions: [],
  };

  const shortenedWallet = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <div
      className="page-enter max-width-container"
      style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header */}
      <div style={{ padding: 'clamp(40px, 10vh, 56px) 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div onClick={handleHeaderTap} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '2px', fontWeight: '800', marginBottom: '4px' }}>
              RESTRAINT PROTOCOL v1.0
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: '900', letterSpacing: '-0.5px' }}>
              Hi, <span className="text-gradient-primary">{user?.username || 'Operator'}</span>
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
            {isDemoMode && <ProtocolBadge label="Demo Mode" variant="danger" glow />}
            {publicKey && <ProtocolBadge label={shortenedWallet!} variant="secondary" />}
          </div>
        </div>

        <div className="glass-card" style={{
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(20, 241, 149, 0.03)', borderColor: 'rgba(20, 241, 149, 0.1)', flexWrap: 'wrap', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#14F195', boxShadow: '0 0 10px #14F195', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#14F195', letterSpacing: '0.5px' }}>ENFORCEMENT ENGINE ACTIVE</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600' }}>DEVNET</span>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Focus Score Hero */}
        <div className="glass-card" style={{
          padding: 'clamp(20px, 6vw, 32px) 24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(20, 241, 149, 0.08) 0%, rgba(153, 69, 255, 0.08) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '3px', fontWeight: '800', marginBottom: '12px' }}>
            PROTOCOL FOCUS SCORE
          </div>
          <div className="font-hero" style={{
            fontWeight: '900', color: '#fff', lineHeight: 1, letterSpacing: '-4px',
            textShadow: '0 0 30px rgba(20, 241, 149, 0.3)',
          }}>
            {displayStats.focus_score}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '12px', fontWeight: '500' }}>
            {displayStats.total_focus_time > 0
              ? `${formatTime(displayStats.total_focus_time)} focused under protocol`
              : 'No focus sessions recorded yet'}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatCard label="Current Streak" value={`${displayStats.streak}d`} icon="🔥" color="#FACC15" />
          <StatCard label="Success Rate" value={`${displayStats.success_rate}%`} icon="◈" color="#14F195" />
          <StatCard label="Total Staked" value={`₦${(displayStats.total_staked || 0).toLocaleString()}`} icon="🔒" color="#9945FF" />
          <StatCard label="AI Insight" value={aiSummary?.risk_profile || '---'} icon="A" color="#00C2FF" />
        </div>

        {/* Permission Alerts */}
        {(!hasUsagePermission || !hasAccessibilityPermission) && (
          <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 77, 109, 0.05)', borderColor: 'rgba(255, 77, 109, 0.2)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#FF4D6D' }}>PROTOCOL BREACH RISK</span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.5 }}>
              Android enforcement components are inactive. Start session will be disabled until permissions are restored.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!hasUsagePermission && (
                <PrimaryButton label="Enable Usage Access" variant="danger" style={{ padding: '12px' }}
                  onClick={() => RestraintMonitor.requestUsageAccessPermission()} />
              )}
              {!hasAccessibilityPermission && (
                <PrimaryButton label="Enable Accessibility" variant="ghost" style={{ padding: '12px' }}
                  onClick={() => RestraintMonitor.requestAccessibilityPermission()} />
              )}
            </div>
          </div>
        )}

        {/* AI Insight */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '700' }}>
            ◈ GEMMA DIRECTIVE AI
          </div>
          <AIInsightCard
            message={aiSummary?.recommendation || "System stable. Continue protocol enforcement to maximize focus mining."}
            type="advice"
            riskScore={aiSummary?.risk_score}
            riskLevel={aiSummary?.risk_profile}
          />
        </div>

        {/* CTA */}
        <div style={{ marginTop: '10px' }}>
          <PrimaryButton label="Initialize New Session" icon="⚡" variant="primary"
            onClick={() => history.push('/start-session')} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
