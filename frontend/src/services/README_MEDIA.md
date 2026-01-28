# Media Handling System Documentation

Complete production-ready media handling system for Encrypted Social app with IPFS integration.

## Overview

The media handling system provides:
- **File Upload**: Upload images, videos, and documents to IPFS
- **Thumbnail Generation**: Automatic thumbnail creation for images and videos
- **Media Gallery**: Grid-based media browser with filtering
- **Image Viewer**: Fullscreen lightbox with zoom and navigation
- **Progress Tracking**: Real-time upload progress
- **Caching**: IndexedDB-based media caching for offline access

## Components

### 1. MediaService (`mediaService.ts`)

Core service for all media operations.

#### Features
- Upload files to IPFS with progress callbacks
- Automatic thumbnail generation (images and videos)
- File validation (type and size)
- Download and cache media
- Support for multiple file types
- Metadata storage in IndexedDB

#### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, WebM, QuickTime (max 50MB)
- **Documents**: PDF, DOCX (max 100MB)

#### Usage

```typescript
import { mediaService } from '../services/mediaService';

// Upload a file
const result = await mediaService.uploadFile(
  file,
  (progress) => console.log(`Upload progress: ${progress}%`)
);

// Save metadata
await mediaService.saveMediaMetadata(messageId, chatId, result);

// Get media by chat
const media = await mediaService.getMediaByChat(chatId);

// Get media by type
const images = await mediaService.getMediaByType(chatId, 'image');

// Download media
const blob = await mediaService.downloadMedia(url, mediaId, (progress) => {
  console.log(`Download progress: ${progress}%`);
});
```

#### API Reference

**Upload Methods**
- `uploadFile(file, onProgress?)` - Upload file to IPFS
- `validateFile(file)` - Validate file type and size
- `cancelUpload(uploadId)` - Cancel ongoing upload

**Media Methods**
- `saveMediaMetadata(messageId, chatId, uploadResult)` - Save to database
- `getMediaByChat(chatId)` - Get all media for chat
- `getMediaByType(chatId, type)` - Filter by type
- `deleteMedia(mediaId)` - Remove media
- `getMediaSize(chatId?)` - Get total size

**Download Methods**
- `downloadMedia(url, mediaId, onProgress?)` - Download and cache
- `getCachedMedia(mediaId)` - Get from cache
- `clearMediaCache()` - Clear all cached media

**Utility Methods**
- `formatFileSize(bytes)` - Format bytes to readable string
- `getFileExtension(filename)` - Extract file extension
- `createObjectURL(file)` - Create blob URL
- `revokeObjectURL(url)` - Revoke blob URL

### 2. MediaPicker (`MediaPicker.tsx`)

File upload component with drag-and-drop support.

#### Features
- Drag-and-drop file selection
- Multi-file support
- Image preview before upload
- Upload progress bars
- File validation
- Cancel uploads
- Error handling

#### Props

```typescript
interface MediaPickerProps {
  onUploadComplete: (results: UploadResult[]) => void;
  onCancel?: () => void;
  maxFiles?: number; // Default: 10
  acceptedTypes?: string[]; // Default: all supported types
  className?: string;
}
```

#### Usage

```typescript
import MediaPicker from '../components/MediaPicker';

function ChatInterface() {
  const [showPicker, setShowPicker] = useState(false);

  const handleUploadComplete = (results: UploadResult[]) => {
    // Process uploaded files
    results.forEach(result => {
      console.log('Uploaded:', result.url);
    });
    setShowPicker(false);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Attach Files
      </button>

      {showPicker && (
        <MediaPicker
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowPicker(false)}
          maxFiles={5}
        />
      )}
    </>
  );
}
```

### 3. MediaGallery (`MediaGallery.tsx`)

Grid layout for browsing chat media.

#### Features
- 3-column responsive grid
- Filter tabs (All, Photos, Videos, Files)
- Lazy loading with Intersection Observer
- Click to view in lightbox
- Download and share buttons
- Date badges
- Loading states

#### Props

```typescript
interface MediaGalleryProps {
  chatId: string;
  onMediaSelect?: (media: MediaFile) => void;
  className?: string;
}
```

#### Usage

```typescript
import MediaGallery from '../components/MediaGallery';

function ChatMediaTab() {
  return (
    <MediaGallery
      chatId={currentChatId}
      onMediaSelect={(media) => {
        console.log('Selected:', media);
      }}
    />
  );
}
```

### 4. ImageViewer (`ImageViewer.tsx`)

Fullscreen image viewer with controls.

#### Features
- Fullscreen modal display
- Zoom in/out (0.5x to 5x)
- Image rotation
- Navigate with arrow keys or buttons
- Swipe gestures support
- Download and share
- Image metadata panel
- Keyboard shortcuts

