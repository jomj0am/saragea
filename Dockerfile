# 1. Install dependencies only when needed
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# 2. Rebuild the source code
FROM node:20-alpine AS builder
RUN apk add --no-cache build-base vips-dev libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# BUILD THE PROJECT HERE
# We add the placeholders here so Next.js doesn't crash during build analysis
ENV NEXT_TELEMETRY_DISABLED=1
RUN RESEND_API_KEY="placeholder" \
    NEXTAUTH_SECRET="placeholder" \
    PUSHER_APP_ID="placeholder" \
    NEXT_PUBLIC_PUSHER_KEY="placeholder" \
    PUSHER_SECRET="placeholder" \
    DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user/group first
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]