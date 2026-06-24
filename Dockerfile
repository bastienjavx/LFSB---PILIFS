FROM node:20-alpine AS base

# ---- Dépendances ----
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Aligner npm de la CI sur la version utilisée en local pour générer
# package-lock.json (npm 11). node:20-alpine embarque npm 10.x, qui rejette
# les locks écrits par npm 11 (« Missing ... from lock file »). Pin pour que
# `npm ci` reste reproductible quelle que soit la machine qui édite le lock.
RUN npm install -g npm@11.6.2

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# ---- Build ----
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# URL factice pour le build (les vraies variables sont injectées par Railway)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV NEXTAUTH_SECRET="build-placeholder-secret"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npm run build

# ---- Runner ----
FROM base AS runner
RUN apk add --no-cache openssl su-exec
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers statiques
COPY --from=builder /app/public ./public

# Créer le dossier uploads avec les bonnes permissions
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

# Copier le build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier les migrations Prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Dépendances requises par prisma/seed.js (Next les bundle, donc absentes du standalone)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/slugify ./node_modules/slugify
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Script de démarrage
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
