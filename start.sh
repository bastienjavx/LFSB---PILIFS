#!/bin/sh
set -e

echo "🌱 Pilifs LFSB - Démarrage..."

echo "📦 Exécution des migrations..."
npx prisma migrate deploy

echo "🌿 Seed initial si nécessaire..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@pilifs.be';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, password: hash, role: 'ADMIN' } });

    // Catégories initiales
    const cats = [
      { name: 'Animaux', slug: 'animaux', icon: '🐄', color: '#15803d' },
      { name: 'Légumes', slug: 'legumes', icon: '🥦', color: '#16a34a' },
      { name: 'Fruits', slug: 'fruits', icon: '🍎', color: '#dc2626' },
      { name: 'Ferme', slug: 'ferme', icon: '🏡', color: '#92400e' },
      { name: 'Salutations', slug: 'salutations', icon: '👋', color: '#7c3aed' },
      { name: 'Information', slug: 'information', icon: '📖', color: '#0284c7' },
    ];
    for (const cat of cats) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }
    console.log('✅ Admin et catégories créés');
  } else {
    console.log('ℹ️  Base de données déjà initialisée');
  }
}
main().finally(() => prisma.\$disconnect());
" || echo "⚠️  Seed ignoré (non critique)"

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
