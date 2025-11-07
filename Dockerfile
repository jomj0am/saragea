# Dockerfile

# --- Build Stage ---
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy code yote
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application with secret
RUN --mount=type=secret,id=dotenv,target=/app/.env \
    export $(cat /app/.env | xargs) && \
    npm run build

# --- Production/Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy 'build output' na 'dependencies'
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json

RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "npm", "--", "start"]