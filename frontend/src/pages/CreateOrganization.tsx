import { useState } from 'react';
import { Building2, Users, Plus, X, Check, Sparkles } from 'lucide-react';

export function CreateOrganization() {
  const [orgName, setOrgName] = useState('');
  const [employees, setEmployees] = useState<string[]>([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addEmployee = () => {
    if (newEmployee.trim() && newEmployee.startsWith('aleo1')) {
      setEmployees([...employees, newEmployee.trim()]);
      setNewEmployee('');
    }
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const generateMerkleTree = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockRoot = `0x${Math.random().toString(16).substring(2, 66)}`;
    setMerkleRoot(mockRoot);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl">
              <Building2 className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-white">Create Organization</h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">
            Add employee addresses and generate a Merkle tree for verified anonymous feedback
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <label className="block text-sm font-semibold text-slate-300 mb-3">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., Acme Corp"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
            />
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employee Addresses ({employees.length})
            </label>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newEmployee}
                onChange={(e) => setNewEmployee(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
                placeholder="aleo1..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
              <button
                onClick={addEmployee}
                disabled={!newEmployee.trim() || !newEmployee.startsWith('aleo1')}
                className="px-4 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map((addr, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between group hover:border-cyan-500/50 transition-all"
                >
                  <span className="text-sm text-slate-300 font-mono truncate flex-1">{addr}</span>
                  <button
                    onClick={() => removeEmployee(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {employees.length === 0 && (
                <div className="text-center py-8 text-slate-500">No employees added yet</div>
              )}
            </div>
          </div>

          <button
            onClick={generateMerkleTree}
            disabled={!orgName || employees.length === 0 || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Merkle Tree...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Generate Merkle Tree
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900/80 to-indigo-900/30 backdrop-blur border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-cyan-400" />
              Organization Preview
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Name</div>
                <div className="text-white font-semibold">{orgName || <span className="text-slate-600">Not set</span>}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Total Members</div>
                <div className="text-white font-semibold text-2xl">{employees.length}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Tree Depth</div>
                <div className="text-white font-semibold">{employees.length > 0 ? Math.ceil(Math.log2(employees.length)) : 0} levels</div>
              </div>
            </div>
          </div>

          {merkleRoot && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 backdrop-blur border border-cyan-500/30 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Merkle Root Generated</h3>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <div className="text-xs text-cyan-400 mb-2">Root Hash</div>
                <div className="text-white font-mono text-sm break-all">{merkleRoot}</div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-white mb-1">Ready for Deployment</p>
                  <p className="text-slate-400">Store this Merkle root on-chain to enable verified anonymous feedback from {employees.length} members</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900/30 backdrop-blur border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">How it works</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Add employee Aleo addresses to create a verified group</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Generate a Merkle tree with cryptographic proofs</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Store the root hash on Aleo blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Employees can now submit anonymous verified feedback</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
