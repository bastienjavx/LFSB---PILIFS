#!/bin/sh
set -e

echo "🌱 Pilifs LFSB - Démarrage..."

echo "📦 Exécution des migrations..."
# Version épinglée : sans cela, npx récupère le dernier Prisma (7.x),
# qui ne supporte plus `url = env(...)` dans le schéma.
npx --yes prisma@5.22.0 migrate deploy

echo "🌿 Seed (catégories + signes)..."
node prisma/seed.js || echo "⚠️  Seed ignoré (non critique)"

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
