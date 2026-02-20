/**
 * Privacy Score Dashboard
 *
 * Central "Wow" feature of EncryptedSocial.
 * Shows real-time metrics from actual services — never fake data.
 * Every transaction links to the Aleo Explorer for verification.
 */

import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Zap, Link, RefreshCw, ExternalLink, CheckCircle, Key, Radio } from 'lucide-react';
import { messagingOrchestrator, type PrivacyMetrics } from '../services/messagingOrchestrator';

interface PrivacyScoreDashboardProps {
  theme: Record<string, string>;
  onClose?: () => void;
  isOpen?: boolean;
  userAddress?: string;
}

function calculateScore(metrics: PrivacyMetrics): number {
  if (metrics.totalMessages === 0 && metrics.zkTipCount === 0 && (metrics.anonymousMessages ?? 0) === 0) return 0;

  const total = metrics.totalMessages;

  // E2E Encryption — 30%: all messages encrypted client-side (AES-256-GCM)
  const encRate = total > 0 ? metrics.encryptedMessages / total : 0;

  // Relay Privacy — 15%: encrypted messages are relay-private by design.
  // The relay ALWAYS sees only ciphertext — privacy holds whether or not
  // the socket was live at send time. Use encRate as the relay privacy rate.
  const relayRate = encRate;

  // Blockchain Anchoring — 10%: messages with on-chain TX (message_handler.aleo / group_membership.aleo)
  const chainRate = total > 0 ? metrics.onChainMessages / total : 0;

  // Groups on Aleo — 20%: ZK group created (group_manager.aleo)
  const hasGroups = metrics.totalGroups > 0 ? 1 : 0;

  // ZK Tips — 10%: private_tips.aleo ZK-SNARK usage (3 tips = full score)
  const zkTipBonus = Math.min(1, metrics.zkTipCount / 3);

  // Anonymous ZK messages — 5%: Merkle proofs (group_membership.aleo / submit_feedback)
  const anonBonus = Math.min(1, (metrics.anonymousMessages ?? 0) / 2);

  // +10 base for having any activity
  const score = encRate * 30 + relayRate * 15 + chainRate * 10 + hasGroups * 20 + zkTipBonus * 10 + anonBonus * 5 + 10;
  return Math.min(100, Math.round(score));
}

