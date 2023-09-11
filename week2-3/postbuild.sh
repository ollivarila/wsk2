#!/bin/sh

set -e # Abort on error

# Copy production package.json
cp prod-package.json dist/package.json

# Copy Sharp (Cannot be bundled)
mkdir -p dist/node_modules
cp -r node_modules/sharp dist/node_modules/sharp

# Install production dependencies
npm install --prefix ./dist --omit=dev