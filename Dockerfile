# syntax=docker/dockerfile:1
# =============================================================================
# Optimized Next.js Production Dockerfile - Admin Frontend
# =============================================================================
# Features:
# - Multi-stage build for minimal image size (~150MB vs ~1GB)
# - Non-root user for security (UID 1001)
# - Next.js standalone output mode
# - BuildKit cache mounts for faster rebuilds
# - Alpine-based for smaller attack surface
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install libc6-compat for Alpine compatibility with some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --network-timeout 100000

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time args for NEXT_PUBLIC_* variables (baked into client bundle)
ARG NEXT_PUBLIC_API_BASE_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN yarn build

# -----------------------------------------------------------------------------
# Stage 3: Runner (Production)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime environment variables (passed at container start, not build time)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Graceful shutdown
STOPSIGNAL SIGTERM

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the application
# Note: server.js is created by Next.js standalone output
CMD ["node", "server.js"]
