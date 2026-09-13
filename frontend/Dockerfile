# -------- Stage 1: Build --------

    FROM node:lts-alpine AS builder

    WORKDIR /app

    COPY package*.json ./

    RUN npm ci

    COPY . .

    RUN npm run build

# -------- Stage 2: Production --------

    FROM node:lts-alpine

    # Install tini for proper signal handling
    RUN apk add --no-cache tini

    ENV NODE_ENV=production

    WORKDIR /app

    # Copy only the output we need
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/next.config.ts ./

    # API_BASE_URL is read per request on the server, so it is set at run time
    # (docker-compose.yml points it at the api service), not baked into the build.

    ENTRYPOINT ["/sbin/tini", "--"]

    EXPOSE 3000

    CMD ["npm", "start"]
