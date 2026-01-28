# Media Handling System - Quick Start Guide

Complete production-ready media system for Encrypted Social app.

## 📦 What's Included

### Core Files
1. **`src/services/mediaService.ts`** - IPFS upload/download service
2. **`src/components/MediaPicker.tsx`** - File upload component
3. **`src/components/MediaGallery.tsx`** - Media grid browser
4. **`src/components/ImageViewer.tsx`** - Fullscreen image viewer
5. **`src/utils/mediaUtils.ts`** - Helper utilities
6. **`src/examples/MediaIntegrationExample.tsx`** - Usage examples

## 🚀 Quick Start

### 1. Basic File Upload

```typescript
import MediaPicker from './components/MediaPicker';
import { UploadResult } from './services/mediaService';

function MyComponent() {
  const handleUpload = (results: UploadResult[]) => {
    results.forEach(result => {
      console.log('Uploaded to:', result.url);
      console.log('IPFS hash:', result.ipfsHash);
    });
  };

  return (
    <MediaPicker
      onUploadComplete={handleUpload}
      maxFiles={5}
    />
  );
}
```

### 2. View Media Gallery

```typescript
import MediaGallery from './components/MediaGallery';

function ChatMedia({ chatId }: { chatId: string }) {
  return (
    <MediaGallery
      chatId={chatId}
      onMediaSelect={(media) => console.log(media)}
    />
  );
}
```

### 3. Display Images with Viewer

```typescript
import ImageViewer from './components/ImageViewer';
import { useState } from 'react';

function Gallery({ images }) {
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
      />
    </>
  );
}
```

## 🎯 Features

### MediaPicker
- ✅ Drag-and-drop support
- ✅ Multi-file selection
- ✅ Real-time upload progress
- ✅ File validation
- ✅ Image previews
- ✅ Cancel uploads
- ✅ Error handling

### MediaGallery
- ✅ 3-column responsive grid
- ✅ Filter by type (All/Photos/Videos/Files)
- ✅ Lazy loading
- ✅ Download files
- ✅ Share functionality
- ✅ Date badges

### ImageViewer
- ✅ Fullscreen modal
- ✅ Zoom (0.5x - 5x)
- ✅ Rotate images
- ✅ Arrow key navigation
- ✅ Keyboard shortcuts
- ✅ Swipe gestures
- ✅ Image metadata

### MediaService
- ✅ IPFS uploads
- ✅ Thumbnail generation
- ✅ Progress tracking
- ✅ File validation
- ✅ IndexedDB caching
- ✅ Download manager

## 📋 File Type Support

### Images (Max 10MB)
- JPEG/JPG
- PNG
- GIF
- WebP

### Videos (Max 50MB)
- MP4
- WebM
- QuickTime (MOV)

### Documents (Max 100MB)
- PDF
- DOCX

## 💾 Database Schema

```typescript
interface MediaFile {
  id: string;
  messageId: string;
  chatId: string;
  type: 'image' | 'video' | 'file';
  url: string;              // IPFS URL
  ipfsHash?: string;        // IPFS hash
  thumbnailUrl?: string;    // Thumbnail URL
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
}
```

## 🔧 Configuration

### IPFS Settings

Edit `src/services/mediaService.ts`:

```typescript
const IPFS_CONFIG = {
  host: 'ipfs.infura.io',  // Change to your IPFS node
  port: 5001,
  protocol: 'https',
};
```

### File Size Limits

```typescript
export const MAX_FILE_SIZE = 100 * 1024 * 1024;  // 100MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
```

### Thumbnail Settings

```typescript
const THUMBNAIL_MAX_WIDTH = 300;
const THUMBNAIL_MAX_HEIGHT = 300;
const THUMBNAIL_QUALITY = 0.8;
```

## 🎨 Customization

### Styling

All components use Tailwind CSS. Customize via className prop:

```typescript
<MediaPicker
  className="custom-styles"
  onUploadComplete={handleUpload}
/>
```

### Custom File Types

Add support in `src/utils/mediaUtils.ts`:

```typescript
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
];
```

## 📱 Complete Integration Example

