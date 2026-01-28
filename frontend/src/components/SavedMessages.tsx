/**
 * Saved Messages - Personal note-taking space
 * Like Telegram's "Saved Messages" for bookmarking and notes
 */

import { motion } from 'framer-motion';
import { Bookmark, Plus, MessageCircle } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

interface SavedMessagesProps {
  userAddress: string;
}

const SAVED_MESSAGES_CHAT_ID = 'saved_messages';

export function SavedMessages({ userAddress }: SavedMessagesProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Saved Messages</h3>
            <p className="text-xs text-muted-foreground">
              Your personal cloud storage
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface (reusing existing component) */}
      <ChatInterface
        groupId={SAVED_MESSAGES_CHAT_ID}
        userAddress={userAddress}
      />

      {/* Info Footer */}
      <div className="p-3 border-t border-border bg-accent/30">
        <div className="text-xs text-muted-foreground text-center">
          <p>
            <Bookmark className="w-3 h-3 inline mr-1" />
            Forward messages here to save them for later
          </p>
          <p className="mt-1">All saved messages are end-to-end encrypted with Aleo</p>
        </div>
      </div>
    </div>
  );
}
