/* Seed PILIFS LFSB - JavaScript pur (exécutable en production sans ts-node). */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const slugify = require('slugify')

const prisma = new PrismaClient()

const toSlug = (text) => slugify(text, { lower: true, strict: true, locale: 'fr' })

const categories = [
  { name: 'Personnes', slug: 'personnes', icon: 'icon:people', color: '#2563eb', order: 1 },
  { name: 'Maison', slug: 'maison', icon: 'icon:home', color: '#16a34a', order: 2 },
  { name: 'Alimentation', slug: 'alimentation', icon: 'icon:food', color: '#ea580c', order: 3 },
  { name: 'Éducation', slug: 'education', icon: 'icon:book', color: '#0d9488', order: 4 },
  { name: 'Santé', slug: 'sante', icon: 'icon:health', color: '#dc2626', order: 5 },
  { name: 'Transports', slug: 'transports', icon: 'icon:bus', color: '#7c3aed', order: 6 },
  { name: 'Autres catégories', slug: 'autres', icon: 'icon:dots', color: '#1e3a8a', order: 7 },
]

// Anciennes catégories de démonstration à retirer (synchronisation).
const obsoleteSlugs = ['animaux', 'legumes', 'fruits', 'ferme', 'salutations', 'information']

function fiche(o) {
  return `## En bref
${o.resume}

## Comment faire le signe
- **Configuration des mains :** ${o.config}
- **Mouvement :** ${o.mouvement}

${o.conseil ? `## Conseil\n${o.conseil}\n` : ''}
> Astuce : regarde la vidéo plusieurs fois, puis essaie devant un miroir.`
}

const signsByCategory = {
  personnes: [
    { title: 'Bonjour', excerpt: 'Saluer une personne.', resume: "Le signe « bonjour » sert à saluer quelqu'un quand on le rencontre.", config: 'main ouverte, doigts joints, près du front.', mouvement: 'la main s’éloigne du front vers l’avant, comme un petit salut.', conseil: 'Accompagne toujours le signe d’un sourire et d’un regard.' },
    { title: 'Merci', excerpt: 'Remercier quelqu’un.', resume: 'On utilise « merci » pour remercier une personne.', config: 'main ouverte à plat devant le menton.', mouvement: 'la main avance vers la personne remerciée.' },
    { title: 'Famille', excerpt: 'Les personnes qui vivent ensemble.', resume: 'La famille désigne les parents, les enfants et les proches.', config: 'les deux mains forment un cercle.', mouvement: 'les mains dessinent un rond pour montrer le groupe.' },
    { title: 'Ami', excerpt: 'Une personne qu’on aime bien.', resume: 'Un ami est une personne proche en qui on a confiance.', config: 'les deux index se croisent.', mouvement: 'les index s’accrochent l’un à l’autre.' },
    { title: 'Maman', excerpt: 'La mère.', resume: 'Le signe « maman » désigne la mère.', config: 'main ouverte, pouce posé sur la joue.', mouvement: 'petit contact du pouce sur la joue.' },
    { title: 'Papa', excerpt: 'Le père.', resume: 'Le signe « papa » désigne le père.', config: 'main ouverte, pouce sur le front.', mouvement: 'petit contact du pouce sur le front.' },
    { title: 'Enfant', excerpt: 'Un petit garçon ou une petite fille.', resume: 'Un enfant est une personne jeune.', config: 'main à plat, paume vers le bas.', mouvement: 'la main descend pour montrer une petite taille.' },
  ],
  maison: [
    { title: 'Maison', excerpt: 'Le lieu où on habite.', resume: 'La maison est l’endroit où on vit et on dort.', config: 'les deux mains forment un toit.', mouvement: 'les mains dessinent le toit puis les murs.' },
    { title: 'Porte', excerpt: 'On l’ouvre pour entrer.', resume: 'La porte permet d’entrer et de sortir.', config: 'les deux mains à plat, côte à côte.', mouvement: 'une main pivote comme une porte qui s’ouvre.' },
    { title: 'Table', excerpt: 'On mange dessus.', resume: 'La table est un meuble où on pose les choses.', config: 'les deux mains à plat, paumes vers le bas.', mouvement: 'les mains dessinent le plateau horizontal.' },
    { title: 'Lit', excerpt: 'On dort dedans.', resume: 'Le lit sert à se reposer et à dormir.', config: 'main à plat près de la joue inclinée.', mouvement: 'la tête s’incline sur la main, comme pour dormir.' },
    { title: 'Cuisine', excerpt: 'La pièce où on prépare à manger.', resume: 'La cuisine est la pièce où on cuisine les repas.', config: 'une main tient une casserole imaginaire.', mouvement: 'l’autre main remue comme avec une cuillère.' },
    { title: 'Fenêtre', excerpt: 'On voit dehors à travers.', resume: 'La fenêtre laisse entrer la lumière.', config: 'les deux mains à plat l’une sur l’autre.', mouvement: 'la main du haut se lève comme on ouvre une fenêtre.' },
  ],
  alimentation: [
    { title: 'Manger', excerpt: 'Mettre de la nourriture dans la bouche.', resume: 'Le signe « manger » montre l’action de se nourrir.', config: 'doigts joints en pince près de la bouche.', mouvement: 'la main approche de la bouche plusieurs fois.' },
    { title: 'Boire', excerpt: 'Avaler un liquide.', resume: 'Le signe « boire » montre qu’on boit de l’eau.', config: 'main en forme de verre.', mouvement: 'la main monte vers la bouche en s’inclinant.' },
    { title: 'Pain', excerpt: 'Aliment de base.', resume: 'Le pain est un aliment fait avec de la farine.', config: 'une main à plat, l’autre fait un geste de couper.', mouvement: 'la main coupe des tranches imaginaires.' },
    { title: 'Pomme', excerpt: 'Un fruit.', resume: 'La pomme est un fruit rond et croquant.', config: 'index plié contre la joue.', mouvement: 'petit mouvement de rotation contre la joue.' },
    { title: 'Eau', excerpt: 'À boire.', resume: 'L’eau est la boisson de base.', config: 'main en « W », trois doigts levés.', mouvement: 'tape légèrement près du menton.' },
    { title: 'Lait', excerpt: 'Boisson blanche.', resume: 'Le lait vient des animaux comme la vache.', config: 'main qui serre et desserre le poing.', mouvement: 'mouvement répété comme pour traire.' },
    { title: 'Légume', excerpt: 'Pousse au potager.', resume: 'Les légumes poussent dans le jardin et le potager.', config: 'main ouverte près de la bouche.', mouvement: 'léger contact, doigts qui se ferment.' },
  ],
  education: [
    { title: 'Apprendre', excerpt: 'Découvrir quelque chose de nouveau.', resume: 'Apprendre, c’est recevoir un nouveau savoir.', config: 'main ouverte au-dessus de la paume.', mouvement: 'la main remonte vers le front, comme on prend une information.' },
    { title: 'Livre', excerpt: 'On le lit.', resume: 'Le livre contient des histoires et des informations.', config: 'les deux mains jointes paume contre paume.', mouvement: 'les mains s’ouvrent comme un livre.' },
    { title: 'Écrire', excerpt: 'Tracer des lettres.', resume: 'Écrire, c’est former des mots avec un stylo.', config: 'une main tient un stylo imaginaire.', mouvement: 'la main trace sur l’autre paume.' },
    { title: 'Lire', excerpt: 'Comprendre un texte.', resume: 'Lire, c’est suivre les mots des yeux.', config: 'deux doigts en « V » devant les yeux.', mouvement: 'les doigts descendent le long d’une page imaginaire.' },
    { title: 'École', excerpt: 'Lieu pour apprendre.', resume: 'L’école est l’endroit où on apprend.', config: 'les deux mains à plat.', mouvement: 'tape deux fois les mains l’une contre l’autre.' },
    { title: 'Question', excerpt: 'Demander quelque chose.', resume: 'Poser une question, c’est demander une information.', config: 'index levé.', mouvement: 'l’index dessine un point d’interrogation.' },
  ],
  sante: [
    { title: 'Malade', excerpt: 'Ne pas se sentir bien.', resume: 'Être malade, c’est quand le corps ne va pas bien.', config: 'main posée sur le front.', mouvement: 'léger mouvement, visage fatigué.' },
    { title: 'Médecin', excerpt: 'La personne qui soigne.', resume: 'Le médecin soigne les personnes malades.', config: 'deux doigts sur le poignet.', mouvement: 'comme pour prendre le pouls.' },
    { title: 'Mal', excerpt: 'Avoir une douleur.', resume: 'Avoir mal, c’est ressentir une douleur.', config: 'les deux index pointés l’un vers l’autre.', mouvement: 'petits mouvements près de l’endroit qui fait mal.' },
    { title: 'Dormir', excerpt: 'Se reposer la nuit.', resume: 'Dormir permet au corps de se reposer.', config: 'main ouverte près du visage.', mouvement: 'les yeux se ferment, la tête s’incline.' },
    { title: 'Pharmacie', excerpt: 'On y trouve les médicaments.', resume: 'La pharmacie vend les médicaments.', config: 'main en croix sur l’autre.', mouvement: 'dessine une croix, symbole de la santé.' },
    { title: 'Aide', excerpt: 'Soutenir quelqu’un.', resume: 'Aider, c’est soutenir une personne.', config: 'une main soulève l’autre poing.', mouvement: 'les deux mains montent ensemble.' },
  ],
  transports: [
    { title: 'Bus', excerpt: 'Transport en commun.', resume: 'Le bus transporte beaucoup de personnes.', config: 'les deux mains tiennent un grand volant.', mouvement: 'les mains avancent comme un véhicule.' },
    { title: 'Voiture', excerpt: 'On la conduit.', resume: 'La voiture sert à se déplacer.', config: 'les deux mains tiennent un volant.', mouvement: 'mouvement de conduite.' },
    { title: 'Train', excerpt: 'Roule sur des rails.', resume: 'Le train circule sur des voies ferrées.', config: 'deux doigts de chaque main.', mouvement: 'frottement régulier, comme les roues.' },
    { title: 'Vélo', excerpt: 'Deux roues à pédales.', resume: 'Le vélo avance grâce aux pédales.', config: 'les deux poings fermés.', mouvement: 'rotation des poings comme on pédale.' },
    { title: 'Marcher', excerpt: 'Avancer à pied.', resume: 'Marcher, c’est se déplacer à pied.', config: 'deux doigts pointés vers le bas.', mouvement: 'les doigts avancent comme des jambes.' },
    { title: 'Avion', excerpt: 'Vole dans le ciel.', resume: 'L’avion transporte les gens dans le ciel.', config: 'main avec pouce, index et auriculaire levés.', mouvement: 'la main décolle vers le haut.' },
  ],
  autres: [
    { title: 'Oui', excerpt: 'Réponse positive.', resume: 'Le signe « oui » exprime l’accord.', config: 'poing fermé.', mouvement: 'le poing fait un petit mouvement de haut en bas, comme une tête qui dit oui.' },
    { title: 'Non', excerpt: 'Réponse négative.', resume: 'Le signe « non » exprime le refus.', config: 'index et majeur levés.', mouvement: 'les deux doigts se referment sur le pouce.' },
    { title: 'Temps', excerpt: 'Heures et journées.', resume: 'Le temps mesure les heures et les jours.', config: 'index pointé sur le poignet.', mouvement: 'tape sur le poignet, comme une montre.' },
    { title: 'Couleur', excerpt: 'Rouge, bleu, vert…', resume: 'Les couleurs décrivent ce qu’on voit.', config: 'doigts ouverts devant le menton.', mouvement: 'petit mouvement des doigts.' },
    { title: 'Content', excerpt: 'Être heureux.', resume: 'Être content, c’est ressentir de la joie.', config: 'mains ouvertes sur la poitrine.', mouvement: 'les mains montent avec un grand sourire.' },
  ],
}

async function main() {
  console.log('🌱 Seed PILIFS LFSB…')

  const email = process.env.ADMIN_EMAIL || 'admin@pilifs.be'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { email, password: hash, role: 'ADMIN' } })
    console.log(`✅ Admin créé : ${email}`)
  }

  // Retire les anciennes catégories de démonstration (notes conservées, catégorie mise à null).
  await prisma.category.deleteMany({ where: { slug: { in: obsoleteSlugs } } })

  const catBySlug = {}
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, color: cat.color, order: cat.order },
      create: cat,
    })
    catBySlug[cat.slug] = created.id
  }
  console.log(`✅ ${categories.length} catégories`)

  let count = 0
  for (const [slug, signs] of Object.entries(signsByCategory)) {
    for (const s of signs) {
      const noteSlug = toSlug(s.title)
      const data = {
        title: s.title,
        excerpt: s.excerpt,
        content: fiche(s),
        published: true,
        type: 'SIGN',
        categoryId: catBySlug[slug],
      }
      await prisma.note.upsert({
        where: { slug: noteSlug },
        update: data,
        create: { ...data, slug: noteSlug },
      })
      count++
    }
  }
  console.log(`✅ ${count} signes`)

  await prisma.note.upsert({
    where: { slug: 'bienvenue-pilifs-lfsb' },
    update: {},
    create: {
      title: 'Bienvenue sur PILIFS – LFSB',
      slug: 'bienvenue-pilifs-lfsb',
      excerpt: 'Découvrir la plateforme et la Langue Française des Signes de Belgique.',
      content: `## Une base de connaissances pour la langue des signes

**PILIFS – LFSB** rassemble les signes de la **Langue Française des Signes de Belgique** dans une plateforme claire, visuelle et accessible à toutes et tous.

## Comment ça marche
- **Cherchez** un signe avec un mot simple.
- **Explorez** les signes par catégorie (personnes, maison, alimentation…).
- **Regardez** la description du signe et entraînez-vous.

## Conçu pour l'accessibilité
La plateforme propose une barre d'accessibilité : taille du texte, contraste, mode simple et surlignage des liens. Chaque page utilise des mots courts et de grands repères visuels.

> PILIFS est un projet de la Ferme Nos Pilifs pour rendre la communication plus inclusive.`,
      published: true,
      type: 'INFORMATION',
      categoryId: catBySlug['autres'],
    },
  })
  console.log('✅ Page d’information')
  console.log('🎉 Seed terminé !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
