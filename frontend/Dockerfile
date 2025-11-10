# Multi-stage build for Dallosh Analysis Frontend
# Using Node.js runtime (Next.js official support)
# Node.js is more stable and compatible than Bun for Next.js applications
FROM node:20-alpine AS base
WORKDIR /project/frontend

# Install dependencies stage
FROM base AS install
# Copy package files
COPY package.json ./
# Install all dependencies (needed for build)
# Using --legacy-peer-deps to handle React 19 peer dependency warnings
RUN npm install --legacy-peer-deps

# Build stage
FROM base AS prerelease
# Copy node_modules from install stage
COPY --from=install /project/frontend/node_modules ./node_modules
# Copy all project files
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM base AS release
# Copy package.json for production dependencies
COPY package.json ./

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy built application from prerelease stage
COPY --from=prerelease /project/frontend/public ./public
COPY --from=prerelease /project/frontend/.next ./.next

# Create non-root user (Next.js recommended user)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set correct permissions
RUN chown -R nextjs:nodejs /project/frontend

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
