import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/* Base commune — géométrie propre style Lucide (viewBox 24, stroke 1.8). */
const base = (props: IconProps): IconProps => ({
  width: 40,
  height: 40,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

/* ---------- Navigation ---------- */

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

export function HandIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 11V6a2 2 0 0 0-4 0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

export function MainVerteLogo(props: IconProps) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      {...props}
    >
      <rect width="64" height="64" rx="18" fill="#123D2A" />
      <path
        d="M43.5 12.5c-9.6 1.1-16 6.9-18 15.1 6.6.8 14.6-1.8 18.3-8.5 1.1-2 1.5-4.3-.3-6.6Z"
        fill="#7BC96F"
      />
      <path
        d="M26.2 30.8c4.8-1.9 9.5-5.2 13.7-10.1"
        stroke="#123D2A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18.4 31.6V21.4a4.1 4.1 0 0 1 8.2 0v8.3"
        stroke="#F8F4E8"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M26.6 29.7V18.1a4.1 4.1 0 0 1 8.2 0v12.2"
        stroke="#F8F4E8"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M34.8 31.4v-8.7a4.1 4.1 0 0 1 8.2 0v14.1c0 8.4-5.9 14.2-14.1 14.2h-3.2c-5.2 0-8.3-1.9-11.2-4.8l-4.3-4.3a4 4 0 0 1 5.6-5.7l4.3 4.1"
        stroke="#F8F4E8"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 47.5c5.8-2.1 12.6-2.3 19.1-.6M24.8 53.1c4.2-1.4 8.6-1.5 12.7-.4"
        stroke="#E9B949"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="48.2" cy="15.6" r="4" fill="#E9B949" />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 16v-4.5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function AdminIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="4.4" r="1.5" />
      <path d="M4.5 8.2c2.2.9 4.6 1.3 7.5 1.3s5.3-.4 7.5-1.3" />
      <path d="M12 9.5v5" />
      <path d="m8.4 21 3.6-6.5L15.6 21" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

/* ---------- Méthodes de recherche ---------- */

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function KeyboardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 13h.01M11 13h.01M15 13h.01M8 16.5h8" />
    </svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m16 9.5 5-3v11l-5-3z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  )
}

/* ---------- Catégories ---------- */

export function PeopleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function FoodIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 3.5h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 3.5h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function HealthIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
      <path d="M3.5 12h5l1-2 2.5 5 2-6 1.3 3h4.2" />
    </svg>
  )
}

export function BusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
      <path d="M4 12h16" />
      <path d="M7 5v7M17 5v7" />
      <path d="M5 17v1.5M19 17v1.5" />
      <circle cx="8" cy="17" r="1.6" />
      <circle cx="16" cy="17" r="1.6" />
    </svg>
  )
}

export function DotsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="7.7" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.3" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ---------- Ressources ---------- */

export function VideoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="3.5" width="20" height="13" rx="2" />
      <path d="M10.2 7.6a.5.5 0 0 1 .77-.42l3.4 2.4a.5.5 0 0 1 0 .84l-3.4 2.4a.5.5 0 0 1-.77-.42z" fill="currentColor" stroke="none" />
      <path d="M8 20.5h8M12 16.5v4" />
    </svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
      <path d="m14 6 4 4" />
    </svg>
  )
}

export function QuestionIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 2-2.9 2.6-2.9 4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5a14 14 0 0 1 0 19 14 14 0 0 1 0-19z" />
    </svg>
  )
}

/* ---------- Footer ---------- */

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 7.3 7 8.5 4.1-1.2 7-4.2 7-8.5V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m3 6.5 9 6 9-6" />
    </svg>
  )
}

/* ---------- Mapping slug → icône catégorie ---------- */

const categoryIcons: Record<string, (p: IconProps) => JSX.Element> = {
  personnes: PeopleIcon,
  maison: HomeIcon,
  alimentation: FoodIcon,
  education: BookIcon,
  sante: HealthIcon,
  transports: BusIcon,
  autres: DotsIcon,
  // anciens slugs / variantes
  animaux: PeopleIcon,
  legumes: FoodIcon,
  fruits: FoodIcon,
  ferme: HomeIcon,
  salutations: PeopleIcon,
  information: InfoIcon,
}

export function CategoryIcon({ slug, ...props }: IconProps & { slug?: string }) {
  const Icon = (slug && categoryIcons[slug]) || DotsIcon
  return <Icon {...props} />
}

/* ---------- Icônes intégrées sélectionnables par l'admin ---------- */

const iconByKey: Record<string, (p: IconProps) => JSX.Element> = {
  people: PeopleIcon,
  home: HomeIcon,
  food: FoodIcon,
  book: BookIcon,
  health: HealthIcon,
  bus: BusIcon,
  dots: DotsIcon,
  hand: HandIcon,
  heart: HeartIcon,
  info: InfoIcon,
  globe: GlobeIcon,
  pencil: PencilIcon,
  video: VideoIcon,
  question: QuestionIcon,
  search: SearchIcon,
  mail: MailIcon,
  shield: ShieldIcon,
  user: AdminIcon,
  settings: SettingsIcon,
  keyboard: KeyboardIcon,
  camera: CameraIcon,
}

/** Liste pour le sélecteur d'icônes de l'admin. */
export const ICON_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'people', label: 'Personnes' },
  { key: 'home', label: 'Maison' },
  { key: 'food', label: 'Aliment' },
  { key: 'book', label: 'Livre' },
  { key: 'health', label: 'Santé' },
  { key: 'bus', label: 'Bus' },
  { key: 'hand', label: 'Main' },
  { key: 'heart', label: 'Cœur' },
  { key: 'globe', label: 'Monde' },
  { key: 'pencil', label: 'Crayon' },
  { key: 'video', label: 'Vidéo' },
  { key: 'question', label: 'Question' },
  { key: 'search', label: 'Loupe' },
  { key: 'mail', label: 'Courrier' },
  { key: 'shield', label: 'Bouclier' },
  { key: 'user', label: 'Profil' },
  { key: 'keyboard', label: 'Clavier' },
  { key: 'camera', label: 'Caméra' },
  { key: 'info', label: 'Info' },
  { key: 'dots', label: 'Autres' },
]

/**
 * Affiche l'icône d'une catégorie :
 * 1. clé intégrée (`icon:people` ou `people`) → icône en trait,
 * 2. sinon valeur non vide → emoji/texte,
 * 3. sinon repli sur le slug, puis l'icône « autres ».
 */
export function CategoryGlyph({
  icon,
  slug,
  size = 40,
  className,
}: {
  icon?: string | null
  slug?: string
  size?: number
  className?: string
}) {
  if (icon) {
    const key = icon.startsWith('icon:') ? icon.slice(5) : icon
    const Icon = iconByKey[key]
    if (Icon) return <Icon width={size} height={size} className={className} />
    // Valeur libre (emoji) : on l'affiche tel quel.
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.82, lineHeight: 1 }}
        role="img"
        aria-hidden
      >
        {icon}
      </span>
    )
  }
  const Fallback = (slug && categoryIcons[slug]) || DotsIcon
  return <Fallback width={size} height={size} className={className} />
}
