import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { CleanTelegramApp } from './components/CleanTelegramApp';
import { MessageSquare, Shield, Zap } from 'lucide-react';
import './App.css';

function App() {
  const { connected, publicKey } = useWallet();

  // Get user address from wallet
  const userAddress = publicKey?.toString() || 'aleo1anonymous';

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
                {' '}with zero-knowledge proofs
              </p>
            </div>

            {/* Connect Button */}
            <div className="flex flex-col items-center gap-4 pt-6">
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !px-8 !py-4 !text-lg !font-semibold !rounded-xl !shadow-lg hover:!shadow-blue-500/50 !transition-all hover:!scale-105" />
              <p className="text-sm text-slate-400">
                Connect your Aleo wallet to start messaging
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 pt-12 max-w-3xl mx-auto">
              {[
                { icon: Shield, label: 'Private', desc: 'End-to-end encrypted' },
                { icon: MessageSquare, label: 'Decentralized', desc: 'No central server' },
                { icon: Zap, label: 'Fast', desc: 'Real-time messaging' }
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
