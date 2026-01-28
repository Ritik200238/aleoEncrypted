#!/bin/bash
# Media System Verification Script

echo "============================================"
echo "Media Handling System - Verification Report"
echo "============================================"
echo ""

echo "📁 Checking Core Files..."
files=(
  "src/services/mediaService.ts"
  "src/components/MediaPicker.tsx"
  "src/components/MediaGallery.tsx"
  "src/components/ImageViewer.tsx"
  "src/utils/mediaUtils.ts"
  "src/examples/MediaIntegrationExample.tsx"
  "src/media/index.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    lines=$(wc -l < "$file")
    echo "  ✅ $file ($size, $lines lines)"
  else
    echo "  ❌ $file (MISSING!)"
  fi
done

echo ""
echo "📚 Checking Documentation..."
docs=(
  "MEDIA_SYSTEM_GUIDE.md"
  "MEDIA_IMPLEMENTATION_SUMMARY.md"
  "MEDIA_TESTING_GUIDE.md"
  "MEDIA_FILES_INDEX.md"
  "src/services/README_MEDIA.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    size=$(ls -lh "$doc" | awk '{print $5}')
    echo "  ✅ $doc ($size)"
  else
    echo "  ❌ $doc (MISSING!)"
  fi
done

echo ""
echo "📦 Checking Dependencies..."
deps=("ipfs-http-client" "framer-motion" "lucide-react" "date-fns" "nanoid" "dexie")

for dep in "${deps[@]}"; do
  if npm list "$dep" > /dev/null 2>&1; then
    version=$(npm list "$dep" | grep "$dep@" | awk '{print $2}')
    echo "  ✅ $dep ($version)"
  else
    echo "  ❌ $dep (NOT INSTALLED!)"
  fi
done

echo ""
echo "📊 Statistics..."
total_lines=$(wc -l src/services/mediaService.ts src/components/MediaPicker.tsx src/components/MediaGallery.tsx src/components/ImageViewer.tsx src/utils/mediaUtils.ts src/examples/MediaIntegrationExample.tsx src/media/index.ts 2>/dev/null | tail -1 | awk '{print $1}')
echo "  Total Lines of Code: $total_lines"
echo "  Total Files Created: 12"
echo "  Core Components: 4"
echo "  Utility Files: 3"
echo "  Documentation: 5"

echo ""
echo "✨ Verification Complete!"
echo "============================================"
