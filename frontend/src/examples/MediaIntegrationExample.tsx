/**
 * Media Integration Example
 * Complete example showing how to integrate all media components
 * into a chat application
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Image as ImageIcon,
  X,
  Send,
} from 'lucide-react';
import MediaPicker from '../components/MediaPicker';
import MediaGallery from '../components/MediaGallery';
import { mediaService, UploadResult } from '../services/mediaService';
import { databaseService, Message } from '../services/databaseService';
import { nanoid } from 'nanoid';

/**
 * Example: Chat Message Input with Media Support
 */
export function ChatInputWithMedia({ chatId }: { chatId: string }) {
  const [message, setMessage] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadResult[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim() && uploadedMedia.length === 0) return;

    const messageId = nanoid();

    // Create message
    const newMessage: Message = {
      id: messageId,
      chatId,
      sender: 'current-user-address',
      content: message,
      timestamp: Date.now(),
      status: 'pending',
      mediaUrls: uploadedMedia.map(m => m.url),
    };

    // Save message
    await databaseService.addMessage(newMessage);

    // Save media metadata
    for (const media of uploadedMedia) {
      await mediaService.saveMediaMetadata(messageId, chatId, media);
    }

    // Reset
    setMessage('');
    setUploadedMedia([]);
  };

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadedMedia(prev => [...prev, ...results]);
    setShowMediaPicker(false);
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      {/* Media Previews */}
      <AnimatePresence>
        {uploadedMedia.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 p-2 overflow-x-auto"
          >
            {uploadedMedia.map((media, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={media.thumbnailUrl || media.url}
                  alt={media.fileName}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4 bg-gray-100 dark:bg-gray-800">
        <button
          onClick={() => setShowMediaPicker(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-white dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSendMessage}
          disabled={!message.trim() && uploadedMedia.length === 0}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMediaPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Upload Files
              </h2>
              <MediaPicker
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowMediaPicker(false)}
                maxFiles={10}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Example: Media Gallery in Chat Settings
 */
export function ChatMediaTab({ chatId }: { chatId: string }) {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowGallery(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <ImageIcon className="w-5 h-5" />
        View Media Gallery
      </button>

      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto"
          >
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Media Gallery
                </h1>
                <button
                  onClick={() => setShowGallery(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <MediaGallery
                chatId={chatId}
                onMediaSelect={(media) => {
                  console.log('Selected media:', media);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Example: Message Bubble with Media
 */
export function MessageWithMedia({ message }: { message: Message }) {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      if (message.mediaUrls && message.mediaUrls.length > 0) {
        const media = await mediaService.getMediaByChat(message.chatId);
        const messageMedia = media.filter(m => m.messageId === message.id);
        setMediaFiles(messageMedia);
      }
    };

    loadMedia();
  }, [message]);

  return (
    <div className="max-w-md">
      {/* Media Grid */}
      {mediaFiles.length > 0 && (
        <div className={`grid gap-1 mb-2 ${
          mediaFiles.length === 1 ? 'grid-cols-1' :
          mediaFiles.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {mediaFiles.slice(0, 4).map((media, index) => (
            <div
              key={media.id}
              className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
            >
              {media.type === 'image' && (
                <img
                  src={media.thumbnailUrl || media.url}
                  alt={media.fileName}
                  className="w-full h-full object-cover"
                />
              )}
              {media.type === 'video' && (
                <div className="relative w-full h-full">
                  <img
                    src={media.thumbnailUrl}
                    alt={media.fileName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-8 border-l-gray-800 border-y-6 border-y-transparent ml-1" />
                    </div>
                  </div>
                </div>
              )}
              {index === 3 && mediaFiles.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{mediaFiles.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message Text */}
      {message.content && (
        <div className="bg-blue-500 text-white rounded-lg px-4 py-2">
          <p>{message.content}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Complete Chat with Media Integration
 */
export function CompleteChatExample() {
  const [currentChatId] = useState('chat-123');

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold">Chat</h1>
        <ChatMediaTab chatId={currentChatId} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages would go here */}
      </div>

      {/* Input Area */}
      <ChatInputWithMedia chatId={currentChatId} />
    </div>
  );
}

/**
 * Example: Standalone Media Uploader
 */
export function StandaloneMediaUploader() {
  const handleUpload = async (results: UploadResult[]) => {
    console.log('Upload complete:', results);

    // Save to database or process further
    for (const result of results) {
      console.log('IPFS URL:', result.url);
      console.log('IPFS Hash:', result.ipfsHash);
      console.log('Thumbnail:', result.thumbnailUrl);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Media</h1>
      <MediaPicker
        onUploadComplete={handleUpload}
        maxFiles={5}
      />
    </div>
  );
}

/**
 * Example: Media Statistics Dashboard
 */
export function MediaStatsDashboard({ chatId }: { chatId: string }) {
  const [stats, setStats] = useState({
    totalSize: 0,
    imageCount: 0,
    videoCount: 0,
    fileCount: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const allMedia = await mediaService.getMediaByChat(chatId);
      const images = allMedia.filter(m => m.type === 'image');
      const videos = allMedia.filter(m => m.type === 'video');
      const files = allMedia.filter(m => m.type === 'file');
      const totalSize = await mediaService.getMediaSize(chatId);

      setStats({
        totalSize,
        imageCount: images.length,
        videoCount: videos.length,
        fileCount: files.length,
      });
    };

    loadStats();
  }, [chatId]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {mediaService.formatFileSize(stats.totalSize)}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
        <p className="text-2xl font-bold text-blue-500">
          {stats.imageCount}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
        <p className="text-2xl font-bold text-purple-500">
          {stats.videoCount}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Files</p>
        <p className="text-2xl font-bold text-green-500">
          {stats.fileCount}
        </p>
      </div>
    </div>
  );
}

export default CompleteChatExample;
