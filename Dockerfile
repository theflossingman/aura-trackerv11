# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy whole project including public folder
COPY . .

# Create data directory with proper permissions for volume mounting
RUN mkdir -p /app/data && \
    chown -R node:node /app/data && \
    chmod -R 755 /app/data

# Switch to non-root user for security
USER node

# Expose port 3040
EXPOSE 3040

# Health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3040/api/users', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start Node.js server
CMD ["node", "server.js"]
