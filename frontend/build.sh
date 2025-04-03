#!/bin/bash
# Install dependencies
npm ci

# Build the app
npm run build

# Copy static.json to dist folder for Render
cp static.json dist/

# Done!
echo "Frontend build completed successfully!"