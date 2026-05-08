# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies if needed (sharp might need some)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

# Production stage
FROM node:20-slim

WORKDIR /app

# Sharp dependencies for Linux
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# The server listens on the PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.js"]
