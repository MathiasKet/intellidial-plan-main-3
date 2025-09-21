#!/bin/bash

# Exit on error
set -e

# Set environment variables
export NODE_ENV=development

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start the development server
npx nodemon --exec "ts-node" src/index.ts
