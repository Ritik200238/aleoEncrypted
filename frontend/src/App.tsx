import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { Network } from '@provablehq/aleo-types';
import { CleanTelegramApp } from './components/CleanTelegramApp';
import { MessageSquare, Shield, Zap } from 'lucide-react';
import './App.css';

function App() {
  const { connected, address, connect, connecting } = useWallet();

  // Demo mode: ?demo=true bypasses wallet for testing/judging
  const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
  const userAddress = address || 'aleo1h7yz0n5qx9uwyaxsprspkm5j6leey9eyzmjv9k7zyyd5nt5lguysystq59';

  if (isDemo) {
    return (
      <div className="flex flex-col h-screen">
        {/* Judge demo banner */}
        <div className="flex items-center justify-between px-4 py-2 text-xs font-mono shrink-0"
          style={{ background: 'linear-gradient(90deg, #1e1b4b, #312e81)', color: '#a5b4fc' }}>
          <span>🔬 DEMO MODE — Aleo Testnet | Deployed contracts: group_manager · membership_proof · message_handler</span>
          <div className="flex gap-4">
            <a href="https://explorer.aleo.org/transaction/at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew?network=testnet"
              target="_blank" rel="noopener noreferrer"
              className="underline hover:text-white transition-colors">group_manager TX</a>
            <a href="https://explorer.aleo.org/transaction/at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q?network=testnet"
              target="_blank" rel="noopener noreferrer"
              className="underline hover:text-white transition-colors">message_handler TX</a>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <CleanTelegramApp userAddress={userAddress} />
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-8 animate-fadeIn">
            {/* Hero Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <MessageSquare className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent tracking-tight">
                EncryptedSocial
              </h1>
              <p className="text-xl text-slate-300 max-w-lg mx-auto leading-relaxed">
                Private messaging powered by{' '}
                <span className="text-blue-400 font-semibold">Aleo blockchain</span>
                {' '}— E2E encrypted messages + ZK private payments
              </p>
            </div>

            {/* Connect Button */}
            <div className="flex flex-col items-center gap-4 pt-6">
              <button
                onClick={() => connect(Network.TESTNET)}
                disabled={connecting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {connecting ? 'Connecting...' : 'Connect Shield Wallet'}
              </button>
              <p className="text-sm text-slate-400">
                Connect your Shield Wallet to start messaging privately
              </p>
              {/* Demo mode button for judges */}
              <button
                onClick={() => { const url = new URL(window.location.href); url.searchParams.set('demo', 'true'); window.location.href = url.toString(); }}
                className="mt-2 text-sm text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                👁️ Try Demo Mode (no wallet needed)
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 pt-12 max-w-3xl mx-auto">
              {[
                { icon: Shield, label: 'E2E Encrypted', desc: 'AES-256-GCM messages' },
                { icon: Zap, label: 'ZK Payments', desc: 'credits.aleo transfer_private' },
                { icon: MessageSquare, label: 'On-Chain', desc: 'Verified on Aleo Testnet' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition-all hover:scale-105"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <feature.icon className="w-8 h-8 text-blue-400 mb-3 mx-auto" strokeWidth={1.5} />
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.label}</h3>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Telegram app when connected
  return <CleanTelegramApp userAddress={userAddress} />;
}

export default App;
