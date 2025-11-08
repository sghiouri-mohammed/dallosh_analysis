# Multi-stage build for Dallosh Analysis Frontend
# Using Bun runtime - see https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /project/frontend

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /project/frontend/temp/dev
COPY package.json bun.lock* /project/frontend/temp/dev/
RUN cd /project/frontend/temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /project/frontend/temp/prod
COPY package.json bun.lock* /project/frontend/temp/prod/
RUN cd /project/frontend/temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /project/frontend/temp/dev/node_modules node_modules
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Copy production dependencies and built application into final image
FROM base AS release
COPY --from=install /project/frontend/temp/prod/node_modules node_modules
COPY --from=prerelease /project/frontend/public ./public
COPY --from=prerelease /project/frontend/.next ./.next
COPY --from=prerelease /project/frontend/package.json ./package.json

# Set the correct permission for prerender cache
RUN chown -R bun:bun .next

# Run as non-root user
USER bun

# Expose port
EXPOSE 3000/tcp

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application using Next.js start command
ENTRYPOINT [ "bun", "run", "start" ]
