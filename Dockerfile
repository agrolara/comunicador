# Multi-stage build for Esta es mi voz sin límites (Comunicador CAA)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production runner with Node.js 20 to support real Edge-TTS neural voices backend
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.mjs ./

EXPOSE 80

CMD ["node", "server.mjs"]
