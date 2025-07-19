#!/bin/bash

echo "🚀 Starting deployment for ai-travel-planner"

cd /var/www/aitravelplanner.richadali.dev || { echo "❌ Failed to access project directory"; exit 1; }

echo "📥 Pulling latest code from Git..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

echo "📦 Installing npm dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

echo "🏗️ Building project for production..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "🔧 Setting file ownership to root:root..."
chown -R root:root /var/www/aitravelplanner.richadali.dev

echo "🔒 Setting directory permissions to 755..."
find /var/www/aitravelplanner.richadali.dev -type d -exec chmod 755 {} \;

echo "🔒 Setting file permissions to 644 (excluding node_modules/.bin)..."
find /var/www/aitravelplanner.richadali.dev -type f ! -path "*/node_modules/.bin/*" -exec chmod 644 {} \;

echo "🔧 Ensuring executables in node_modules/.bin are set..."
find /var/www/aitravelplanner.richadali.dev/node_modules/.bin -type f -exec chmod 755 {} \;

echo "🔧 Ensuring next binary is executable..."
chmod +x /var/www/aitravelplanner.richadali.dev/node_modules/next/dist/bin/next

echo "🔄 Restarting PM2 process with updated environment..."
pm2 restart ai-travel-planner --update-env || { echo "❌ PM2 restart failed"; exit 1; }

echo "✅ Deployment completed successfully!"
