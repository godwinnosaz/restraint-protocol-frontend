import React from 'react';

interface ProtocolBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';
  glow?: boolean;
}

const ProtocolBadge: React.FC<ProtocolBadgeProps> = ({ label, variant = 'primary', glow = false }) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary': return { color: '#14F195', bg: 'rgba(20, 241, 149, 0.1)', border: 'rgba(20, 241, 149, 0.2)' };
      case 'secondary': return { color: '#9945FF', bg: 'rgba(153, 69, 255, 0.1)', border: 'rgba(153, 69, 255, 0.2)' };
      case 'warning': return { color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.2)' };
      case 'danger': return { color: '#FF4D6D', bg: 'rgba(255, 77, 109, 0.1)', border: 'rgba(255, 77, 109, 0.2)' };
      case 'ghost': return { color: '#94A3B8', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const { color, bg, border } = getStyles();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '10px',
      fontWeight: '800',
      letterSpacing: '1px',
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      boxShadow: glow ? `0 0 12px ${bg}` : 'none',
      textTransform: 'uppercase',
      transition: 'all 0.3s ease',
    }}>
      {label}
    </div>
  );
};

export default ProtocolBadge;
