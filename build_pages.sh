#!/usr/bin/env bash
# Build script for Cloudflare Pages
set -e

echo "==> Building TimesFM-3 Frontend for Cloudflare Pages..."

mkdir -p public
cp static/style.css public/style.css

echo "==> Static assets prepared in public/ directory."
ls -la public/
