/**
 * Media System - Centralized Exports
 * Import all media-related components, services, and utilities from one place
 *
 * Usage:
 *   import { MediaPicker, MediaGallery, ImageViewer, mediaService } from './media';
 */

// Components
export { default as MediaPicker } from '../components/MediaPicker';
export { default as MediaGallery } from '../components/MediaGallery';
export { default as ImageViewer } from '../components/ImageViewer';

// Services
export { mediaService, default as MediaService } from '../services/mediaService';
export type { UploadResult, UploadProgressCallback } from '../services/mediaService';
export {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '../services/mediaService';

// Database Types
export type { MediaFile } from '../services/databaseService';

// Utilities
export { default as mediaUtils } from '../utils/mediaUtils';
export {
  getFileCategory,
  getFileIcon,
  getFileColor,
  isImage,
  isVideo,
  isDocument,
  formatFileSize,
  downloadFile,
  shareURL,
  compressImage,
} from '../utils/mediaUtils';
export type { MediaCategory } from '../utils/mediaUtils';

// Re-export everything for convenience
export * from '../utils/mediaUtils';
