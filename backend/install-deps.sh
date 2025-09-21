#!/bin/bash

# Install dependencies
npm install --save \
  @prisma/client \
  @supabase/supabase-js \
  axios \
  bcryptjs \
  cors \
  dayjs \
  dotenv \
  express \
  express-async-handler \
  express-rate-limit \
  express-validator \
  helmet \
  http-status-codes \
  jsonwebtoken \
  morgan \
  multer \
  openai \
  pg \
  twilio \
  winston \
  winston-daily-rotate-file

# Install dev dependencies
npm install --save-dev \
  @types/bcryptjs \
  @types/cors \
  @types/express \
  @types/jsonwebtoken \
  @types/node \
  @types/supertest \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-prettier \
  eslint-plugin-prettier \
  jest \
  nodemon \
  prettier \
  prisma \
  supertest \
  ts-jest \
  ts-node \
  typescript