function ScoreRing({ score, theme }: { score: number; theme: Record<string, string> }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#374151" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subValue,
  color,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  theme: Record<string, string>;
}) {
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1"
      style={{ background: theme.cardBg || theme.input, border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{value}</span>
      {subValue && (
        <span style={{ fontSize: 11, color: theme.textSecondary }}>{subValue}</span>
      )}
    </div>
  );
}

export function PrivacyScoreDashboard({ theme, onClose, isOpen = true }: PrivacyScoreDashboardProps) {
  // Hooks MUST be called before any conditional return (Rules of Hooks)
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const m = await messagingOrchestrator.getPrivacyMetrics();
      setMetrics(m);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to load privacy metrics:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refresh();
    const interval = setInterval(refresh, 30_000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [refresh, isOpen]);

  if (!isOpen) return null;

  const score = metrics ? calculateScore(metrics) : 0;
  const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs improvement';

  const encRate = metrics && metrics.totalMessages > 0
    ? Math.round((metrics.encryptedMessages / metrics.totalMessages) * 100)
    : 0;
  // Relay privacy = encryption rate: encrypted msgs are relay-private by design
  const relayRate = encRate;
  const chainRate = metrics && metrics.totalMessages > 0
    ? Math.round((metrics.onChainMessages / metrics.totalMessages) * 100)
    : 0;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center gap-2">
          <Shield size={20} style={{ color: '#6366f1' }} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>Privacy Score</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-lg transition-opacity"
            style={{ background: theme.cardBg || theme.input, color: theme.textSecondary }}
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg"
              style={{ background: theme.cardBg || theme.input, color: theme.textSecondary }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Score Ring */}
        <div className="flex flex-col items-center gap-2 py-2">
          <ScoreRing score={score} theme={theme} />
          <div className="text-center">
            <div style={{ color: scoreColor, fontWeight: 700, fontSize: 14 }}>{scoreLabel}</div>
            <div style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Score breakdown bar */}
        <div className="rounded-xl p-3" style={{ background: theme.cardBg || theme.input, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score Breakdown
          </div>
          {[
            { label: 'E2E Encryption (AES-256-GCM)', value: encRate, weight: 30, color: '#6366f1' },
            { label: 'Relay Privacy (ciphertext-only relay)', value: relayRate, weight: 15, color: '#3b82f6' },
            { label: 'Blockchain Anchoring (on-chain TX)', value: chainRate, weight: 10, color: '#22c55e' },
            { label: 'Groups on Aleo', value: metrics ? (metrics.totalGroups > 0 ? 100 : 0) : 0, weight: 20, color: '#f59e0b' },
            { label: 'ZK Tips (private_tips.aleo)', value: metrics ? Math.min(100, (metrics.zkTipCount / 3) * 100) : 0, weight: 10, color: '#06b6d4' },
            { label: 'Anon Msgs (Merkle ZK)', value: metrics ? Math.min(100, ((metrics.anonymousMessages ?? 0) / 2) * 100) : 0, weight: 5, color: '#a855f7' },
          ].map(item => (
            <div key={item.label} className="mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: 12, color: theme.text }}>{item.label}</span>
                <span style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>
                  {item.value}% <span style={{ color: theme.textSecondary, fontWeight: 400 }}>({item.weight}% weight)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: theme.border }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Metric cards grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            icon={<Lock size={14} />}
            label="Encrypted"
            value={`${metrics?.encryptedMessages ?? 0}`}
            subValue={`of ${metrics?.totalMessages ?? 0} messages`}
            color="#6366f1"
            theme={theme}
          />
          <MetricCard
            icon={<Radio size={14} />}
            label="Relayed"
            value={`${metrics?.relayedMessages ?? 0}`}
            subValue="via encrypted relay"
            color="#3b82f6"
            theme={theme}
          />
          <MetricCard
            icon={<Link size={14} />}
            label="On-Chain"
            value={`${metrics?.onChainMessages ?? 0}`}
            subValue="verified on Aleo"
            color="#22c55e"
            theme={theme}
          />
          <MetricCard
            icon={<Key size={14} />}
            label="ZK Groups"
            value={`${metrics?.totalGroups ?? 0}`}
            subValue="private groups"
            color="#f59e0b"
            theme={theme}
          />
          <MetricCard
            icon={<Zap size={14} />}
            label="ZK Tips Sent"
            value={`${metrics?.zkTipCount ?? 0}`}
            subValue="via private_tips.aleo"
            color="#06b6d4"
            theme={theme}
          />
          <MetricCard
            icon={<Shield size={14} />}
            label="Anonymous ZK"
            value={`${metrics?.anonymousMessages ?? 0}`}
            subValue="Merkle proofs on-chain"
            color="#a855f7"
            theme={theme}
          />
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
          <div
            className="px-3 py-2"
            style={{ background: theme.cardBg || theme.input, borderBottom: `1px solid ${theme.border}` }}
          >
            <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Blockchain Transactions
            </span>
          </div>

          {!metrics || metrics.recentTransactions.length === 0 ? (
            <div className="p-4 text-center" style={{ color: theme.textSecondary, fontSize: 13 }}>
              {loading ? 'Loading...' : 'No on-chain transactions yet.\nSend a message to create one.'}
            </div>
          ) : (
            <div>
              {metrics.recentTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div style={{ fontSize: 12, color: theme.text, fontFamily: 'monospace' }}>
                        {tx.id.slice(0, 10)}...{tx.id.slice(-6)}
                      </div>
                      <div style={{ fontSize: 10, color: theme.textSecondary }}>
                        {tx.type} · {tx.status}
                        {tx.receiptId && (
                          <span style={{ color: '#06b6d4', marginLeft: 4 }}>
                            · receipt: {tx.receiptId.slice(0, 8)}...
                          </span>
                        )}
                        {tx.nullifier && (
                          <span style={{ color: '#a855f7', marginLeft: 4 }}>
                            · nullifier: {tx.nullifier.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a
                    href={tx.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg transition-opacity hover:opacity-80 flex-shrink-0"
                    style={{ background: '#6366f120', color: '#6366f1', fontSize: 11, textDecoration: 'none' }}
                  >
                    <ExternalLink size={10} />
                    Explorer
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Pledge */}
        <div
          className="rounded-xl p-3 flex gap-3"
          style={{ background: '#6366f110', border: '1px solid #6366f130' }}
        >
          <Shield size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginBottom: 2 }}>
              Zero-Knowledge Privacy
            </div>
            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>
              Messages use AES-256-GCM — encrypted before leaving your device, relay sees only ciphertext.
              Tips use <code style={{ color: '#6366f1' }}>private_tips.aleo</code> → <code style={{ color: '#6366f1' }}>transfer_private</code> (Aleo Groth16 SNARK):
              sender identity + balance hidden on-chain, BHP256 receipt verifiable on Aleo Explorer.
              Groups use <code style={{ color: '#6366f1' }}>group_membership.aleo</code> Merkle proofs.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