#### Props

```typescript
interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile[];
  initialIndex?: number;
  onForward?: (media: MediaFile) => void;
}
```

#### Keyboard Shortcuts
- `ESC` - Close viewer
- `Arrow Left/Right` - Navigate
- `+/-` - Zoom in/out
- `0` - Reset zoom
- `I` - Toggle info panel

#### Usage

```typescript
import ImageViewer from '../components/ImageViewer';

function Gallery() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <img
            key={img.id}
            src={img.thumbnailUrl}
            onClick={() => {
              setSelectedIndex(idx);
              setViewerOpen(true);
            }}
          />
        ))}
      </div>

      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        media={images}
        initialIndex={selectedIndex}
        onForward={(media) => {
          // Forward to another chat
        }}
      />
    </>
  );
}
```

## Complete Integration Example

```typescript
import React, { useState, useEffect } from 'react';
import MediaPicker from '../components/MediaPicker';
import MediaGallery from '../components/MediaGallery';
import { mediaService, UploadResult } from '../services/mediaService';
import { databaseService } from '../services/databaseService';

function ChatWithMedia({ chatId, messageId }: { chatId: string; messageId: string }) {
  const [showPicker, setShowPicker] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Handle file uploads
  const handleUploadComplete = async (results: UploadResult[]) => {
    for (const result of results) {
      // Save media metadata
      const mediaId = await mediaService.saveMediaMetadata(
        messageId,
        chatId,
        result
      );

      // Update message with media URLs
      await databaseService.updateMessage(messageId, {
        mediaUrls: [result.url],
      });
    }

    setShowPicker(false);
  };

  return (
    <div>
      {/* Chat Header */}
      <div className="flex gap-2">
        <button onClick={() => setShowPicker(true)}>
          Attach Files
        </button>
        <button onClick={() => setShowGallery(true)}>
          View Media
        </button>
      </div>

      {/* Media Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Upload Files</h2>
            <MediaPicker
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowPicker(false)}
            />
          </div>
        </div>
      )}

      {/* Media Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
          <button
            onClick={() => setShowGallery(false)}
            className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          >
            Close
          </button>
          <MediaGallery chatId={chatId} />
        </div>
      )}
    </div>
  );
}

export default ChatWithMedia;
```

## Database Schema

Media files are stored in IndexedDB using Dexie:

```typescript
interface MediaFile {
  id: string;
  messageId: string;
  chatId: string;
  type: 'image' | 'video' | 'file';
  url: string;
  ipfsHash?: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
}
```

## IPFS Configuration

Default configuration uses Infura's IPFS gateway:

```typescript
const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
};
```

To use a custom IPFS node, modify the configuration in `mediaService.ts`.

## Error Handling

All components include comprehensive error handling:

```typescript
try {
  const result = await mediaService.uploadFile(file);
} catch (error) {
  if (error instanceof Error) {
    if (error.message === 'Upload cancelled') {
      // Handle cancellation
    } else {
      // Handle other errors
      console.error('Upload failed:', error.message);
    }
  }
}
```

## Performance Optimization

### Lazy Loading
MediaGallery uses Intersection Observer for lazy loading images:
- Only visible items are loaded
- Smooth scrolling performance
- Reduced memory usage

### Thumbnail Generation
- Images: Canvas API for client-side generation
- Videos: Video frame capture at 1 second
- Max dimensions: 300x300px
- JPEG compression at 80% quality

### Caching Strategy
- Downloaded media cached in IndexedDB
- Thumbnails stored separately
- LRU cache eviction (future enhancement)

## Security Considerations

1. **File Validation**: All files are validated before upload
2. **Size Limits**: Enforced on client and should be on server
3. **Type Checking**: Only allowed MIME types accepted
4. **IPFS Content**: Immutable and content-addressed
5. **Encryption**: Consider encrypting sensitive media before upload

## Future Enhancements

- [ ] Video playback controls
- [ ] Audio file support
- [ ] Document preview (PDF viewer)
- [ ] Image editing (crop, filter)
- [ ] Compression before upload
- [ ] CDN integration
- [ ] Progressive image loading
- [ ] WebP conversion
- [ ] Service Worker caching
- [ ] Offline upload queue

## Troubleshooting

### IPFS Upload Fails
- Check network connection
- Verify IPFS gateway is accessible
- Check file size limits
- Ensure correct IPFS configuration

### Thumbnails Not Generated
- Check browser Canvas API support
- Verify file format is supported
- Check console for errors

### Images Not Loading
- Check IPFS gateway availability
- Verify URLs are correct
- Check CORS settings
- Try different IPFS gateway

## License

Part of Encrypted Social - Aleo Blockchain Application
