import { useState } from 'react';
import { Eye, CheckCircle2, Lock, Code } from 'lucide-react';

interface FeedbackItem {
  id: string;
  content: string;
  timestamp: string;
  verified: boolean;
  zkProof: string;
}

export function ViewFeedback() {
  const [feedbackList] = useState<FeedbackItem[]>([
    {
      id: '1',
      content: 'The new remote work policy has significantly improved my work-life balance. The flexibility to choose my hours has reduced stress and increased productivity.',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      verified: true,
      zkProof: `0x${Math.random().toString(16).substring(2, 50)}`
    },
    {
      id: '2',
      content: 'Team communication could be better. Sometimes important decisions are made without involving all stakeholders. More transparency would be appreciated.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      verified: true,
      zkProof: `0x${Math.random().toString(16).substring(2, 50)}`
    },
    {
      id: '3',
      content: 'The quarterly bonuses are a great motivation. Recognition for hard work keeps morale high across the team.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      verified: true,
      zkProof: `0x${Math.random().toString(16).substring(2, 50)}`
    }
  ]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffHrs > 1) return `${diffHrs} hours ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-white">Verified Feedback</h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">
            All feedback is cryptographically verified but completely anonymous
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Feedback', value: feedbackList.length, color: 'cyan' },
          { label: 'Verified Proofs', value: feedbackList.filter(f => f.verified).length, color: 'green' },
          { label: 'Anonymity Level', value: '100%', color: 'purple' }
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
          >
            <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {feedbackList.map((item, i) => (
          <div
            key={item.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all animate-fadeIn"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  🎭
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Anonymous Employee</span>
                    {item.verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{formatDate(item.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                ZK Proof
              </div>
            </div>

            <p className="text-slate-200 leading-relaxed mb-4 pl-15">
              {item.content}
            </p>

            <details className="pl-15 group">
              <summary className="cursor-pointer text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
                <Code className="w-4 h-4" />
                View Cryptographic Proof
              </summary>
              <div className="mt-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">ZK Proof Hash</div>
                  <div className="text-xs font-mono text-purple-400 break-all">{item.zkProof}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Verification</div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      On-chain Verified
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Privacy</div>
                    <div className="text-xs text-cyan-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Untraceable
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    This feedback was submitted with a zero-knowledge Merkle proof, verifying membership without revealing identity.
                  </p>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 backdrop-blur border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" />
          How Verification Works
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>Each submission includes a zero-knowledge proof of Merkle tree membership</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>Proofs are verified on Aleo blockchain without revealing identity</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>Cryptographically impossible to link feedback to specific employee</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>Nullifier system prevents duplicate submissions from same person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
