/**
 * Media Utilities
 * Helper functions for media handling, validation, and processing
 */

import {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
} from '../services/mediaService';

/**
 * File type categories
 */
export const MEDIA_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const;

export type MediaCategory = typeof MEDIA_CATEGORIES[keyof typeof MEDIA_CATEGORIES];

/**
 * Extended file type support
 */
export const FILE_TYPE_INFO = {
  // Images
  'image/jpeg': { category: 'image', icon: '🖼️', color: 'blue' },
  'image/jpg': { category: 'image', icon: '🖼️', color: 'blue' },
  'image/png': { category: 'image', icon: '🖼️', color: 'blue' },
  'image/gif': { category: 'image', icon: '🖼️', color: 'blue' },
  'image/webp': { category: 'image', icon: '🖼️', color: 'blue' },
  'image/svg+xml': { category: 'image', icon: '🖼️', color: 'blue' },

  // Videos
  'video/mp4': { category: 'video', icon: '🎬', color: 'purple' },
  'video/webm': { category: 'video', icon: '🎬', color: 'purple' },
  'video/quicktime': { category: 'video', icon: '🎬', color: 'purple' },
  'video/x-msvideo': { category: 'video', icon: '🎬', color: 'purple' },

  // Documents
  'application/pdf': { category: 'document', icon: '📄', color: 'red' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    category: 'document',
    icon: '📝',
    color: 'blue',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    category: 'document',
    icon: '📊',
    color: 'green',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    category: 'document',
    icon: '📊',
    color: 'orange',
  },
  'text/plain': { category: 'document', icon: '📄', color: 'gray' },
  'text/csv': { category: 'document', icon: '📊', color: 'green' },

  // Archives
  'application/zip': { category: 'archive', icon: '📦', color: 'yellow' },
  'application/x-rar-compressed': { category: 'archive', icon: '📦', color: 'yellow' },
  'application/x-7z-compressed': { category: 'archive', icon: '📦', color: 'yellow' },
  'application/gzip': { category: 'archive', icon: '📦', color: 'yellow' },
} as const;

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): MediaCategory {
  const info = FILE_TYPE_INFO[mimeType as keyof typeof FILE_TYPE_INFO];
  return info?.category || MEDIA_CATEGORIES.OTHER;
}

/**
 * Get file icon from MIME type
 */
export function getFileIcon(mimeType: string): string {
  const info = FILE_TYPE_INFO[mimeType as keyof typeof FILE_TYPE_INFO];
  return info?.icon || '📎';
}

/**
 * Get file color theme from MIME type
 */
export function getFileColor(mimeType: string): string {
  const info = FILE_TYPE_INFO[mimeType as keyof typeof FILE_TYPE_INFO];
  return info?.color || 'gray';
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType: string): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(mimeType);
}

/**
 * Check if file is a document
 */
export function isDocument(mimeType: string): boolean {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;
  return filename.slice(0, lastDot);
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse file size string to bytes
 */
export function parseFileSize(sizeStr: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2];

  return value * (units[unit] || 1);
}

/**
 * Validate file size against limit
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number
): { valid: boolean; error?: string } {
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(fileSize)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed`,
    };
  }
  return { valid: true };
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
  const mimeTypes: { [key: string]: string } = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    gz: 'application/gzip',
  };

  return mimeTypes[extension.toLowerCase()] || null;
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Calculate dimensions to fit within bounds while maintaining aspect ratio
 */
export function calculateFitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = getFileNameWithoutExtension(originalFilename);

  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`;
}

/**
 * Create data URL from file
 */
export function createDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to create data URL'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create blob URL from file
 */
export function createBlobURL(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke blob URL
 */
export function revokeBlobURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Download file from URL
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = createBlobURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    revokeBlobURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * Copy file URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Share file using Web Share API
 */
export async function shareFile(
  file: File,
  title?: string,
  text?: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  try {
    await navigator.share({
      files: [file],
      title,
      text,
    });
  } catch (error) {
    console.error('Share failed:', error);
    throw error;
  }
}

/**
 * Share URL using Web Share API
 */
export async function shareURL(
  url: string,
  title?: string,
  text?: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  try {
    await navigator.share({
      url,
      title,
      text,
    });
  } catch (error) {
    console.error('Share failed:', error);
    throw error;
  }
}

/**
 * Compress image using Canvas API
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      const dimensions = calculateFitDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
          URL.revokeObjectURL(img.src);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get video duration
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Format duration in seconds to readable string (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if browser supports file type
 */
export function isFileTypeSupported(mimeType: string): boolean {
  const supportedTypes = [
    ...SUPPORTED_IMAGE_TYPES,
    ...SUPPORTED_VIDEO_TYPES,
    ...SUPPORTED_DOCUMENT_TYPES,
  ];
  return supportedTypes.includes(mimeType);
}

export default {
  getFileCategory,
  getFileIcon,
  getFileColor,
  isImage,
  isVideo,
  isDocument,
  getFileExtension,
  getFileNameWithoutExtension,
  formatFileSize,
  parseFileSize,
  validateFileSize,
  validateFileType,
  getMimeTypeFromExtension,
  calculateAspectRatio,
  calculateFitDimensions,
  generateUniqueFilename,
  createDataURL,
  createBlobURL,
  revokeBlobURL,
  downloadFile,
  copyToClipboard,
  shareFile,
  shareURL,
  compressImage,
  getVideoDuration,
  formatDuration,
  isFileTypeSupported,
};
