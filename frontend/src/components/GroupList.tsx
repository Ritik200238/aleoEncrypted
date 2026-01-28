// Group List Component - Premium Telegram-style sidebar with animations
// Optimized with React.memo for smooth 60 FPS scrolling

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Crown } from 'lucide-react';
import type { Group } from '../types/group';
import { getAvatarColor, getInitials, formatMemberCount } from '../utils/formatters';
import { cn } from '../lib/utils';

interface GroupListProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  loading?: boolean;
}

function GroupListComponent({ groups, selectedGroupId, onSelectGroup, loading = false }: GroupListProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <div className="skeleton w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4"
        >
          <Users className="w-8 h-8 text-muted-foreground" />
        </motion.div>
        <h3 className="text-sm font-medium text-foreground mb-1">No groups yet</h3>
        <p className="text-xs text-muted-foreground">Create your first private group to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      <AnimatePresence mode="popLayout">
        {groups.map((group, index) => {
          const isSelected = group.id === selectedGroupId;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
              layout
            >
              <motion.button
                onClick={() => onSelectGroup(group.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                  'hover:bg-accent cursor-pointer border-l-4',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  isSelected
                    ? 'bg-accent/50 border-primary'
                    : 'border-transparent hover:border-border'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                {/* Avatar with animation */}
                <motion.div
                  className="relative"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center',
                      'text-white font-semibold shadow-sm relative overflow-hidden'
                    )}
                    style={{ backgroundColor: getAvatarColor(group.id) }}
                  >
                    {getInitials(group.name)}

                    {/* Shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                      initial={{ opacity: 0, x: '-100%' }}
                      whileHover={{ opacity: 1, x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Active indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-group-indicator"
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    />
                  )}
                </motion.div>

                {/* Group Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      'font-medium truncate text-sm',
                      isSelected ? 'text-foreground' : 'text-foreground/90'
                    )}>
                      {group.name}
                    </h3>
                    {group.owner && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Crown className="w-3 h-3 text-primary flex-shrink-0" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{formatMemberCount(group.memberCount)}</span>
                    </div>
                  </div>
                </div>

                {/* Privacy indicator */}
                <motion.div
                  className={cn(
                    'flex-shrink-0',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock className="w-4 h-4" strokeWidth={2} />
                </motion.div>

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0" />
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Memoized export for performance - only re-render when groups or selection changes
export const GroupList = memo(GroupListComponent);
