/**
 * Recherche "intelligente" sans dépendance ML :
 * normalisation (accents/casse), tokenisation, retrait des mots vides,
 * pondération TF-IDF par champ, expansion par synonymes et tolérance
 * aux fautes de frappe (distance de Levenshtein).
 */

export interface Searchable {
  id: string
  title: string
  excerpt?: string | null
  content?: string | null
}

export interface SearchHit<T> {
  item: T
  score: number
}

const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'et', 'ou',
  'a', 'à', 'en', 'dans', 'sur', 'sous', 'pour', 'par', 'avec', 'sans', 'ce',
  'cet', 'cette', 'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'on', 'il',
  'elle', 'je', 'tu', 'nous', 'vous', 'ils', 'elles', 'que', 'qui', 'quoi',
  'est', 'sont', 'comme', 'plus', 'moins', 'the', 'of', 'and',
])

/** Familles de synonymes : chaque mot pointe vers un ensemble partagé. */
const SYNONYM_GROUPS: string[][] = [
  ['bonjour', 'salut', 'coucou', 'bonsoir', 'hello'],
  ['merci', 'remerciement', 'remercier'],
  ['manger', 'nourriture', 'repas', 'aliment', 'alimentation', 'nourrir'],
  ['boire', 'boisson', 'buvable'],
  ['maison', 'domicile', 'logement', 'habitation', 'chez', 'foyer'],
  ['voiture', 'auto', 'automobile', 'bagnole', 'caisse'],
  ['bus', 'autobus', 'autocar', 'car'],
  ['velo', 'bicyclette', 'cycle'],
  ['train', 'tgv', 'rail'],
  ['avion', 'aeroplane', 'aerien'],
  ['medecin', 'docteur', 'toubib', 'soignant'],
  ['malade', 'maladie', 'souffrant', 'malaise'],
  ['mal', 'douleur', 'douloureux'],
  ['enfant', 'gamin', 'gosse', 'petit', 'bambin'],
  ['ami', 'copain', 'copine', 'pote', 'camarade'],
  ['famille', 'parents', 'proches'],
  ['maman', 'mere', 'mama'],
  ['papa', 'pere'],
  ['content', 'heureux', 'joyeux', 'joie', 'sourire'],
  ['ecole', 'classe', 'scolaire'],
  ['apprendre', 'apprentissage', 'etudier', 'education'],
  ['livre', 'bouquin', 'ouvrage'],
  ['ecrire', 'ecriture', 'rediger'],
  ['lire', 'lecture'],
  ['eau', 'boire'],
  ['lait', 'laitier'],
  ['pain', 'baguette', 'boulangerie'],
  ['pomme', 'fruit'],
  ['legume', 'legumes', 'potager', 'jardin'],
  ['dormir', 'sommeil', 'sieste', 'lit'],
  ['aide', 'aider', 'soutien', 'assistance'],
  ['oui', 'accord', 'daccord'],
  ['non', 'refus', 'refuser'],
  ['temps', 'heure', 'horaire', 'montre'],
  ['couleur', 'couleurs', 'teinte'],
  ['marcher', 'marche', 'pied', 'pieds'],
  ['cuisine', 'cuisiner'],
  ['porte', 'entree'],
  ['fenetre', 'vitre'],
  ['table', 'meuble'],
  ['personne', 'personnes', 'gens', 'humain'],
]

const SYNONYMS: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>()
  for (const group of SYNONYM_GROUPS) {
    const set = new Set(group)
    for (const word of group) map.set(word, set)
  }
  return map
})()

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/** Étend un jeu de tokens avec leurs synonymes connus. */
function expand(tokens: string[]): string[] {
  const out = new Set(tokens)
  for (const t of tokens) {
    const syn = SYNONYMS.get(t)
    if (syn) syn.forEach((s) => out.add(normalize(s)))
  }
  return Array.from(out)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const prev = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diag = tmp
    }
  }
  return prev[b.length]
}

/** Tolérance aux fautes : un token "proche" d'un terme cible. */
function fuzzyMatch(token: string, target: string): boolean {
  if (token === target) return true
  const max = target.length <= 4 ? 1 : 2
  if (Math.abs(token.length - target.length) > max) return false
  return levenshtein(token, target) <= max
}

const FIELD_WEIGHTS = { title: 5, excerpt: 2.5, content: 1 }

/**
 * Classe une liste d'items par pertinence pour une requête.
 * Renvoie uniquement les items avec un score > 0, triés décroissant.
 */
export function smartSearch<T extends Searchable>(query: string, items: T[]): SearchHit<T>[] {
  const queryTokens = expand(tokenize(query))
  if (queryTokens.length === 0) return items.map((item) => ({ item, score: 0 }))

  // IDF sur le corpus (champ titre + excerpt + contenu).
  const docTokens = items.map((it) => ({
    title: tokenize(it.title),
    excerpt: tokenize(it.excerpt || ''),
    content: tokenize(it.content || ''),
  }))

  const df = new Map<string, number>()
  docTokens.forEach((d) => {
    const seen = new Set([...d.title, ...d.excerpt, ...d.content])
    seen.forEach((t) => df.set(t, (df.get(t) || 0) + 1))
  })
  const N = items.length || 1
  const idf = (term: string) => Math.log(1 + N / (1 + (df.get(term) || 0)))

  const hits: SearchHit<T>[] = []

  items.forEach((item, i) => {
    const d = docTokens[i]
    let score = 0
    const titleNorm = normalize(item.title)

    for (const qt of queryTokens) {
      const weight = idf(qt)

      const countField = (tokens: string[]) => {
        let exact = 0
        let fuzzy = 0
        for (const dt of tokens) {
          if (dt === qt) exact++
          else if (fuzzyMatch(dt, qt)) fuzzy++
        }
        return exact + fuzzy * 0.5
      }

      score += countField(d.title) * FIELD_WEIGHTS.title * weight
      score += countField(d.excerpt) * FIELD_WEIGHTS.excerpt * weight
      score += countField(d.content) * FIELD_WEIGHTS.content * weight

      // Bonus début de titre / sous-chaîne (ex: "tom" → "tomate").
      if (titleNorm.startsWith(qt)) score += 6
      else if (titleNorm.includes(qt)) score += 3
    }

    if (score > 0) hits.push({ item, score })
  })

  return hits.sort((a, b) => b.score - a.score)
}
