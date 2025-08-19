# 1) Builder stage
FROM node:lts AS builder

# — build-time args (defaults)
ARG NEXT_PUBLIC_API_BASE_URL=https://devapi.copilotgtm.com/admin

# — make them available to Next.js at build time
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# strip out devDependencies
RUN yarn install --production --frozen-lockfile

# 2) Runner stage
FROM node:lts-alpine AS runner

# runtime ENV
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=https://devapi.copilotgtm.com/admin


WORKDIR /app

# bring in built app + prod deps
COPY --from=builder /app/package*.json /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 8080
CMD ["yarn", "start"]
