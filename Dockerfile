# Stage 1: Build Next.js app
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV CI=true


# Install pnpm
RUN npm i -g pnpm@latest

# Copy package management files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of the application code
COPY . .

# Build the Next.js app
ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Stage 2: Runner image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
