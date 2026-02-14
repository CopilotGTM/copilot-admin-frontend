# syntax=docker/dockerfile:1
# =============================================================================
# Hardened Next.js Production Dockerfile - Admin Frontend
# =============================================================================
# Features:
# - 2-stage build (builder -> runner) for minimal image size
# - Non-root user with nologin shell
# - Container hardening: removed shells, package managers, network tools
# - Read-only file permissions (444 files, 555 dirs)
# - Source map removal for security
# - Node-based healthcheck (no wget/curl available)
# - BuildKit cache mounts for faster rebuilds
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder (install deps + build)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Install libc6-compat for Alpine compatibility with some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY . .

# Build-time args for NEXT_PUBLIC_* variables (baked into client bundle)
ARG NEXT_PUBLIC_API_BASE_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN yarn build

# -----------------------------------------------------------------------------
# Stage 2: Runner (Production - Hardened)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Create non-root user with nologin shell
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --shell /sbin/nologin nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with correct ownership for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove source maps for security
RUN find /app -name '*.map' -delete

# Container hardening: remove unnecessary tools and shells
RUN apk del --purge apk-tools 2>/dev/null; \
    rm -rf /sbin/apk /usr/sbin/apk /var/cache/apk /etc/apk /lib/apk; \
    rm -f /usr/bin/wget /usr/bin/curl; \
    rm -f /bin/sh /bin/ash /bin/bash 2>/dev/null; \
    rm -f /etc/os-release /usr/lib/os-release; \
    true

# Set read-only file permissions (except .next for prerender cache)
RUN find /app -not -path '/app/.next/*' -type f -exec chmod 444 {} + && \
    find /app -not -path '/app/.next/*' -type d -exec chmod 555 {} +

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Graceful shutdown
STOPSIGNAL SIGTERM

# Health check using node (wget/curl removed during hardening)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.setTimeout(5000, () => { req.destroy(); process.exit(1); });"

# Start the application
CMD ["node", "server.js"]