```typescript
import { useState } from 'react';
import MediaPicker from './components/MediaPicker';
import MediaGallery from './components/MediaGallery';
import ImageViewer from './components/ImageViewer';
import { mediaService } from './services/mediaService';

function ChatWithMedia({ chatId }: { chatId: string }) {
  const [showPicker, setShowPicker] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleUploadComplete = async (results) => {
    for (const result of results) {
      // Save to message
      const messageId = 'msg-123';
      await mediaService.saveMediaMetadata(
        messageId,
        chatId,
        result
      );
    }
    setShowPicker(false);
  };

  return (
    <div>
      {/* Chat UI */}
      <button onClick={() => setShowPicker(true)}>
        Upload Files
      </button>
      <button onClick={() => setShowGallery(true)}>
        View Gallery
      </button>

      {/* Media Picker Modal */}
      {showPicker && (
        <div className="modal">
          <MediaPicker
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowPicker(false)}
          />
        </div>
      )}

      {/* Media Gallery */}
      {showGallery && (
        <div className="modal">
          <MediaGallery chatId={chatId} />
          <button onClick={() => setShowGallery(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🎮 Keyboard Shortcuts (ImageViewer)

| Key | Action |
|-----|--------|
| `ESC` | Close viewer |
| `←` / `→` | Navigate images |
| `+` / `-` | Zoom in/out |
| `0` | Reset zoom |
| `I` | Toggle info panel |

## 🔍 API Reference

### MediaService Methods

```typescript
// Upload
await mediaService.uploadFile(file, progressCallback);

// Validate
mediaService.validateFile(file);

// Save metadata
await mediaService.saveMediaMetadata(messageId, chatId, result);

// Get media
await mediaService.getMediaByChat(chatId);
await mediaService.getMediaByType(chatId, 'image');

// Download
await mediaService.downloadMedia(url, mediaId, progressCallback);

// Delete
await mediaService.deleteMedia(mediaId);

// Utilities
mediaService.formatFileSize(bytes);
mediaService.getFileExtension(filename);
```

### MediaUtils Functions

```typescript
import mediaUtils from './utils/mediaUtils';

// File info
mediaUtils.getFileCategory(mimeType);
mediaUtils.getFileIcon(mimeType);
mediaUtils.isImage(mimeType);

// Validation
mediaUtils.validateFileSize(size, maxSize);
mediaUtils.validateFileType(type, allowedTypes);

// Processing
await mediaUtils.compressImage(file, maxWidth, maxHeight, quality);
await mediaUtils.getVideoDuration(file);

// Downloads
await mediaUtils.downloadFile(url, filename);
await mediaUtils.shareURL(url, title, text);
```

## 🐛 Troubleshooting

### IPFS Upload Fails
1. Check network connection
2. Verify IPFS gateway is accessible
3. Try alternative gateway (e.g., ipfs.io)
4. Check console for errors

### Images Not Loading
1. Verify IPFS URL is correct
2. Check CORS settings
3. Try different IPFS gateway
4. Check browser console

### Thumbnails Not Generated
1. Ensure browser supports Canvas API
2. Check file format is supported
3. Verify file is not corrupted

## 📚 Additional Resources

- Full documentation: `src/services/README_MEDIA.md`
- Examples: `src/examples/MediaIntegrationExample.tsx`
- Utils: `src/utils/mediaUtils.ts`

## 🎯 Production Checklist

- [ ] Configure IPFS node/gateway
- [ ] Set appropriate file size limits
- [ ] Add error tracking (Sentry, etc.)
- [ ] Implement CDN for thumbnails
- [ ] Add virus scanning
- [ ] Set up backup storage
- [ ] Implement rate limiting
- [ ] Add analytics tracking
- [ ] Test on mobile devices
- [ ] Optimize bundle size

## 🚀 Next Steps

1. Import components into your app
2. Configure IPFS settings
3. Test file upload flow
4. Customize styling
5. Add to production

## 📄 License

Part of Encrypted Social - Aleo Blockchain Application

---

**Need Help?** Check the examples folder for complete working implementations.
