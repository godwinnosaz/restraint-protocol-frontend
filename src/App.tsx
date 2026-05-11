import React, { useMemo } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';
import { Route, Redirect, Switch, useHistory, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import '@solana/wallet-adapter-react-ui/styles.css';

/* Ionic CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Pages */
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import StartSession from './pages/StartSession';
import ActiveSession from './pages/ActiveSession';
import SessionResult from './pages/SessionResult';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

setupIonicReact({ mode: 'md' });

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TabBar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const tabs = [
    { path: '/dashboard', label: 'Protocol', icon: '◉' },
    { path: '/start-session', label: 'Initiate', icon: '⚡' },
    { path: '/profile', label: 'Operator', icon: '◈' },
  ];

  return (
    <div style={{
      position: 'fixed',
      /* Sit above the safe-area gesture bar; fallback to 16px */
      bottom: 'max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px))',
      left: '24px',
      right: '24px',
      height: '68px',
      background: 'rgba(5, 8, 22, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => history.push(tab.path)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: isActive ? '#14F195' : '#475569',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '20px', textShadow: isActive ? '0 0 10px rgba(20, 241, 149, 0.5)' : 'none' }}>{tab.icon}</span>
            <span style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '800' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { isOnboarded } = useApp();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isActiveSession = location.pathname === '/active-session';
  const isSessionResult = location.pathname === '/session-result';
  const isOnboarding = location.pathname === '/onboarding';
  const showTabBar = isAuthenticated && isOnboarded && !isActiveSession && !isSessionResult && !isAuthPage && !isOnboarding;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050816', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
            color: '#14F195', 
            fontSize: '32px', 
            animation: 'pulse-glow 2s infinite ease-in-out',
            textShadow: '0 0 20px rgba(20, 241, 149, 0.5)'
        }}>◈</div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/onboarding" component={Onboarding} />

        {/* Protected Routes */}
        <Route exact path="/dashboard">
          {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/start-session">
          {isAuthenticated ? <StartSession /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/active-session">
          {isAuthenticated ? <ActiveSession /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/session-result">
          {isAuthenticated ? <SessionResult /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/profile">
          {isAuthenticated ? <Profile /> : <Redirect to="/login" />}
        </Route>

        <Redirect exact from="/" to={isAuthenticated ? (isOnboarded ? '/dashboard' : '/onboarding') : '/login'} />
      </Switch>

      {/* Show tab bar on main pages */}
      {showTabBar && <TabBar />}
    </>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  // Use devnet for MVP
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  // Register wallets — Phantom & Solflare cover the majority of Solana users;
  // Coinbase, Trust, Ledger, Torus cover mobile + hardware + web2 onboarding.
  // Phantom & Solflare are the only adapters in wallet-adapter-wallets@0.19
  // Import directly from individual packages (not the meta-package
  // @solana/wallet-adapter-wallets) to avoid webpack 5 bundling ALL adapters
  // and hitting the cipher-base/hash-base Node.js stream polyfill errors.
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <IonApp style={{ background: '#050816' }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AuthProvider>
              <AppProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </AppProvider>
            </AuthProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </IonApp>
  );
};

export default App;
