import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Recherche plein-texte PostgreSQL sur les signes publiés.
 *
 * Utilise la colonne générée `Note."searchVector"` (voir la migration
 * `20260624000000_fulltext_search`) avec la configuration `french_unaccent` :
 * - insensible aux accents et à la casse,
 * - stemming français (« enfants » trouve « enfant »),
 * - pondération titre (A) > extrait (B) > contenu (C).
 *
 * `websearch_to_tsquery` accepte une syntaxe naturelle : plusieurs mots,
 * "expression exacte", OR, et exclusion avec `-mot`.
 *
 * Retourne les ids triés par pertinence décroissante.
 */
export async function searchSignIds(query: string, categorySlug?: string): Promise<string[]> {
  const q = query.trim()
  if (!q) return []

  const tsquery = Prisma.sql`websearch_to_tsquery('french_unaccent', ${q})`

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT n."id"
    FROM "Note" n
    LEFT JOIN "Category" c ON c."id" = n."categoryId"
    WHERE n."published" = true
      AND n."type" = 'SIGN'
      AND n."searchVector" @@ ${tsquery}
      ${categorySlug ? Prisma.sql`AND c."slug" = ${categorySlug}` : Prisma.empty}
    ORDER BY ts_rank(n."searchVector", ${tsquery}) DESC, n."title" ASC
    LIMIT 200
  `)

  return rows.map((r) => r.id)
}
