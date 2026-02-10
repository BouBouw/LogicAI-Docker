# Build stage
FROM node:20-alpine AS builder

# Build backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/prisma ./prisma
COPY server/src ./src
RUN npx prisma generate

# Build frontend
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --legacy-peer-deps
COPY web/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install backend production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy backend artifacts
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/src ./server/src

# Copy frontend build output
COPY --from=builder /app/web/dist ./public

# Copy startup scripts
COPY start-container.sh /app/start-container.sh
RUN chmod +x /app/start-container.sh

# Create data directory
RUN mkdir -p /app/data

# Environment
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/instance.db"

EXPOSE 3000

CMD ["/bin/sh", "/app/start-container.sh"]
