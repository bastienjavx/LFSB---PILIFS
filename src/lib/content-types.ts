export const NoteTypeValue = {
  SIGN: 'SIGN',
  INFORMATION: 'INFORMATION',
  PAGE: 'PAGE',
  BLOG: 'BLOG',
  TRAINING: 'TRAINING',
  GUIDE: 'GUIDE',
} as const

export type NoteTypeValue = (typeof NoteTypeValue)[keyof typeof NoteTypeValue]

export const NOTE_TYPE_LABELS: Record<NoteTypeValue, string> = {
  SIGN: 'Signe LFSB',
  INFORMATION: 'Information',
  PAGE: 'Page',
  BLOG: 'Article de blog',
  TRAINING: 'Module de formation',
  GUIDE: 'Guide / tutoriel',
}

export const NOTE_TYPE_ICONS: Record<NoteTypeValue, string> = {
  SIGN: '👐',
  INFORMATION: '📖',
  PAGE: '📄',
  BLOG: '📰',
  TRAINING: '🎓',
  GUIDE: '🧭',
}

export const PUBLIC_CONTENT_TYPES = {
  blog: {
    type: NoteTypeValue.BLOG,
    href: '/blog',
    title: 'Blog',
    singular: 'Article',
    empty: 'Aucun article publié pour le moment.',
  },
  formations: {
    type: NoteTypeValue.TRAINING,
    href: '/formations',
    title: 'Modules de formation',
    singular: 'Module',
    empty: 'Aucun module de formation publié pour le moment.',
  },
  guides: {
    type: NoteTypeValue.GUIDE,
    href: '/guides',
    title: 'Guides et tutoriels',
    singular: 'Guide',
    empty: 'Aucun guide publié pour le moment.',
  },
} as const

export function publicHrefForType(type: string, slug: string) {
  if (type === NoteTypeValue.BLOG) return `/blog/${slug}`
  if (type === NoteTypeValue.TRAINING) return `/formations/${slug}`
  if (type === NoteTypeValue.GUIDE) return `/guides/${slug}`
  return `/signes/${slug}`
}
