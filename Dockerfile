# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /build

# Copy form source files (needed for migration)
COPY forms/ ./forms/
COPY css/ ./css/
COPY logo.png ./

# Copy app
COPY app/package.json app/package-lock.json ./app/
WORKDIR /build/app
RUN npm ci

COPY app/ ./
RUN npm run build

# Stage 2: Production
FROM node:20-slim

# Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Built SvelteKit app
COPY --from=builder /build/app/build ./build
COPY --from=builder /build/app/package.json ./
COPY --from=builder /build/app/node_modules ./node_modules

# Migration tooling
COPY --from=builder /build/app/drizzle ./drizzle
COPY --from=builder /build/app/drizzle.config.ts ./
COPY --from=builder /build/app/scripts ./scripts
COPY --from=builder /build/app/tsconfig.json ./

# Form source files for migration script
COPY --from=builder /build/forms /source/forms
COPY --from=builder /build/css /source/css
COPY --from=builder /build/logo.png /source/logo.png

# Entrypoint
COPY app/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Data directory
RUN mkdir -p /app/data
VOLUME /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "build"]
