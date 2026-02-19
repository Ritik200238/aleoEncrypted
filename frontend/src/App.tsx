import { useState } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { Network } from '@provablehq/aleo-types';
import { CleanTelegramApp } from './components/CleanTelegramApp';
import { MessageSquare, Lock, Zap, Shield, X, ArrowRight } from 'lucide-react';
import './App.css';

// ─── Wallet Selection Modal ───────────────────────────────────────────────────

interface WalletModalProps {
  onClose: () => void;
  onConnectShield: () => void;
  onConnectLeo: () => void;
  connecting: boolean;
}

function WalletModal({ onClose, onConnectShield, onConnectLeo, connecting }: WalletModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-[360px] rounded-2xl p-6 shadow-2xl"
        style={{ background: '#131419', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{ color: '#64748b' }}
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-white font-semibold text-lg mb-1">Connect Wallet</h2>
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>
          Choose your Aleo wallet to continue
        </p>

        {/* Shield Wallet */}
        <button
          onClick={onConnectShield}
          disabled={connecting}
          className="w-full flex items-center gap-4 p-4 rounded-xl mb-3 transition-all group disabled:opacity-60"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.08)')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
          >
            <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white font-medium text-sm">Shield Wallet</div>
            <div className="text-xs" style={{ color: '#7c3aed' }}>by Provable · Recommended</div>
          </div>
          {connecting ? (
            <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: '#a78bfa' }} />
          )}
        </button>

        {/* Aleo Wallet (Leo) */}
        <button
          onClick={onConnectLeo}
          disabled={connecting}
          className="w-full flex items-center gap-4 p-4 rounded-xl transition-all group disabled:opacity-60"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}
          >
            <span className="text-white font-bold text-base">A</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-white font-medium text-sm">Aleo Wallet</div>
            <div className="text-xs" style={{ color: '#3b82f6' }}>by Leo · Chrome Extension</div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: '#60a5fa' }} />
        </button>

        <p className="text-center text-[11px] mt-5" style={{ color: '#374151' }}>
          Connecting to Aleo Testnet
        </p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const { connected, address, connect, connecting } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Demo mode: ?demo=true
  const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
  const userAddress = address || 'aleo1h7yz0n5qx9uwyaxsprspkm5j6leey9eyzmjv9k7zyyd5nt5lguysystq59';

  // Demo mode — go straight to app
  if (isDemo) {
    return (
      <div className="flex flex-col h-screen">
        <div
          className="flex items-center justify-between px-4 py-1.5 text-[11px] font-mono shrink-0"
          style={{ background: '#0f0f14', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}
        >
          <span style={{ color: '#4f46e5' }}>EncryptedSocial</span>
          <span>Demo Mode · Aleo Testnet · 6 contracts deployed</span>
          <button
            onClick={() => { const u = new URL(window.location.href); u.searchParams.delete('demo'); window.location.href = u.toString(); }}
            className="underline hover:text-white transition-colors"
          >
            Exit Demo
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <CleanTelegramApp userAddress={userAddress} />
        </div>
      </div>
    );
  }

  // Wallet connected — go straight to app
  if (connected) {
    return <CleanTelegramApp userAddress={userAddress} />;
  }

  // Connect Shield Wallet
  const handleShieldConnect = async () => {
    try {
      await connect(Network.TESTNET);
      setShowWalletModal(false);
    } catch {
      // Shield Wallet not installed — open install page
      window.open('https://shield.provable.com', '_blank');
    }
  };

  // Connect Leo Wallet (Aleo Wallet extension by demox-labs)
  const handleLeoConnect = async () => {
    const leo = (window as Record<string, unknown>).leoWallet as { connect?: (network: string) => Promise<unknown> } | undefined;
    if (leo?.connect) {
      try {
        await leo.connect('testnet');
        setShowWalletModal(false);
        // Leo wallet may not trigger useWallet — reload to pick up address
        window.location.reload();
      } catch {
        // user rejected
      }
    } else {
      window.open('https://www.leo.app', '_blank');
    }
  };

  // ─── Landing Page ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0f', color: '#fff' }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <MessageSquare className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">EncryptedSocial</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { const u = new URL(window.location.href); u.searchParams.set('demo', 'true'); window.location.href = u.toString(); }}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Try Demo
          </button>
          <button
            onClick={() => setShowWalletModal(true)}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-all text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: '6vh', paddingBottom: '10vh' }}>
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider mb-8"
          style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)', color: '#818cf8' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE ON ALEO TESTNET · 6 CONTRACTS
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl"
          style={{
            background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Private messaging.<br />Powered by zero-knowledge.
        </h1>

        <p className="text-lg max-w-xl leading-relaxed mb-10" style={{ color: '#64748b' }}>
          Prove you belong to a group without revealing who you are. Send anonymous messages and private tips — identity stays off-chain, always.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 40px rgba(79,70,229,0.35)' }}
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { const u = new URL(window.location.href); u.searchParams.set('demo', 'true'); window.location.href = u.toString(); }}
            className="px-7 py-3.5 rounded-xl font-medium text-base transition-colors"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Try Demo — no wallet needed
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {[
            { icon: Lock, label: 'End-to-end encrypted', color: '#4f46e5' },
            { icon: Shield, label: 'Merkle ZK proofs', color: '#7c3aed' },
            { icon: Zap, label: 'Private ZK tips', color: '#6366f1' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
              {label}
            </div>
          ))}
        </div>

        {/* App preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl w-full text-left">
          {[
            {
              title: 'Anonymous Groups',
              body: 'Join groups using a Merkle proof. Your address never touches the chain — only a nullifier proves you sent.',
              accent: '#4f46e5',
            },
            {
              title: 'Private Tips',
              body: 'Send Aleo credits privately. Groth16 SNARK hides your identity and balance. Receipt stored on-chain.',
              accent: '#7c3aed',
            },
            {
              title: 'Encrypted Relay',
              body: 'AES-256-GCM encrypted before leaving your device. The relay server sees only ciphertext — never plaintext.',
              accent: '#6366f1',
            },
          ].map(({ title, body, accent }) => (
            <div
              key={title}
              className="p-5 rounded-2xl"
              style={{ background: '#0f0f17', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full mb-4" style={{ background: accent }} />
              <h3 className="font-semibold text-white text-[15px] mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>{body}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 text-[12px]"
        style={{ color: '#1f2937', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        Built on Aleo · Zero-knowledge from day one
      </footer>

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConnectShield={handleShieldConnect}
          onConnectLeo={handleLeoConnect}
          connecting={connecting}
        />
      )}
    </div>
  );
}

export default App;
