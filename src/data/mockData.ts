// ─── Mock Data for Development (before backend is connected) ────────────────

export const MOCK_USER = {
  id: 'user_001',
  username: 'Demo User',
  email: 'demo@restraint.app',
  focus_score: 120,
  streak: 5,
  total_focus_time: 7200,
  risk_level: 'medium',
  created_at: '2026-04-01T00:00:00.000Z',
};

export const MOCK_STATS = {
  focus_score: 120,
  streak: 5,
  total_focus_time: 7200,
  total_sessions: 18,
  completed_sessions: 13,
  failed_sessions: 5,
  success_rate: 72.2,
  total_staked: 8500,
  total_slashed: 1500,
  recent_sessions: [
    {
      id: 's1',
      status: 'completed',
      duration: 1500,
      start_time: '2026-04-24T08:00:00Z',
      stake_amount: 500,
      currency: 'NGN',
    },
    {
      id: 's2',
      status: 'failed',
      duration: 3600,
      start_time: '2026-04-23T22:00:00Z',
      stake_amount: 1000,
      currency: 'NGN',
    },
    {
      id: 's3',
      status: 'completed',
      duration: 1500,
      start_time: '2026-04-23T09:00:00Z',
      stake_amount: 500,
      currency: 'NGN',
    },
    {
      id: 's4',
      status: 'completed',
      duration: 2700,
      start_time: '2026-04-22T10:00:00Z',
      stake_amount: 500,
      currency: 'NGN',
    },
    {
      id: 's5',
      status: 'completed',
      duration: 900,
      start_time: '2026-04-22T08:00:00Z',
      stake_amount: 200,
      currency: 'NGN',
    },
  ],
};

export const MOCK_AI_ANALYSIS = {
  risk_score: 0.45,
  risk_level: 'medium',
  recommended_duration: 1500,
  suggested_stake: 500,
  message:
    'Moderate risk detected. A 25-minute session gives the highest completion probability. Silence your phone. Stay off social media.',
};

export const MOCK_FOCUS_MESSAGE = {
  message: 'You are past the halfway mark. Discipline is compounding. Keep going.',
  progress: 0.55,
  phase: 'mid',
};

export const DURATION_OPTIONS = [
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '25 min', value: 1500 },
  { label: '30 min', value: 1800 },
  { label: '45 min', value: 2700 },
  { label: '1 hour', value: 3600 },
  { label: '90 min', value: 5400 },
  { label: '2 hours', value: 7200 },
];

export const APP_OPTIONS = ['TikTok', 'Instagram', 'Twitter/X', 'YouTube', 'WhatsApp', 'Reddit', 'Snapchat', 'Facebook'];

export const SITE_OPTIONS = [
  'youtube.com',
  'twitter.com',
  'reddit.com',
  'instagram.com',
  'tiktok.com',
  'facebook.com',
  'netflix.com',
  'twitch.tv',
];
