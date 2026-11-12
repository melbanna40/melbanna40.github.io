#!/usr/bin/env bash
# Converts each app's first store image into assets/apps/<slug>.webp (720 px wide)
# and prints "<slug> <width> <height>" for the data file's `image` field.
set -euo pipefail

src=${1:?usage: build-assets.sh <recon-assets-dir>}
out="$(dirname "$0")/../assets/apps"
mkdir -p "$out"

for dir in "$src"/*/; do
  slug=$(basename "$dir")
  shot=$(ls "$dir"screenshot-1.* 2>/dev/null | head -1) || true
  [ -n "$shot" ] || continue
  cwebp -quiet -q 80 -resize 720 0 "$shot" -o "$out/$slug.webp"
  size=$(sips -g pixelWidth -g pixelHeight "$out/$slug.webp" | awk '/pixel/ {printf "%s ", $2}')
  echo "$slug $size"
done
