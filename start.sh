#!/bin/sh
set -e

echo "🌱 Pilifs LFSB - Démarrage..."

UPLOAD_PATH="${UPLOAD_DIR:-/app/public/uploads}"
echo "📁 Préparation du dossier uploads: $UPLOAD_PATH"
mkdir -p "$UPLOAD_PATH"
chown -R nextjs:nodejs "$UPLOAD_PATH" || echo "⚠️  Impossible d'ajuster les droits du dossier uploads"

echo "📦 Exécution des migrations..."
# Version épinglée : sans cela, npx récupère le dernier Prisma (7.x),
# qui ne supporte plus `url = env(...)` dans le schéma.
npx --yes prisma@5.22.0 migrate deploy

echo "🌿 Seed (catégories + signes)..."
node prisma/seed.js || echo "⚠️  Seed ignoré (non critique)"

echo "🚀 Démarrage du serveur Next.js..."
exec su-exec nextjs:nodejs node server.js
