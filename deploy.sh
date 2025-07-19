#!/bin/bash

# ------------------------------
# AI Travel Planner Deployment Script
# ------------------------------

APP_DIR="/var/www/aitravelplanner.richadali.dev"
APP_NAME="ai-travel-planner"
USER="www-data"
GROUP="www-data"

echo "🚀 Starting deployment for $APP_NAME"

# Navigate to the project directory
cd "$APP_DIR" || { echo "❌ Failed to access $APP_DIR"; exit 1; }


# Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

# Build the project
echo "🏗️ Building project for production..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Set ownership and permissions
echo "🔧 Setting file ownership to $USER:$GROUP..."
chown -R "$USER":"$GROUP" "$APP_DIR"

echo "🔒 Setting directory permissions to 755..."
find "$APP_DIR" -type d -exec chmod 755 {} \;

echo "🔒 Setting file permissions to 644..."
find "$APP_DIR" -type f -exec chmod 644 {} \;

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart "$APP_NAME" || { echo "❌ PM2 restart failed"; exit 1; }

echo "✅ Deployment completed successfully!"
