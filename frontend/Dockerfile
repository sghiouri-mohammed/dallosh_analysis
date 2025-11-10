# Multi-stage build for Dallosh Analysis Frontend
# Using Node.js runtime (Next.js official support)
# Optimized for faster builds with BuildKit cache mounts
FROM node:20-alpine AS base
WORKDIR /project/frontend

# Install dependencies stage with BuildKit cache mount
FROM base AS install
COPY package.json ./
# Use BuildKit cache mount to speed up npm install on subsequent builds
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

# Build stage
FROM base AS prerelease
COPY --from=install /project/frontend/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage - use minimal Node.js image
FROM node:20-alpine AS release
WORKDIR /project/frontend

# Create non-root user FIRST (before copying files)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package.json and install only production dependencies as root
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy built application (as root, then chown only specific dirs)
COPY --from=prerelease /project/frontend/public ./public
COPY --from=prerelease /project/frontend/.next ./.next

# Change ownership of only necessary directories (not entire node_modules)
# This is much faster than chowning everything
RUN chown -R nextjs:nodejs /project/frontend/.next /project/frontend/public && \
    chown nextjs:nodejs /project/frontend

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3006

# Set environment variables
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["npm", "run", "start"]
