#!/bin/bash

# Script untuk Install Node.js di VPS Ubuntu
echo "🔧 Installing Node.js 18 LTS..."

# Update system
sudo apt update

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "📋 Verifying Node.js installation..."
node --version
npm --version

# Install PM2 globally
echo "⚙️ Installing PM2 process manager..."
sudo npm install -g pm2

# Verify PM2
pm2 --version

# Install useful global packages
sudo npm install -g yarn

echo "✅ Node.js installation completed!"
echo "📊 Installed versions:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PM2: $(pm2 --version)"