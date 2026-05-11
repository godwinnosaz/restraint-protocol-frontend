import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';

const slides = [
  {
    icon: '⛓',
    title: 'Discipline Is\nA Protocol',
    body: 'Restraint Protocol is not a productivity app. It is an enforcement system. You commit. You comply. There are consequences.',
    accent: '#14F195',
  },
  {
    icon: '🎯',
    title: 'Commit.\nOr Pay.',
    body: 'Every session is a contract. Stake real value. Complete your session and your stake is returned. Break early — it gets slashed.',
    accent: '#FF4D6D',
  },
  {
    icon: '◈',
    title: 'Gemma Watches.\nGemma Knows.',
    body: 'AI analyzes your risk profile before every session. It gives directives, not suggestions. You either comply or you fail.',
    accent: '#9945FF',
  },
];

const Onboarding: React.FC = () => {
  const [slide, setSlide] = useState(0);
  const history = useHistory();
  const { setIsOnboarded } = useApp();

  const isLast = slide === slides.length - 1;
  const current = slides[slide];

  const handleNext = () => {
    if (isLast) {
      setIsOnboarded(true);
      history.replace('/dashboard');
    } else {
      setSlide(slide + 1);
    }
  };

  return (
    <div
      className="page-enter"
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        /* Use clamp padding to prevent content from being too cramped on small screens */
        padding: 'clamp(48px, 10vh, 72px) clamp(20px, 6vw, 32px) max(40px, env(safe-area-inset-bottom, 40px))',
        color: '#fff',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as any,
      }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slide ? '32px' : '8px',
              height: '4px',
              borderRadius: '2px',
              background: i === slide ? current.accent : 'rgba(255,255,255,0.1)',
              boxShadow: i === slide ? `0 0 10px ${current.accent}` : 'none',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '28px',
        padding: '24px 0',
      }}>
        <div style={{
          fontSize: 'clamp(60px, 20vw, 96px)',
          lineHeight: 1,
          animation: 'float 3s ease-in-out infinite',
        }}>
          {current.icon}
        </div>

        <div>
          <h1 style={{
            fontSize: 'clamp(28px, 8vw, 42px)',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            margin: '0 0 20px',
            color: '#fff',
            whiteSpace: 'pre-line',
          }}>
            {current.title}
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#94A3B8',
            lineHeight: '1.7',
            margin: '0 auto',
            maxWidth: '320px',
            fontWeight: '500',
          }}>
            {current.body}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PrimaryButton
          label={isLast ? 'Initialize Protocol' : 'Next Directive'}
          onClick={handleNext}
          style={{
            background: current.accent,
            color: '#050816',
            boxShadow: `0 0 30px ${current.accent}44`,
          }}
        />

        <button
          onClick={() => { setIsOnboarded(true); history.replace('/dashboard'); }}
          style={{
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: '#475569',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          SKIP INTRODUCTION
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
