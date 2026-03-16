#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull the latest version of the app from Git
git pull origin main

# Install dependencies (Production mode)
composer install --no-dev --optimize-autoloader

# Clear and Cache Config/Routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
php artisan migrate --force

# Frontend Deployment (Optional if build is manual)
if [ -d "frontend-dpf" ]; then
    echo "📦 Building Frontend..."
    cd frontend-dpf
    npm install
    npm run build
    cd ..
fi

echo "✅ Deployment finished successfully!"
