/**
 * Anonymous Message Toggle
 *
 * Enables ZK anonymous messaging in group chats.
 * When active, the sender's address is hidden — only membership proof is verified.
 */

import { Shield, ShieldOff } from 'lucide-react';

interface AnonymousMessageToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  theme: Record<string, string>;
}

export function AnonymousMessageToggle({ enabled, onChange, theme }: AnonymousMessageToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      title={enabled ? 'Anonymous mode ON — click to disable' : 'Enable anonymous mode (ZK proof)'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: enabled ? '#6366f120' : theme.inputBg,
        color: enabled ? '#6366f1' : theme.textSecondary,
        border: `1px solid ${enabled ? '#6366f150' : theme.border}`,
      }}
    >
      {enabled ? <Shield size={13} /> : <ShieldOff size={13} />}
      {enabled ? 'Anon' : 'Visible'}
    </button>
  );
}
