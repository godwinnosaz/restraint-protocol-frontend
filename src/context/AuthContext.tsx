import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';

interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  wallet_address?: string;
  focus_score: number;
  streak: number;
  total_focus_time: number;
  risk_level: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        setLoading(true);
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (err) {
          console.error('Auth initialization failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.loginUser(email, password);
      localStorage.setItem('rp_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.registerUser(username, email, password);
      localStorage.setItem('rp_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      const data = await api.getDemoUser();
      localStorage.setItem('rp_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rp_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
