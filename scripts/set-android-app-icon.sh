#!/usr/bin/env bash
# Generate Android launcher icons from a single PNG (e.g. 1024x1024).
# Usage: ./scripts/set-android-app-icon.sh <path-to-icon.png>
# Example: ./scripts/set-android-app-icon.sh ./android/app-icon-1024.png

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RES_DIR="$PROJECT_DIR/android/app/src/main/res"

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-icon.png>"
  echo "Example: $0 ./android/app-icon-1024.png"
  echo ""
  echo "Use a square PNG (e.g. 1024x1024). Same file you used for iOS works."
  exit 1
fi

SRC="$1"
if [ ! -f "$SRC" ]; then
  echo "Error: File not found: $SRC"
  exit 1
fi

# Android mipmap sizes: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
for item in "mipmap-mdpi:48" "mipmap-hdpi:72" "mipmap-xhdpi:96" "mipmap-xxhdpi:144" "mipmap-xxxhdpi:192"; do
  folder="${item%%:*}"
  size="${item##*:}"
  dir="$RES_DIR/$folder"
  mkdir -p "$dir"
  echo "  $folder -> ${size}x${size}"
  sips -z $size $size "$SRC" --out "$dir/ic_launcher.png"
  cp "$dir/ic_launcher.png" "$dir/ic_launcher_round.png"
done

echo "Done. Android launcher icons updated in android/app/src/main/res."
echo "Rebuild the app: npm run android"
