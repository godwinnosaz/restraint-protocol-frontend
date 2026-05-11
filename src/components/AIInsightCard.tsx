import React from 'react';

interface AIInsightCardProps {
  message: string;
  type?: 'risk' | 'advice' | 'summary' | 'focus';
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  message,
  type = 'advice',
  riskScore,
  riskLevel,
}) => {
  const typeConfig: Record<string, { color: string; label: string; icon: string }> = {
    risk: { color: '#FACC15', label: 'RISK ANALYSIS', icon: '⚠' },
    advice: { color: '#14F195', label: 'GEMMA INSIGHT', icon: '◈' },
    summary: { color: '#9945FF', label: 'SESSION SUMMARY', icon: '◉' },
    focus: { color: '#00C2FF', label: 'FOCUS DIRECTIVE', icon: '▶' },
  };

  const cfg = typeConfig[type];
  const riskColor = riskLevel === 'high' ? '#FF4D6D' : riskLevel === 'medium' ? '#FACC15' : '#14F195';

  return (
    <div className="glass-card" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      borderLeft: `4px solid ${cfg.color}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Background Glow */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
        background: cfg.color, opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px',
          color: cfg.color, fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          <span>{cfg.icon}</span>
          <span>{cfg.label}</span>
        </div>
        
        {riskScore !== undefined && (
          <div style={{
            fontSize: '10px', color: riskColor, fontWeight: '900', background: `${riskColor}15`,
            padding: '4px 10px', borderRadius: '8px', border: `1px solid ${riskColor}30`, letterSpacing: '0.5px'
          }}>
            {riskLevel?.toUpperCase()} {Math.round(riskScore * 100)}%
          </div>
        )}
      </div>

      <p style={{
        margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: '1.6',
        fontWeight: '500', opacity: 0.9, letterSpacing: '0.1px'
      }}>
        {message}
      </p>

      <div style={{ 
        fontSize: '9px', color: '#64748B', fontWeight: '800', letterSpacing: '1px', 
        display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px'
      }}>
         <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748B' }} />
         VERIFIED BY GEMMA AI
      </div>
    </div>
  );
};

export default AIInsightCard;
