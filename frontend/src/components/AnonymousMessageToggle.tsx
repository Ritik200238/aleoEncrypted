/**
 * Anonymous Message Toggle
 *
 * Enables anonymous messaging in group chats.
 * When active, the sender's address is replaced with "Anonymous" in the relay.
 * Full ZK membership proof is produced by group_membership.aleo/submit_feedback.
 */

import { Shield, ShieldOff } from 'lucide-react';

interface AnonymousMessageToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  isGroup: boolean;
  theme: Record<string, string>;
}

export function AnonymousMessageToggle({ isEnabled, onToggle, theme }: AnonymousMessageToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isEnabled)}
      title={isEnabled ? 'Anonymous mode ON — click to disable' : 'Enable anonymous mode (identity hidden from relay)'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: isEnabled ? '#6366f120' : (theme.cardBg || theme.input),
        color: isEnabled ? '#6366f1' : theme.textSecondary,
        border: `1px solid ${isEnabled ? '#6366f150' : theme.border}`,
      }}
    >
      {isEnabled ? <Shield size={13} /> : <ShieldOff size={13} />}
      {isEnabled ? 'Anon' : 'Visible'}
    </button>
  );
}
