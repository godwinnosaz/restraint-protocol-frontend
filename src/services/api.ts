// ─── API Configuration ────────────────────────────────────────────────────────
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('rp_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
  
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || 'API error');
  }
  return json.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = (username: string, email: string, password: string) =>
  apiCall<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

export const loginUser = (email: string, password: string) =>
  apiCall<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiCall<{ user: any }>('/auth/me');

export const logoutUser = () => apiCall('/auth/logout', { method: 'POST' });

export const getDemoUser = () => apiCall<{ user: any; token: string }>('/auth/demo-user');

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const startSession = (data: {
  userId: string;
  duration: number;
  blocked_apps?: string[];
  blocked_sites?: string[];
  stake_amount?: number;
  currency?: string;
  ai_risk_score?: number;
  stake_mode?: string;
  wallet_address?: string;
  tx_signature?: string;
}) =>
  apiCall<{ session: any; stake: any }>('/sessions/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getActiveSession = (userId: string) =>
  apiCall<{ session: any; stake: any }>(`/sessions/active/${userId}`);

export const completeSession = (sessionId: string) =>
  apiCall<{ session: any; insight: any; user: any; stake: any }>(
    `/sessions/complete/${sessionId}`,
    { method: 'POST' }
  );

export const failSession = (sessionId: string) =>
  apiCall<{ session: any; insight: any; user: any; stake: any }>(
    `/sessions/fail/${sessionId}`,
    { method: 'POST' }
  );

export const getSessionHistory = (userId: string) =>
  apiCall<{ sessions: any[] }>(`/sessions/history/${userId}`);

export const logEvent = (sessionId: string, eventType: string, data?: any) =>
  apiCall('/sessions/log-event', {
    method: 'POST',
    body: JSON.stringify({ sessionId, eventType, data }),
  });

export const logViolation = (data: {
  sessionId: string;
  userId: string;
  type: string;
  data: string;
  category: string;
  severity: string;
  timestamp: string;
  actionTaken: string;
}) =>
  apiCall('/events/violation', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ─── AI ───────────────────────────────────────────────────────────────────────
export const getPreSessionAI = (data: {
  userId: string;
  duration?: number;
  stake_amount?: number;
  blocked_apps?: string[];
  blocked_sites?: string[];
}) =>
  apiCall<{ analysis: any }>('/ai/pre-session', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getSessionInsight = (sessionId: string) =>
  apiCall<{ focusMessage: any; insights: any[] }>(`/ai/session-insight/${sessionId}`);

export const getUserSummary = (userId: string) =>
  apiCall<{ summary: any; insights: any[] }>(`/ai/user-summary/${userId}`);

// ─── Stats ────────────────────────────────────────────────────────────────────
export const getStats = (userId: string) =>
  apiCall<{ stats: any }>(`/stats/${userId}`);

// ─── Blacklist ───────────────────────────────────────────────────────────────
export const getBlacklist = () =>
  apiCall<{ domains: any[]; apps: any[]; keywords: any[] }>('/blacklist');

// ─── Health ───────────────────────────────────────────────────────────────────
export const healthCheck = () =>
  fetch(`${API_BASE_URL}/health`).then((r) => r.json());

export default API_BASE_URL;
