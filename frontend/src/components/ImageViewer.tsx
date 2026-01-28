/**
 * ImageViewer Component - Production-ready Fullscreen Image Viewer
 * Lightbox modal for viewing images with navigation and controls
 *
 * Features:
 * - Fullscreen modal display
 * - Zoom in/out controls
 * - Navigate between images (arrow keys, buttons)
 * - Download and forward options
 * - Close on ESC key
 * - Touch/swipe gestures support
 * - Image metadata display
 * - Smooth animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  RotateCw,
  Maximize2,
  Info,
} from 'lucide-react';
import { MediaFile } from '../services/databaseService';
import { mediaService } from '../services/mediaService';
import { format } from 'date-fns';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile[];
  initialIndex?: number;
  onForward?: (media: MediaFile) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  onForward,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentMedia = media[currentIndex];

  /**
   * Navigate to previous image
   */
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoom(1);
      setRotation(0);
      setImageLoaded(false);
    }
  }, [currentIndex]);

  /**
   * Navigate to next image
   */
  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoom(1);
      setRotation(0);
      setImageLoaded(false);
    }
  }, [currentIndex, media.length]);

  /**
   * Zoom in
   */
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  /**
   * Zoom out
   */
  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  }, []);

  /**
   * Reset zoom
   */
  const resetZoom = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  /**
   * Rotate image
   */
  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  /**
   * Download current image
   */
  const downloadImage = useCallback(async () => {
    if (!currentMedia) return;

    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentMedia.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, [currentMedia]);

  /**
   * Share current image
   */
  const shareImage = useCallback(async () => {
    if (!currentMedia) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMedia.fileName,
          text: 'Check out this image',
          url: currentMedia.url,
        });
      } catch (error) {
        console.error('Failed to share image:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentMedia.url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  }, [currentMedia]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'i':
        case 'I':
          setShowInfo((prev) => !prev);
          break;
        default:
          break;
      }
    },
    [isOpen, onClose, goToPrevious, goToNext, zoomIn, zoomOut, resetZoom]
  );

  /**
   * Handle drag/swipe gestures
   */
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;

      if (info.offset.x > swipeThreshold) {
        goToPrevious();
      } else if (info.offset.x < -swipeThreshold) {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  /**
   * Setup keyboard listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Prevent scroll when viewer is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * Update index when initialIndex changes
   */
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
    setImageLoaded(false);
  }, [initialIndex]);

  if (!isOpen || !currentMedia) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close viewer"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          {/* Image Counter */}
          <div className="px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-medium">
            {currentIndex + 1} / {media.length}
          </div>

          {/* Info Button */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label="Toggle info"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg p-2">
            {/* Zoom Out */}
            <button
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>

            {/* Zoom Level */}
            <span className="px-3 text-white text-sm font-medium min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>

            {/* Zoom In */}
            <button
              onClick={zoomIn}
              disabled={zoom >= 5}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Rotate */}
            <button
              onClick={rotate}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              aria-label="Rotate"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>

            {/* Reset */}
            <button
              onClick={resetZoom}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Download */}
            <button
              onClick={downloadImage}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              aria-label="Download"
            >
              <Download className="w-5 h-5 text-white" />
            </button>

            {/* Share */}
            <button
              onClick={shareImage}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>

            {/* Forward (if callback provided) */}
            {onForward && (
              <>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button
                  onClick={() => onForward(currentMedia)}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm font-medium transition-colors"
                >
                  Forward
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation - Previous */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Navigation - Next */}
        {currentIndex < media.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          drag={zoom === 1}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative max-w-full max-h-full flex items-center justify-center p-20"
        >
          <motion.img
            ref={imageRef}
            src={currentMedia.url}
            alt={currentMedia.fileName}
            onLoad={() => setImageLoaded(true)}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? 'grab' : 'default',
            }}
            drag={zoom > 1}
            dragConstraints={imageRef}
            dragElastic={0}
            className={`max-w-full max-h-full object-contain transition-transform select-none ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Loading Indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-20 bottom-20 w-80 bg-white/10 backdrop-blur-lg rounded-lg p-6 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Image Info</h3>

              <div className="space-y-4">
                {/* Filename */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Filename</p>
                  <p className="text-sm text-white break-all">{currentMedia.fileName}</p>
                </div>

                {/* File Size */}
                <div>
                  <p className="text-xs text-white/60 mb-1">File Size</p>
                  <p className="text-sm text-white">
                    {mediaService.formatFileSize(currentMedia.fileSize)}
                  </p>
                </div>

                {/* MIME Type */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Type</p>
                  <p className="text-sm text-white">{currentMedia.mimeType}</p>
                </div>

                {/* Upload Date */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Uploaded</p>
                  <p className="text-sm text-white">
                    {format(new Date(currentMedia.uploadedAt), 'PPpp')}
                  </p>
                </div>

                {/* IPFS Hash */}
                {currentMedia.ipfsHash && (
                  <div>
                    <p className="text-xs text-white/60 mb-1">IPFS Hash</p>
                    <p className="text-sm text-white font-mono break-all">
                      {currentMedia.ipfsHash}
                    </p>
                  </div>
                )}

                {/* Message ID */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Message ID</p>
                  <p className="text-sm text-white font-mono break-all">
                    {currentMedia.messageId}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Hint */}
        <div className="absolute bottom-4 right-4 text-xs text-white/40">
          <p>ESC to close • Arrow keys to navigate • +/- to zoom • I for info</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;
