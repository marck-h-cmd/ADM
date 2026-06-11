# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
COPY .npmrc* ./

# Install pnpm if using pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Install simple http server for static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render automatically detects the port)
EXPOSE 3000

# Start server (-s for Single Page Application routing)
CMD ["serve", "-s", "dist", "-l", "3000"]