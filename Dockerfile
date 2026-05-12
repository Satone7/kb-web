# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Data directory for permissions
RUN mkdir -p /app/backend/data

ENV NODE_ENV=production
ENV PORT=3000
ENV KB_ROOT=/kb
ENV SESSION_SECRET=change-me-in-production
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=changeme

EXPOSE 3000

CMD ["node", "backend/server.js"]
