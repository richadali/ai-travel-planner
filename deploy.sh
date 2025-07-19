#!/bin/bash

# ------------------------------
# AI Travel Planner Deployment Script (Safe Permissions)
# ------------------------------

echo "🚀 Starting deployment for ai-travel-planner"

# Navigate to the project directory
cd /var/www/aitravelplanner.richadali.dev || { echo "❌ Failed to access /var/www/aitravelplanner.richadali.dev"; exit 1; }

# Pull latest code from Git
echo "📥 Pulling latest code from Git..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

# Build the project
echo "🏗️ Building project for production..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Set ownership to root:root for consistency
echo "🔧 Setting file ownership to root:root..."
chown -R root:root /var/www/aitravelplanner.richadali.dev

# Set directory permissions to 755
echo "🔒 Setting directory permissions to 755..."
find /var/www/aitravelplanner.richadali.dev -type d -exec chmod 755 {} \;

# Set file permissions to 644 except node_modules/.bin
echo "🔒 Setting file permissions to 644 (excluding node_modules/.bin)..."
find /var/www/aitravelplanner.richadali.dev -type f ! -path "*/node_modules/.bin/*" -exec chmod 644 {} \;

# Ensure node_modules/.bin files have executable permissions
echo "🔧 Setting executable permissions for node_modules/.bin/..."
find /var/www/aitravelplanner.richadali.dev/node_modules/.bin -type f -exec chmod 755 {} \;

# Restart the PM2 process with environment reload
echo "🔄 Restarting PM2 process with updated environment..."
pm2 restart ai-travel-planner --update-env || { echo "❌ PM2 restart failed"; exit 1; }

echo "✅ Deployment completed successfully!"
