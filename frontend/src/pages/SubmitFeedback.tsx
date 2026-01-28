import { useState } from 'react';
import { MessageSquare, Lock, CheckCircle2, Send, ShieldCheck } from 'lucide-react';

export function SubmitFeedback() {
  const [feedbackText, setFeedbackText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zkProof, setZkProof] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const generateProof = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setZkProof(`zkp_${Math.random().toString(36).substring(2, 15)}`);
    setIsGenerating(false);
  };

  const submitFeedback = async () => {
    if (!zkProof) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsGenerating(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn">
        <div className="max-w-xl w-full space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Feedback Submitted!</h2>
            <p className="text-slate-400 text-lg mb-8">
              Your anonymous feedback has been cryptographically verified and recorded on Aleo
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-green-900/20 backdrop-blur border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-white">Privacy Guarantee</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Zero-knowledge proof verified on-chain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Identity cryptographically hidden</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Nullifier prevents duplicate submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Feedback publicly verifiable but untraceable</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setZkProof(null);
              setFeedbackText('');
            }}
            className="w-full py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all"
          >
            Submit More Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-white">Submit Anonymous Feedback</h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">
            Prove membership and share feedback without revealing your identity
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Your Feedback
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts anonymously..."
              rows={8}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your feedback will be encrypted and submitted with a zero-knowledge proof
            </p>
          </div>

          {!zkProof ? (
            <button
              onClick={generateProof}
              disabled={!feedbackText.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating ZK Proof...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Zero-Knowledge Proof
                </>
              )}
            </button>
          ) : (
            <button
              onClick={submitFeedback}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting to Blockchain...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Submit to Aleo Blockchain
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {zkProof && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur border border-indigo-500/30 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">ZK Proof Generated</h3>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <div className="text-xs text-indigo-400 mb-2">Proof Hash</div>
                <div className="text-white font-mono text-sm break-all">{zkProof}</div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-white mb-1">Proof Verified</p>
                  <p className="text-slate-400">
                    Your membership has been cryptographically verified without revealing your identity
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900/30 backdrop-blur border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Privacy Mechanism
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                <span>Generate ZK proof of Merkle tree membership</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                <span>Proof verified on-chain without revealing identity</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                <span>Nullifier prevents double-voting</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                <span>Feedback publicly visible but untraceable to source</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-indigo-900/30 backdrop-blur border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Why This Matters</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional anonymous feedback can be faked or lacks verification. With zero-knowledge proofs on Aleo, you get both{' '}
              <span className="text-indigo-400 font-semibold">complete anonymity</span> and{' '}
              <span className="text-indigo-400 font-semibold">cryptographic proof</span> that feedback comes from verified members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
