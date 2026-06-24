-- Recherche plein-texte PostgreSQL pour les signes.
-- Insensible aux accents (extension unaccent) + stemming français + pondération.
-- La colonne "searchVector" n'est PAS gérée par le schéma Prisma : elle est
-- générée par PostgreSQL et interrogée via $queryRaw (voir src/lib/search-db.ts).

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Configuration de recherche française qui ignore les accents.
CREATE TEXT SEARCH CONFIGURATION french_unaccent ( COPY = french );
ALTER TEXT SEARCH CONFIGURATION french_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, french_stem;

-- Colonne tsvector générée : titre (poids A) > extrait (B) > contenu (C).
ALTER TABLE "Note" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french_unaccent', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('french_unaccent', coalesce("excerpt", '')), 'B') ||
    setweight(to_tsvector('french_unaccent', coalesce("content", '')), 'C')
  ) STORED;

-- Index GIN pour des recherches rapides à grande échelle.
CREATE INDEX "Note_searchVector_idx" ON "Note" USING GIN ("searchVector");
