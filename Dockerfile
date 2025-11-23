FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Copier ton .env local dans l'image
COPY .env .env

RUN npm run build
RUN npm run build:assets || vite build || echo "No vite build script"

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.env .env

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/server.js"]
