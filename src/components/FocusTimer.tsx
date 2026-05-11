import React, { useEffect, useState } from 'react';

interface FocusTimerProps {
  duration: number; // total seconds
  remaining: number; // remaining seconds
  isRunning?: boolean;
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const FocusTimer: React.FC<FocusTimerProps> = ({
  duration,
  remaining,
  isRunning = true,
  onTick,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(remaining);

  useEffect(() => {
    setTimeLeft(remaining);
  }, [remaining]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onTick, onComplete]); // eslint-disable-line

  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference * (1 - progress);

  const progressColor = timeLeft < duration * 0.2
    ? '#ff4757'
    : timeLeft < duration * 0.5
    ? '#ffd32a'
    : '#00c896';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{ position: 'relative', width: '260px', height: '260px' }}>
        <svg
          width="260"
          height="260"
          style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
        >
          {/* Track */}
          <circle
            cx="130" cy="130" r="110"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx="130" cy="130" r="110"
            fill="none"
            stroke={progressColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}>
          <div style={{
            fontSize: '42px',
            fontWeight: '800',
            color: progressColor,
            letterSpacing: '-2px',
            transition: 'color 0.5s ease',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {Math.round(progress * 100)}% complete
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
