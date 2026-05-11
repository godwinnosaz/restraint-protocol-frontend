import React from 'react';

interface StakeCardProps {
  amount: number;
  currency: string;
  status: 'locked' | 'released' | 'slashed' | 'pending';
}

const StakeCard: React.FC<StakeCardProps> = ({ amount, currency, status }) => {
  const statusConfig = {
    locked: { color: '#ffd32a', label: 'LOCKED', icon: '🔒', bg: 'rgba(255,211,42,0.08)' },
    released: { color: '#00c896', label: 'RELEASED', icon: '✓', bg: 'rgba(0,200,150,0.08)' },
    slashed: { color: '#ff4757', label: 'SLASHED', icon: '✗', bg: 'rgba(255,71,87,0.08)' },
    pending: { color: '#888', label: 'PENDING', icon: '○', bg: 'rgba(255,255,255,0.04)' },
  };

  const cfg = statusConfig[status];

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.color}44`,
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.8px', marginBottom: '4px' }}>
          ACTIVE STAKE
        </div>
        <div style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>
          {currency} {amount.toLocaleString()}
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
          Simulated accountability stake
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
        <div style={{ fontSize: '28px' }}>{cfg.icon}</div>
        <div style={{
          fontSize: '10px',
          color: cfg.color,
          fontWeight: '700',
          letterSpacing: '1px',
        }}>
          {cfg.label}
        </div>
      </div>
    </div>
  );
};

export default StakeCard;
