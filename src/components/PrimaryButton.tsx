import React from 'react';

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  fullWidth?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  icon,
  type = 'button',
  style = {},
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #14F195 0%, #00C2FF 100%)',
          color: '#050816',
          boxShadow: '0 0 20px rgba(20, 241, 149, 0.2)',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #9945FF 0%, #F31260 100%)',
          color: '#fff',
          boxShadow: '0 0 20px rgba(153, 69, 255, 0.2)',
        };
      case 'danger':
        return {
          background: 'rgba(255, 77, 109, 0.1)',
          color: '#FF4D6D',
          border: '1px solid rgba(255, 77, 109, 0.3)',
        };
      case 'warning':
        return {
          background: 'rgba(250, 204, 21, 0.1)',
          color: '#FACC15',
          border: '1px solid rgba(250, 204, 21, 0.3)',
        };
      case 'ghost':
        return {
          background: 'rgba(255, 255, 255, 0.03)',
          color: '#94A3B8',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        borderRadius: '16px',
        fontSize: '15px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: 'none',
        opacity: disabled ? 0.5 : 1,
        transform: disabled ? 'none' : 'scale(1)',
        outline: 'none',
        ...getVariantStyles(),
        ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      {label}
    </button>
  );
};

export default PrimaryButton;
