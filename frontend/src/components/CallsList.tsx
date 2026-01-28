/**
 * Calls List - Telegram-style call history
 * Shows recent calls with status
 */

import { motion } from 'framer-motion';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface Call {
  id: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number; // in seconds
}

// Mock call history
const mockCalls: Call[] = [
  {
    id: '1',
    contactName: 'Alice',
    contactAvatar: '👩',
    type: 'video',
    direction: 'incoming',
    timestamp: Date.now() - 1000 * 60 * 30,
    duration: 1245,
  },
  {
    id: '2',
    contactName: 'Bob',
    contactAvatar: '👨',
    type: 'voice',
    direction: 'outgoing',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    duration: 420,
  },
  {
    id: '3',
    contactName: 'Charlie',
    contactAvatar: '🧑',
    type: 'voice',
    direction: 'missed',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
  },
];

export function CallsList() {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Calls</h2>
            <p className="text-sm text-muted-foreground">
              Voice and video call history
            </p>
          </div>
          <motion.button
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="New Call"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto">
        {mockCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Phone className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No calls yet</p>
            <p className="text-sm text-muted-foreground">
              Start a voice or video call with your contacts
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {mockCalls.map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl">
                    {call.contactAvatar}
                  </div>

                  {/* Call Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{call.contactName}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {call.direction === 'incoming' && (
                        <PhoneIncoming className="w-3 h-3 text-green-500" />
                      )}
                      {call.direction === 'outgoing' && (
                        <PhoneOutgoing className="w-3 h-3 text-blue-500" />
                      )}
                      {call.direction === 'missed' && (
                        <PhoneMissed className="w-3 h-3 text-destructive" />
                      )}
                      <span className={cn(
                        call.direction === 'missed' && 'text-destructive'
                      )}>
                        {call.direction === 'missed' ? 'Missed' : call.direction}
                      </span>
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time & Action */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(call.timestamp)}
                    </span>
                    <motion.button
                      className={cn(
                        'p-2 rounded-full transition-colors',
                        call.type === 'video'
                          ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={`Start ${call.type} call`}
                    >
                      {call.type === 'video' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Notice */}
      <div className="p-4 border-t border-border bg-accent/30">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium mb-1">📞 Aleo WebRTC Integration</p>
          <p className="text-xs">End-to-end encrypted voice & video calls coming soon</p>
        </div>
      </div>
    </div>
  );
}
