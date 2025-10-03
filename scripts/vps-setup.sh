#!/bin/bash

# SENA Rentcar VPS Setup Script
# This script sets up the VPS environment for Next.js deployment

echo "🚀 Setting up SENA Rentcar Next.js on VPS..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/sena-rencar
sudo chown -R $USER:$USER /var/www/sena-rencar
cd /var/www/sena-rencar

# Create .env file for production
echo "🔧 Creating production environment file..."
cat > .env.local << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://santuypars22:-Kambing12345@santuyss.uztjo84.mongodb.net/sena-rencar?retryWrites=true&w=majority

# Next.js Configuration
NODE_ENV=production
PORT=3000

# App Configuration
NEXT_PUBLIC_APP_NAME=SENA Rentcar
NEXT_PUBLIC_APP_URL=https://rencar.gilarya.my.id
EOF

# Create nginx configuration for reverse proxy
echo "🌐 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/sena-rencar << EOF
server {
    listen 80;
    server_name rencar.gilarya.my.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/sena-rencar /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Create log directory
sudo mkdir -p /var/log/sena-rencar
sudo chown -R $USER:$USER /var/log/sena-rencar

# Setup PM2 startup
pm2 startup
echo "⚠️ Please run the command above if it was generated"

echo "✅ VPS setup completed!"
echo "📝 Next steps:"
echo "1. Upload your Next.js files to /var/www/sena-rencar/"
echo "2. Run: npm install"
echo "3. Run: npm run build"
echo "4. Run: pm2 start npm --name sena-rencar -- start"
echo "5. Run: pm2 save"
echo "6. Configure your domain in Cloudflare to point to this server"