import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOCK_USER, MOCK_STATS } from '../data/mockData';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppState = 'IDLE' | 'PRE_COMMIT' | 'ACTIVE' | 'WARNING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  uuid: string;
  username: string;
  email: string;
  focus_score: number;
  streak: number;
  total_focus_time: number;
  risk_level: string;
}

export interface Session {
  id: string;
  user_id: string;
  status: string;
  duration: number;
  remaining_time: number;
  start_time: string;
  blocked_apps: string[];
  blocked_sites: string[];
  stake_amount: number;
  currency: string;
  ai_risk_score: number;
  stake_mode?: 'simulated' | 'solana';
  wallet_address?: string;
  stake_tx_signature?: string;
  strict_mode: boolean;
}

export interface Stats {
  focus_score: number;
  streak: number;
  total_focus_time: number;
  total_sessions: number;
  completed_sessions: number;
  failed_sessions: number;
  success_rate: number;
  total_staked: number;
  total_slashed: number;
  recent_sessions: any[];
}

interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  user: any | null;
  activeSession: Session | null;
  setActiveSession: (s: Session | null) => void;
  sessionResult: any | null;
  setSessionResult: (r: any | null) => void;
  stats: Stats | null;
  setStats: (s: Stats | null) => void;
  aiInsight: any | null;
  setAiInsight: (a: any | null) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
  loadStats: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionResult, setSessionResult] = useState<any | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(localStorage.getItem('rp_onboarded') === 'true');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getStats(String(user.uuid || user.id));
      setStats(data.stats);
    } catch {
      console.warn('Backend stats unavailable');
      setStats(MOCK_STATS as Stats);
    }
  }, [user]);

  const handleSetOnboarded = (v: boolean) => {
    setIsOnboarded(v);
    localStorage.setItem('rp_onboarded', v.toString());
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        setAppState,
        user,
        activeSession,
        setActiveSession,
        sessionResult,
        setSessionResult,
        stats,
        setStats,
        aiInsight,
        setAiInsight,
        isOnboarded,
        setIsOnboarded: handleSetOnboarded,
        isDemoMode,
        setIsDemoMode,
        loadStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
