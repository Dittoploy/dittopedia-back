# ---- Build ----
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --no-save
COPY . .
RUN bun run prisma:generate
RUN bun run build

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app

# On installe openssl car Prisma en a souvent besoin sur alpine
RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Valeurs par défaut
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/src/main.js"]