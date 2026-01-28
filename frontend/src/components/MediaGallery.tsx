/**
 * MediaGallery Component - Production-ready Media Grid
 * Grid layout for displaying chat media with filtering and lazy loading
 *
 * Features:
 * - 3-column responsive grid
 * - Filter tabs (All, Photos, Videos, Files)
 * - Lazy loading with Intersection Observer
 * - Click to open lightbox
 * - Download and share functionality
 * - Thumbnail support
 * - Loading states
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Share2,
  Loader2,
  ZoomIn,
  Calendar,
} from 'lucide-react';
import { MediaFile } from '../services/databaseService';
import { mediaService } from '../services/mediaService';
import ImageViewer from './ImageViewer';
import { format } from 'date-fns';

interface MediaGalleryProps {
  chatId: string;
  onMediaSelect?: (media: MediaFile) => void;
  className?: string;
}

type FilterType = 'all' | 'image' | 'video' | 'file';

const MediaGallery: React.FC<MediaGalleryProps> = ({
  chatId,
  onMediaSelect,
  className = '',
}) => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Load media from database
   */
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const allMedia = await mediaService.getMediaByChat(chatId);
      setMedia(allMedia);
      setFilteredMedia(allMedia);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  /**
   * Filter media by type
   */
  const filterMedia = useCallback(
    (type: FilterType) => {
      setActiveFilter(type);

      if (type === 'all') {
        setFilteredMedia(media);
      } else {
        setFilteredMedia(media.filter((m) => m.type === type));
      }
    },
    [media]
  );

  /**
   * Setup Intersection Observer for lazy loading
   */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const mediaId = entry.target.getAttribute('data-media-id');
            if (mediaId) {
              setVisibleItems((prev) => new Set([...prev, mediaId]));
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  /**
   * Load media on mount
   */
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  /**
   * Open media in viewer
   */
  const openViewer = useCallback((item: MediaFile) => {
    setSelectedMedia(item);
    setViewerOpen(true);
    onMediaSelect?.(item);
  }, [onMediaSelect]);

  /**
   * Close viewer
   */
  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setSelectedMedia(null);
  }, []);

  /**
   * Download media
   */
  const downloadMedia = useCallback(async (item: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download media:', error);
    }
  }, []);

  /**
   * Share media
   */
  const shareMedia = useCallback(async (item: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.fileName,
          text: `Check out this ${item.type}`,
          url: item.url,
        });
      } catch (error) {
        console.error('Failed to share media:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(item.url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  }, []);

  /**
   * Get media icon
   */
  const getMediaIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'file':
        return <FileText className="w-6 h-6" />;
    }
  };

  /**
   * Get filter count
   */
  const getFilterCount = (type: FilterType) => {
    if (type === 'all') return media.length;
    return media.filter((m) => m.type === type).length;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Media Gallery
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { type: 'all' as const, label: 'All', icon: null },
          { type: 'image' as const, label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
          { type: 'video' as const, label: 'Videos', icon: <Video className="w-4 h-4" /> },
          { type: 'file' as const, label: 'Files', icon: <FileText className="w-4 h-4" /> },
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => filterMedia(type)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2
              ${
                activeFilter === type
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {icon}
            {label}
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs
                ${
                  activeFilter === type
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {getFilterCount(type)}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMedia.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {getMediaIcon(activeFilter === 'all' ? 'image' : activeFilter)}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            No {activeFilter === 'all' ? 'media' : `${activeFilter}s`} yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Shared {activeFilter === 'all' ? 'media' : `${activeFilter}s`} will appear here
          </p>
        </div>
      )}

      {/* Media Grid */}
      {!loading && filteredMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((item, index) => (
              <MediaGridItem
                key={item.id}
                item={item}
                index={index}
                visible={visibleItems.has(item.id)}
                observerRef={observerRef}
                onClick={() => openViewer(item)}
                onDownload={(e) => downloadMedia(item, e)}
                onShare={(e) => shareMedia(item, e)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Image Viewer */}
      {selectedMedia && (
        <ImageViewer
          isOpen={viewerOpen}
          onClose={closeViewer}
          media={filteredMedia.filter((m) => m.type === 'image')}
          initialIndex={filteredMedia.findIndex((m) => m.id === selectedMedia.id)}
        />
      )}
    </div>
  );
};

/**
 * Media Grid Item Component
 */
interface MediaGridItemProps {
  item: MediaFile;
  index: number;
  visible: boolean;
  observerRef: React.RefObject<IntersectionObserver>;
  onClick: () => void;
  onDownload: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

const MediaGridItem: React.FC<MediaGridItemProps> = ({
  item,
  index,
  visible,
  observerRef,
  onClick,
  onDownload,
  onShare,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  /**
   * Observe item for lazy loading
   */
  useEffect(() => {
    const element = itemRef.current;
    const observer = observerRef.current;

    if (element && observer) {
      observer.observe(element);
    }

    return () => {
      if (element && observer) {
        observer.unobserve(element);
      }
    };
  }, [observerRef]);

  return (
    <motion.div
      ref={itemRef}
      data-media-id={item.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
    >
      {/* Media Content */}
      {visible && (
        <>
          {item.type === 'image' && (
            <img
              src={item.thumbnailUrl || item.url}
              alt={item.fileName}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
          )}

          {item.type === 'video' && (
            <div className="relative w-full h-full">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-gray-800 border-y-6 border-y-transparent ml-1" />
                </div>
              </div>
            </div>
          )}

          {item.type === 'file' && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 p-4">
              <FileText className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full">
                {item.fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {mediaService.formatFileSize(item.fileSize)}
              </p>
            </div>
          )}
        </>
      )}

      {/* Loading Placeholder */}
      {!visible && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-8 h-8 text-white mb-2" />
          <p className="text-xs text-white font-medium">View</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDownload}
          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={onShare}
          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Date Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
      </div>
    </motion.div>
  );
};

export default MediaGallery;
