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
FROM node:20.20.2-alpine3.23 AS builder

# Install libc6-compat for Alpine compatibility with some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY . .

# Build-time args for NEXT_PUBLIC_* variables (baked into client bundle)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ADMIN_APP_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_ADMIN_APP_URL=${NEXT_PUBLIC_ADMIN_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN --mount=type=cache,target=/app/.next/cache \
    yarn build

# -----------------------------------------------------------------------------
# Stage 2: Runner (Production - Hardened)
# -----------------------------------------------------------------------------
FROM node:20.20.2-alpine3.23 AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Create non-root user with nologin shell
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --shell /sbin/nologin nextjs

# ── Container hardening ─────────────────────────────────────────────────
# 1. Remove package manager so attackers cannot install tools
# 2. Remove network utilities (wget, curl) to prevent tool download & data exfil
# 3. Remove system info files that reveal OS / version
# 4. Remove shells except /sbin/nologin (needed for user validation)
RUN apk --no-cache del apk-tools alpine-keys \
    && rm -f /usr/bin/wget /usr/bin/curl \
    && rm -f /etc/os-release /etc/alpine-release /etc/motd \
    && rm -rf /var/cache/apk /tmp/* /root/.cache \
    && rm -f /bin/sh /bin/ash /bin/bash 2>/dev/null; \
    ln -sf /sbin/nologin /bin/sh

# Copy public assets (owned by root = read-only to nextjs)
COPY --from=builder /app/public ./public

# Only .next directory is writable by nextjs (prerender cache)
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Make .next writable for ISR/prerender cache, everything else read-only
RUN chown -R nextjs:nodejs /app/.next && \
    find /app -not -path '/app/.next*' -type f -exec chmod 444 {} + && \
    find /app -not -path '/app/.next*' -type d -exec chmod 555 {} +

# Remove any .map source map files that may have leaked into standalone
RUN find /app -name '*.map' -delete 2>/dev/null; true

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
