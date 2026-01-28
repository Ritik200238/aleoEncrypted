// Chat Interface Component - Premium messaging area with Telegram features

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Lock, AlertCircle } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ReplyInputBar } from './MessageReply';
import { toast } from './Toast';
import { encryptionService } from '../services/encryptionService';
import { storageService } from '../services/storageService';
import type { Message, Reaction } from '../types/message';
import { MAX_MESSAGE_LENGTH, POLL_INTERVAL } from '../utils/constants';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  groupId: string;
  userAddress: string;
}

export function ChatInterface({ groupId, userAddress }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping] = useState(false); // Future: WebSocket integration
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageNonceRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load messages from storage
  useEffect(() => {
    const storedMessages = storageService.loadMessages(groupId);
    setMessages(storedMessages);
    scrollToBottom();
  }, [groupId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages (MVP approach)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // In production, this would fetch from blockchain
      // For MVP, we just reload from local storage
      const storedMessages = storageService.loadMessages(groupId);
      setMessages(storedMessages);
    }, POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setInputMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to true
    if (value && !isTyping) {
      setIsTyping(true);
      // In production, send typing event to server/blockchain
    }

    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Get message by ID
  const getMessageById = (messageId: string): Message | null => {
    return messages.find(m => m.id === messageId) || null;
  };

  // Handle reaction
  const handleReact = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const newReaction: Reaction = {
          emoji,
          userAddress,
          timestamp: Date.now(),
        };
        return { ...msg, reactions: [...reactions, newReaction] };
      }
      return msg;
    }));
    // In production, broadcast reaction to blockchain
  };

  // Handle remove reaction
  const handleRemoveReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions?.filter(
          r => !(r.emoji === emoji && r.userAddress === userAddress)
        ) || [];
        return { ...msg, reactions };
      }
      return msg;
    }));
    // In production, broadcast removal to blockchain
  };

  // Handle reply
  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputMessage.trim()) {
      return;
    }

    if (inputMessage.length > MAX_MESSAGE_LENGTH) {
      setError(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setSending(true);

    try {
      // Get group encryption key
      const groupKey = storageService.loadGroupKey(groupId);
      if (!groupKey) {
        throw new Error('Group key not found');
      }

      // Encrypt message content (now async with AES-GCM)
      const { ciphertext, nonce } = await encryptionService.encryptMessage(inputMessage, groupKey);

      // Encode for Aleo
      const encryptedContent = encryptionService.encodeForAleo(ciphertext, nonce);

      // Create member commitment (now async)
      const memberCommitment = await encryptionService.hashAddress(userAddress);

      // Get message nonce
      const messageNonce = messageNonceRef.current++;

      // Generate message ID (for MVP, using timestamp + random)
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Create message object with sending status and Telegram features
      const message: Message = {
        id: messageId,
        groupId,
        content: inputMessage,
        senderCommitment: memberCommitment,
        timestamp: Date.now(),
        nonce: messageNonce,
        isOwn: true,
        status: 'sending',
        deliveryStatus: 'sending',
        replyTo: replyingTo?.id,
        reactions: [],
        deliveredTo: [],
        readBy: [],
        edited: false,
      };

      // Add to UI immediately (optimistic update)
      setMessages([...messages, message]);
      setInputMessage('');
      setReplyingTo(null);
      setIsTyping(false);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Simulate blockchain transaction with delivery status tracking (MVP)
      // In production, this would use onChainMessageService

      // Stage 1: Sent (500ms)
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => m.id === messageId ? { ...m, deliveryStatus: 'sent' as const } : m)
        );
      }, 500);

      // Stage 2: Delivered (1000ms)
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => m.id === messageId ? { ...m, deliveryStatus: 'delivered' as const } : m)
        );
      }, 1000);

      // Stage 3: Blockchain confirmed (1500ms)
      setTimeout(() => {
        const confirmedMessage = {
          ...message,
          status: 'confirmed' as const,
          deliveryStatus: 'delivered' as const
        };
        storageService.addMessage(groupId, confirmedMessage);

        setMessages(prev =>
          prev.map(m => m.id === messageId ? confirmedMessage : m)
        );

        toast.success('Message confirmed on blockchain');
      }, 1500);

      console.log('✓ Message sent:', { messageId, encryptedContent });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const charCount = inputMessage.length;
  const charPercentage = (charCount / MAX_MESSAGE_LENGTH) * 100;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-sm">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center"
                >
                  <MessageSquare className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold mb-2"
                >
                  No messages yet
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground"
                >
                  Send the first encrypted message to get the conversation started!
                </motion.p>
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MessageBubble
                    message={message}
                    currentUserAddress={userAddress}
                    onReact={handleReact}
                    onRemoveReaction={handleRemoveReaction}
                    onReply={handleReply}
                    getMessageById={getMessageById}
                  />
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {otherUserTyping && (
                <TypingIndicator isGroup={true} />
              )}
            </>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="border-t border-border bg-card"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Reply Input Bar */}
        <AnimatePresence>
          {replyingTo && (
            <ReplyInputBar
              originalMessage={replyingTo}
              onCancel={cancelReply}
            />
          )}
        </AnimatePresence>

        <div className="p-4">
          {/* Error message */}
          <AnimatePresence>
            {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <motion.input
                type="text"
                value={inputMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={replyingTo ? 'Type your reply...' : 'Type a message...'}
              className={cn(
                'input-telegram w-full pr-12',
                charPercentage > 90 && 'border-amber-500/50',
                charPercentage >= 100 && 'border-destructive'
              )}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={sending}
              whileFocus={{ scale: 1.005 }}
              transition={{ duration: 0.2 }}
            />
            {/* Character counter */}
            {charCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded-full',
                    charPercentage < 90 && 'text-muted-foreground',
                    charPercentage >= 90 && charPercentage < 100 && 'text-amber-500',
                    charPercentage >= 100 && 'text-destructive bg-destructive/10'
                  )}
                >
                  {charCount}/{MAX_MESSAGE_LENGTH}
                </div>
              </motion.div>
            )}
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
              'transition-colors relative overflow-hidden',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              inputMessage.trim() && !sending
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-muted cursor-not-allowed'
            )}
            disabled={!inputMessage.trim() || sending}
            whileHover={inputMessage.trim() && !sending ? { scale: 1.05 } : {}}
            whileTap={inputMessage.trim() && !sending ? { scale: 0.95, rotate: 15 } : {}}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {sending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-5 h-5 text-white" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse effect on hover */}
            {inputMessage.trim() && !sending && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                initial={{ scale: 1, opacity: 0 }}
                whileHover={{ scale: 1.5, opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </form>

        {/* Encryption indicator */}
        <motion.div
          className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          </motion.div>
          <span>End-to-end encrypted with Aleo zero-knowledge proofs</span>
        </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
