FROM node:current-slim

# Set working directory
WORKDIR /app

# Install dependencies first (for better layer caching)
COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* ./server/

# Install dependencies with explicit --legacy-peer-deps to handle any potential peer dependency issues
RUN npm install --quiet
# Install server dependencies with explicit production flag to ensure all dependencies are installed
RUN cd server && npm install --quiet --production

# Copy application code
COPY . .

# Build the React app
RUN npm run build

# Expose ports for the server
EXPOSE 5000

# Create volumes for persistent data
VOLUME ["/app/server/uploads", "/app/server/data"]

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
CMD ["node", "server/server.js"]