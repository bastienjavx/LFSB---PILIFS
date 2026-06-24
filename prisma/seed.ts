import { PrismaClient, NoteType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed en cours...')

  const email = process.env.ADMIN_EMAIL || 'admin@pilifs.be'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { email, password: hash, role: 'ADMIN' } })
    console.log(`✅ Admin créé: ${email}`)
  }

  const categories = [
    { name: 'Animaux', slug: 'animaux', icon: '🐄', color: '#15803d', order: 1 },
    { name: 'Légumes', slug: 'legumes', icon: '🥦', color: '#16a34a', order: 2 },
    { name: 'Fruits', slug: 'fruits', icon: '🍎', color: '#dc2626', order: 3 },
    { name: 'Ferme', slug: 'ferme', icon: '🏡', color: '#92400e', order: 4 },
    { name: 'Salutations', slug: 'salutations', icon: '👋', color: '#7c3aed', order: 5 },
    { name: 'Information', slug: 'information', icon: '📖', color: '#0284c7', order: 6 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Catégories créées')

  const fermeCategory = await prisma.category.findUnique({ where: { slug: 'ferme' } })

  const sampleNote = await prisma.note.upsert({
    where: { slug: 'bienvenue-a-nos-pilifs' },
    update: {},
    create: {
      title: 'Bienvenue à Nos Pilifs',
      slug: 'bienvenue-a-nos-pilifs',
      content: `# Bienvenue à la Ferme Nos Pilifs

La ferme Nos Pilifs est un lieu d'accueil et d'apprentissage pour les personnes en situation de handicap.

## Notre mission

Nous proposons des activités agricoles adaptées :
- Soin aux animaux
- Jardinage et maraîchage
- Récolte des légumes et fruits

## La LSF Belge (LFSB)

Ce site présente les **signes LFSB** (Langue Française des Signes de Belgique) liés aux activités de la ferme.

Chaque signe est présenté avec une vidéo pour faciliter l'apprentissage.`,
      excerpt: 'Découvrez la Ferme Nos Pilifs et la LFSB',
      published: true,
      type: NoteType.INFORMATION,
      categoryId: fermeCategory?.id,
    },
  })

  console.log(`✅ Note exemple créée: ${sampleNote.title}`)
  console.log('🎉 Seed terminé!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
