# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app (creates static export in 'out' directory)
RUN npm run build

# Production stage - serve static files with a lightweight server
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy static export from builder
COPY --from=builder /app/out ./out

# Expose port 3000
EXPOSE 3000

# Serve the static files
CMD ["serve", "-s", "out", "-l", "3000"]
