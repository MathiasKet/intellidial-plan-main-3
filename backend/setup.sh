#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up the project..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example"
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Prisma is installed
if ! command -v npx prisma &> /dev/null; then
    echo "🔧 Prisma CLI not found. Installing Prisma..."
    npm install prisma --save-dev
fi

# Run database migrations
echo "💾 Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "🔌 Generating Prisma client..."
npx prisma generate

echo "✨ Setup complete!"
echo "🚀 Start the development server with: npm run dev"
