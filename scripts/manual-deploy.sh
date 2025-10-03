#!/bin/bash

# Manual deployment script for SENA Rentcar
# Use this for initial deployment or when automatic deployment fails

echo "🚀 Manual deployment of SENA Rentcar..."

# Navigate to application directory
cd /var/www/sena-rencar

# Stop existing application
echo "🛑 Stopping existing application..."
pm2 delete sena-rencar || true

# Backup current deployment (optional)
echo "💾 Creating backup..."
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .next/ || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build application
echo "🔨 Building application..."
npm run build

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "sena-rencar" -- start
pm2 save

# Check status
echo "📊 Application status:"
pm2 status sena-rencar

# Show logs
echo "📝 Recent logs:"
pm2 logs sena-rencar --lines 10

echo "✅ Manual deployment completed!"
echo "🌐 Application should be accessible at: http://your-domain.com:3000"