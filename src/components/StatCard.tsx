import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = '#14F195', subtitle }) => {
  return (
    <div className="glass-card" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1,
      minWidth: '140px',
      transition: 'transform 0.2s ease',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div style={{ 
          fontSize: '20px',
          background: `${color}20`,
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ marginTop: '4px' }}>
        <div style={{
          fontSize: '28px',
          fontWeight: '900',
          color: '#fff',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: '#94A3B8', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginTop: '6px',
          fontWeight: '700'
        }}>
          {label}
        </div>
      </div>

      {subtitle && (
        <div style={{ 
          fontSize: '11px', 
          color: '#64748B',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }} />
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
