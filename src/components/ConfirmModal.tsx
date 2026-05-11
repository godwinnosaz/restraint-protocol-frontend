import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
  stakeAmount?: number;
  currency?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'danger',
  stakeAmount,
  currency,
}) => {
  if (!isOpen) return null;

  const accentColor = variant === 'danger' ? '#ff4757' : '#ffd32a';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      padding: '0',
    }}>
      <div style={{
        background: '#111',
        borderTop: `2px solid ${accentColor}`,
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Warning Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '48px',
        }}>
          {variant === 'danger' ? '⚠️' : '⚡'}
        </div>

        <h2 style={{
          margin: '0 0 12px',
          fontSize: '22px',
          fontWeight: '800',
          color: accentColor,
          textAlign: 'center',
          letterSpacing: '-0.5px',
        }}>
          {title}
        </h2>

        <p style={{
          margin: '0 0 24px',
          color: '#999',
          fontSize: '15px',
          textAlign: 'center',
          lineHeight: '1.6',
        }}>
          {message}
        </p>

        {stakeAmount !== undefined && stakeAmount > 0 && (
          <div style={{
            background: 'rgba(255,71,87,0.1)',
            border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '12px', color: '#ff4757', letterSpacing: '1px', marginBottom: '4px' }}>
              STAKE WILL BE SLASHED
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>
              {currency} {stakeAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              This cannot be undone
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: `linear-gradient(135deg, ${accentColor}, ${variant === 'danger' ? '#c0392b' : '#e67e22'})`,
              color: '#fff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #333',
              background: 'transparent',
              color: '#aaa',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
