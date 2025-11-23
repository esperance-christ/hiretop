# -------------------------
# 1. Builder
# -------------------------
  FROM node:20-alpine AS build

  WORKDIR /app

  # Install OS deps
  RUN apk add --no-cache python3 make g++

  # Copy package files
  COPY package*.json ./

  # Install dependencies
  RUN npm install

  # Copy project
  COPY . .

  # Build AdonisJS
  RUN npm run build

  # Build Vite assets (important for Inertia SSR)
  RUN npm run build:assets || npm run build-frontend || echo "No Vite build step"

  # -------------------------
  # 2. Runner
  # -------------------------
  FROM node:20-alpine AS production

  WORKDIR /app

  # Install OS deps
  RUN apk add --no-cache bash

  COPY --from=build /app/build ./build
  COPY --from=build /app/package*.json ./
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/public ./public

  ENV NODE_ENV=production
  ENV PORT=3000
  EXPOSE 3000

  CMD ["node", "build/server.js"]
