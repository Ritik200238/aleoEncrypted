# Media System Testing Guide

Complete testing guide for the media handling system.

## 🧪 Testing Checklist

### MediaPicker Component

#### File Selection
- [ ] Click to open file dialog
- [ ] Select single file
- [ ] Select multiple files (up to max)
- [ ] Exceed max files limit
- [ ] Select unsupported file type
- [ ] Select file exceeding size limit

#### Drag & Drop
- [ ] Drag file over component (highlight shows)
- [ ] Drop single file
- [ ] Drop multiple files
- [ ] Drop unsupported file type
- [ ] Drop file exceeding size limit

#### Upload Process
- [ ] Upload single image
  - [ ] Preview shows correctly
  - [ ] Progress bar updates
  - [ ] Success indicator appears
  - [ ] IPFS URL returned
  - [ ] Thumbnail generated
- [ ] Upload multiple images
  - [ ] All previews show
  - [ ] All progress bars update
  - [ ] All complete successfully
- [ ] Upload video
  - [ ] Thumbnail generated from video
  - [ ] Upload completes
- [ ] Upload document (PDF)
  - [ ] Icon shows correctly
  - [ ] Upload completes

#### Error Handling
- [ ] Network error during upload
- [ ] IPFS gateway unavailable
- [ ] Cancel upload (remove file)
- [ ] File validation errors show

#### UI/UX
- [ ] Animations smooth
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success feedback visible
- [ ] Responsive on mobile

### MediaGallery Component

#### Gallery Display
- [ ] Grid shows 3 columns on desktop
- [ ] Grid responsive on mobile
- [ ] All media types display correctly
- [ ] Thumbnails load properly
- [ ] Date badges show correct dates

#### Filtering
- [ ] "All" filter shows all media
- [ ] "Photos" filter shows only images
- [ ] "Videos" filter shows only videos
- [ ] "Files" filter shows only documents
- [ ] Item counts update correctly

#### Lazy Loading
- [ ] Only visible items load initially
- [ ] Scroll loads more items
- [ ] No performance issues with many items

#### Interactions
- [ ] Click image opens viewer
- [ ] Download button works
- [ ] Share button works (or copies link)
- [ ] Hover effects work

#### States
- [ ] Loading state shows spinner
- [ ] Empty state shows message
- [ ] Error state shows message

### ImageViewer Component

#### Basic Display
- [ ] Opens in fullscreen
- [ ] Image loads correctly
- [ ] Loading indicator shows
- [ ] Close button works

#### Navigation
- [ ] Previous button (when available)
- [ ] Next button (when available)
- [ ] Arrow keys work (← / →)
- [ ] Swipe gestures work (mobile)
- [ ] Image counter shows correct position

#### Zoom Controls
- [ ] Zoom in button (+)
- [ ] Zoom out button (-)
- [ ] Reset button
- [ ] Keyboard shortcuts (+ / -)
- [ ] Zoom level displays correctly
- [ ] Can't zoom below 0.5x
- [ ] Can't zoom above 5x
- [ ] Drag to pan when zoomed

#### Rotation
- [ ] Rotate button rotates 90°
- [ ] Multiple rotations work
- [ ] Rotation resets when changing image

#### Download/Share
- [ ] Download button saves file
- [ ] Share button works (or copies link)
- [ ] Forward button (if callback provided)

#### Info Panel
- [ ] Toggle with "I" key
- [ ] Shows filename
- [ ] Shows file size
- [ ] Shows MIME type
- [ ] Shows upload date
- [ ] Shows IPFS hash
- [ ] Shows message ID

#### Keyboard Shortcuts
- [ ] ESC closes viewer
- [ ] Arrow keys navigate
- [ ] +/- zoom
- [ ] 0 resets zoom
- [ ] I toggles info

### MediaService

#### Upload
- [ ] Upload to IPFS succeeds
- [ ] Progress callback fires
- [ ] Returns IPFS hash
- [ ] Returns IPFS URL
- [ ] Thumbnail generated for images
- [ ] Thumbnail generated for videos

#### Validation
- [ ] Validates file size
- [ ] Validates file type
- [ ] Returns error messages

#### Download
- [ ] Downloads from IPFS
- [ ] Progress callback fires
- [ ] Returns blob

#### Database
- [ ] Saves metadata to IndexedDB
- [ ] Retrieves media by chat ID
- [ ] Retrieves media by type
- [ ] Deletes media
- [ ] Calculates total size

### Integration Testing

#### Chat Message Flow
- [ ] Attach file to message
- [ ] Upload completes
- [ ] Message sends with media URL
- [ ] Media displays in message bubble
- [ ] Click media opens viewer

#### Gallery Flow
- [ ] Open gallery from chat
- [ ] Media loads from database
- [ ] Filter works
- [ ] Click opens viewer
- [ ] Download works
- [ ] Share works

#### Full User Journey
1. [ ] Open chat
2. [ ] Click attach button
3. [ ] Select/drop files
4. [ ] Preview shows
5. [ ] Click upload
6. [ ] Progress shows
7. [ ] Upload completes
8. [ ] Message sends
9. [ ] Media visible in chat
10. [ ] Open gallery
11. [ ] Filter to photos
12. [ ] Click photo
13. [ ] Viewer opens
14. [ ] Zoom and navigate
15. [ ] Download photo
16. [ ] Share photo
17. [ ] Close viewer

