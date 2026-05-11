import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import AIInsightCard from '../components/AIInsightCard';
import ProtocolBadge from '../components/ProtocolBadge';
import { DURATION_OPTIONS, APP_OPTIONS, SITE_OPTIONS } from '../data/mockData';
import * as api from '../services/api';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, Transaction, PublicKey } from '@solana/web3.js';

const DEMO_DURATION_OPTIONS = [{ label: '1m', value: 60 }, ...DURATION_OPTIONS];
const PROTOCOL_TREASURY_WALLET = new PublicKey('ETHRAJMC2ikcAppNoVBnzv9SVg7d5kTUcUVK7vXXdvpq');

const StartSession: React.FC = () => {
  const history = useHistory();
  const { user, setActiveSession, setAiInsight, isDemoMode } = useApp();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [stakeMode, setStakeMode] = useState<'simulated' | 'solana'>('simulated');
  const [duration, setDuration] = useState(1500);
  const [stakeAmountSimulated, setStakeAmountSimulated] = useState(5000);
  const [stakeAmountSolana, setStakeAmountSolana] = useState(0.1);
  const [currency] = useState('NGN');
  const [selectedApps, setSelectedApps] = useState<string[]>(['Instagram']);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitStatusText, setCommitStatusText] = useState('');
  const [step, setStep] = useState<'configure' | 'review'>('configure');
  const [strictMode, setStrictMode] = useState(true);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const amount = stakeMode === 'solana' ? stakeAmountSolana : stakeAmountSimulated;
      const data = await api.getPreSessionAI({
        userId: user?.uuid || user?.id || 'user_001',
        duration,
        stake_amount: amount,
        blocked_apps: selectedApps,
        blocked_sites: selectedSites,
      });
      setAiAnalysis(data.analysis);
      setAiInsight(data.analysis);
      setStep('review');
    } catch {
      setAiAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    let signature = '';
    try {
      const amount = stakeMode === 'solana' ? stakeAmountSolana : stakeAmountSimulated;
      const cur = stakeMode === 'solana' ? 'SOL' : currency;

      if (stakeMode === 'solana') {
        if (!publicKey && !isDemoMode) throw new Error('Wallet not connected');
        if (isDemoMode) {
          setCommitStatusText('Waiting for wallet confirmation...');
          await new Promise(r => setTimeout(r, 800));
          signature = 'demo_mode_bypass';
          setCommitStatusText('Transaction sent. Verifying on-chain...');
          await new Promise(r => setTimeout(r, 1000));
        } else {
          const lamports = Math.round(amount * 1e9);
          const transaction = new Transaction().add(
            SystemProgram.transfer({ fromPubkey: publicKey!, toPubkey: PROTOCOL_TREASURY_WALLET, lamports })
          );
          setCommitStatusText('Waiting for wallet confirmation...');
          signature = await sendTransaction(transaction, connection);
          setCommitStatusText('Transaction sent. Verifying on-chain...');
        }
      } else {
        setCommitStatusText('Initializing Protocol...');
      }

      const payload = {
        userId: user?.uuid || user?.id || 'user_001',
        duration,
        blocked_apps: selectedApps,
        blocked_sites: selectedSites,
        stake_amount: stakeMode === 'solana' ? Math.round(amount * 1e9) : amount,
        currency: cur,
        ai_risk_score: aiAnalysis?.risk_score || 0,
        stake_mode: stakeMode,
        wallet_address: publicKey ? publicKey.toBase58() : undefined,
        tx_signature: signature || undefined,
        strict_mode: strictMode,
      };

      const data = await api.startSession(payload);
      setCommitStatusText('Stake Locked!');
      setActiveSession(data.session);
      history.push('/active-session');
    } catch (err: any) {
      console.error(err);
      alert('Protocol Error: ' + (err.message || 'Unknown error'));
    } finally {
      setCommitting(false);
      setCommitStatusText('');
    }
  };

  return (
    <div
      className="page-enter max-width-container"
      style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header */}
      <div style={{ padding: 'clamp(40px, 10vh, 56px) 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => step === 'review' ? setStep('configure') : history.goBack()}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            ←
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: 'var(--color-muted)', letterSpacing: '1px', fontWeight: '800' }}>
              {step === 'configure' ? 'PHASE 1: CONFIGURATION' : 'PHASE 2: AI REVIEW'}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {step === 'configure' ? 'Session Parameters' : 'Protocol Analysis'}
            </h1>
          </div>
        </div>
        {isDemoMode && <ProtocolBadge label="Dev Access" variant="warning" />}
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {step === 'configure' ? (
          <>
            {/* Stake Mode */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
                STAKING PROTOCOL
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStakeMode('simulated')}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', transition: 'all 0.2s ease',
                    border: `1px solid ${stakeMode === 'simulated' ? '#14F195' : 'rgba(255,255,255,0.1)'}`,
                    background: stakeMode === 'simulated' ? 'rgba(20, 241, 149, 0.1)' : 'transparent',
                    color: stakeMode === 'simulated' ? '#14F195' : '#64748B',
                    fontSize: '13px', fontWeight: '700',
                  }}
                >Simulated</button>
                <button
                  onClick={() => setStakeMode('solana')}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', transition: 'all 0.2s ease',
                    border: `1px solid ${stakeMode === 'solana' ? '#9945FF' : 'rgba(255,255,255,0.1)'}`,
                    background: stakeMode === 'solana' ? 'rgba(153, 69, 255, 0.1)' : 'transparent',
                    color: stakeMode === 'solana' ? '#9945FF' : '#64748B',
                    fontSize: '13px', fontWeight: '700',
                  }}
                >Solana</button>
              </div>

              {stakeMode === 'solana' && (
                /* overflow: hidden prevents WalletMultiButton from busting layout */
                <div style={{ marginTop: '20px', overflow: 'hidden' }}>
                  <WalletMultiButton style={{ background: '#9945FF', borderRadius: '12px', height: '44px', width: '100%', justifyContent: 'center' }} />
                </div>
              )}
            </div>

            {/* Duration & Stake Amount */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
                TIME & COMMITMENT
              </div>
              {/* Horizontal scroll with momentum */}
              <div className="h-scroll" style={{ paddingBottom: '8px' }}>
                {(isDemoMode ? DEMO_DURATION_OPTIONS : DURATION_OPTIONS).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    style={{
                      flex: '0 0 auto', padding: '10px 18px', borderRadius: '12px',
                      border: `1px solid ${duration === opt.value ? '#14F195' : 'rgba(255,255,255,0.1)'}`,
                      background: duration === opt.value ? 'rgba(20, 241, 149, 0.1)' : 'transparent',
                      color: duration === opt.value ? '#14F195' : '#64748B',
                      fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px',
              }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: stakeMode === 'solana' ? '#14F195' : '#FACC15', flexShrink: 0 }}>
                  {stakeMode === 'solana' ? '◎' : '₦'}
                </span>
                <input
                  type="number"
                  step={stakeMode === 'solana' ? '0.01' : '1'}
                  value={stakeMode === 'solana' ? stakeAmountSolana : stakeAmountSimulated}
                  onChange={e => stakeMode === 'solana' ? setStakeAmountSolana(Number(e.target.value)) : setStakeAmountSimulated(Number(e.target.value))}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: '900', width: '100%', outline: 'none', minWidth: 0 }}
                />
              </div>
            </div>

            {/* Enforcement Targets */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
                ENFORCEMENT TARGETS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[...APP_OPTIONS, ...SITE_OPTIONS].map(item => {
                  const isSelected = selectedApps.includes(item) || selectedSites.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        if (APP_OPTIONS.includes(item)) toggleItem(selectedApps, setSelectedApps, item);
                        else toggleItem(selectedSites, setSelectedSites, item);
                      }}
                      style={{
                        padding: '10px 16px', borderRadius: '12px',
                        border: `1px solid ${isSelected ? '#FF4D6D' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'rgba(255, 77, 109, 0.1)' : 'rgba(255,255,255,0.03)',
                        color: isSelected ? '#FF4D6D' : '#94A3B8',
                        fontSize: '12px', fontWeight: '700', transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected ? '✗ ' : ''}{item}
                    </button>
                  );
                })}
              </div>
            </div>

            <PrimaryButton
              label={analyzing ? 'Analyzing Risk...' : 'Confirm Parameters →'}
              onClick={runAIAnalysis}
              disabled={analyzing || (stakeMode === 'solana' && !publicKey)}
              variant="primary"
            />
          </>
        ) : (
          <>
            {/* Protocol Contract Review */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '2px', marginBottom: '20px', fontWeight: '800' }}>
                PROTOCOL CONTRACT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Time Allocated', value: `${Math.floor(duration / 60)}:00 Minutes` },
                  {
                    label: 'Security Deposit',
                    value: stakeMode === 'solana' ? `◎ ${stakeAmountSolana} SOL` : `₦ ${stakeAmountSimulated.toLocaleString()}`,
                    color: stakeMode === 'solana' ? '#14F195' : '#FACC15',
                  },
                  { label: 'Network', value: stakeMode.toUpperCase(), color: stakeMode === 'solana' ? '#9945FF' : '#94A3B8' },
                  { label: 'Restrictions', value: `${selectedApps.length + selectedSites.length} Active Targets` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: item.color || '#fff', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Risk Assessment */}
            {aiAnalysis && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '800' }}>
                  RISK ASSESSMENT
                </div>
                <AIInsightCard message={aiAnalysis.message} type="risk" riskScore={aiAnalysis.risk_score} riskLevel={aiAnalysis.risk_level} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <PrimaryButton
                label={commitStatusText || (stakeMode === 'solana' ? 'Sign & Lock Stake' : 'Authorize Protocol')}
                onClick={handleCommit}
                disabled={committing}
                variant="primary"
              />
              <PrimaryButton label="Edit Parameters" onClick={() => setStep('configure')} variant="ghost" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StartSession;
