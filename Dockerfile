# Use official Node.js runtime
FROM node:18-alpine

# Install dependencies for Puppeteer and QR code
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    bash \
    curl

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p sessions logs

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port (for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]