## 🎯 Test Scenarios

### Scenario 1: Upload Single Image
```
1. Open MediaPicker
2. Click to select file
3. Choose image.jpg (2MB)
4. Preview shows
5. Click Upload
6. Progress bar reaches 100%
7. Success indicator shows
8. IPFS URL returned
9. Thumbnail generated
```

### Scenario 2: Upload Multiple Files
```
1. Open MediaPicker
2. Drag and drop 5 files
   - 2 images
   - 1 video
   - 2 PDFs
3. All previews show
4. Click Upload
5. All upload concurrently
6. All complete successfully
7. All thumbnails generated
```

### Scenario 3: Browse Gallery
```
1. Open MediaGallery
2. View all media (50+ items)
3. Scroll down (lazy load works)
4. Click "Photos" filter
5. Only images show
6. Click image
7. ImageViewer opens
8. Navigate with arrows
9. Zoom in/out
10. Download image
11. Close viewer
```

### Scenario 4: Error Handling
```
1. Select 11 files (exceeds max)
2. Error shows for excess files
3. Select 100MB video (exceeds limit)
4. Error shows size exceeded
5. Select .exe file (unsupported)
6. Error shows type not allowed
7. Start upload, disconnect internet
8. Error shows upload failed
```

## 🔍 Performance Testing

### Metrics to Check
- [ ] Initial load time < 2s
- [ ] Thumbnail generation < 1s per image
- [ ] Upload starts < 500ms after click
- [ ] Gallery renders 50 items smoothly
- [ ] Viewer opens < 500ms
- [ ] Zoom transitions smooth (60fps)
- [ ] Navigation instant (<100ms)

### Large Dataset Testing
- [ ] 100+ images in gallery
- [ ] 10+ simultaneous uploads
- [ ] 50MB video upload
- [ ] 1000+ media items total

## 📱 Mobile Testing

### iOS Safari
- [ ] File picker opens
- [ ] Camera option available
- [ ] Touch gestures work
- [ ] Swipe to navigate
- [ ] Pinch to zoom
- [ ] Responsive layout

### Android Chrome
- [ ] File picker opens
- [ ] Camera option available
- [ ] Touch gestures work
- [ ] Swipe to navigate
- [ ] Pinch to zoom
- [ ] Responsive layout

## 🌐 Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

## 🐛 Known Issues to Test

1. **IPFS Gateway Timeout**
   - Test with slow network
   - Verify error handling
   - Check retry logic

2. **Large File Upload**
   - Test 50MB video
   - Monitor memory usage
   - Check for browser crashes

3. **Thumbnail Generation**
   - Test with corrupted images
   - Test with exotic formats
   - Check error fallbacks

4. **IndexedDB Quota**
   - Fill storage to limit
   - Test quota exceeded error
   - Verify cleanup works

## ✅ Test Commands

### Manual Testing
```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:5173
```

### Unit Tests (if implemented)
```bash
npm run test
```

### E2E Tests (if implemented)
```bash
npm run test:e2e
```

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### MediaPicker
- File Selection: ✅ PASS
- Drag & Drop: ✅ PASS
- Upload: ✅ PASS
- Error Handling: ✅ PASS
- UI/UX: ✅ PASS

### MediaGallery
- Display: ✅ PASS
- Filtering: ✅ PASS
- Lazy Loading: ✅ PASS
- Interactions: ✅ PASS

### ImageViewer
- Display: ✅ PASS
- Navigation: ✅ PASS
- Zoom: ✅ PASS
- Download/Share: ✅ PASS

### Performance
- Load Time: ✅ < 2s
- Upload Speed: ✅ Good
- Gallery Render: ✅ Smooth

### Browser Compatibility
- Chrome: ✅ PASS
- Firefox: ✅ PASS
- Safari: ✅ PASS
- Mobile: ✅ PASS

### Issues Found
- None

### Notes
- All tests passed successfully
- Ready for production
```

## 🚀 Production Readiness

Before deploying to production, ensure:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Performance metrics met
- [ ] Mobile testing complete
- [ ] Browser testing complete
- [ ] Error tracking configured
- [ ] Analytics added
- [ ] IPFS gateway configured
- [ ] File size limits set
- [ ] Documentation updated

## 📝 Test Data

### Sample Files for Testing
- **Small Image**: 500KB JPG
- **Large Image**: 8MB PNG
- **Small Video**: 10MB MP4
- **Large Video**: 45MB MP4
- **Document**: 2MB PDF
- **GIF**: 5MB animated GIF

### Test Accounts
- User with no media
- User with 10 media items
- User with 100+ media items
- User with mixed media types

## 🎯 Success Criteria

The media system is production-ready when:

1. ✅ All components render without errors
2. ✅ File uploads complete successfully
3. ✅ Thumbnails generate correctly
4. ✅ Gallery displays all media types
5. ✅ Viewer works with all controls
6. ✅ Mobile experience is smooth
7. ✅ Error handling is comprehensive
8. ✅ Performance is acceptable
9. ✅ Documentation is complete
10. ✅ No blocking issues remain

---

**Happy Testing!** Follow this guide to ensure the media system is production-ready.
