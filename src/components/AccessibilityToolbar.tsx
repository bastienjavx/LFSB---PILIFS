'use client'

import { useEffect, useState } from 'react'
import { AccessibilityIcon, HandIcon, GlobeIcon } from '@/components/icons'

type TextSize = 'small' | 'normal' | 'large' | 'xlarge'
type Contrast = 'normal' | 'dark' | 'high'

interface State {
  textSize: TextSize
  contrast: Contrast
  simple: boolean
  highlightLinks: boolean
}

const storageKey = 'pilifs-a11y'

const defaultState: State = {
  textSize: 'normal',
  contrast: 'normal',
  simple: false,
  highlightLinks: false,
}

const textSizes: TextSize[] = ['small', 'normal', 'large', 'xlarge']

export default function AccessibilityToolbar() {
  const [state, setState] = useState<State>(defaultState)
  const [open, setOpen] = useState(true)

  // Charge les préférences enregistrées
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) {
      try {
        setState({ ...defaultState, ...JSON.parse(saved) })
      } catch {
        window.localStorage.removeItem(storageKey)
      }
    }
    const handler = () => setOpen((v) => !v)
    window.addEventListener('toggle-a11y', handler)
    return () => window.removeEventListener('toggle-a11y', handler)
  }, [])

  // Applique les préférences au <html>
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-text-size', state.textSize)
    if (state.contrast === 'normal') root.removeAttribute('data-contrast')
    else root.setAttribute('data-contrast', state.contrast)
    if (state.simple) root.setAttribute('data-simple', 'true')
    else root.removeAttribute('data-simple')
    if (state.highlightLinks) root.setAttribute('data-highlight-links', 'true')
    else root.removeAttribute('data-highlight-links')
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const stepText = (dir: -1 | 1) => {
    const i = textSizes.indexOf(state.textSize)
    const next = textSizes[Math.min(textSizes.length - 1, Math.max(0, i + dir))]
    set('textSize', next)
  }

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-2 sm:px-4 sm:pb-4">
      <aside
        className="a11y-bar pointer-events-auto"
        aria-label="Options d'accessibilité"
      >
        {/* Intitulé */}
        <div className="flex items-center gap-2 pr-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-700)]">
            <AccessibilityIcon width={24} height={24} />
          </span>
          <span className="text-sm font-extrabold leading-tight text-[var(--ink)]">
            Rendre le site
            <br />
            accessible
          </span>
        </div>

        {/* Taille du texte */}
        <div className="a11y-group">
          <span className="a11y-group__label">Taille du texte</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="a11y-btn"
              onClick={() => stepText(-1)}
              aria-label="Réduire la taille du texte"
            >
              A<span className="text-xs">−</span>
            </button>
            <button
              type="button"
              className="a11y-btn"
              data-active={state.textSize === 'normal'}
              onClick={() => set('textSize', 'normal')}
              aria-label="Taille du texte normale"
            >
              A
            </button>
            <button
              type="button"
              className="a11y-btn"
              onClick={() => stepText(1)}
              aria-label="Agrandir la taille du texte"
            >
              A<span className="text-xs">+</span>
            </button>
          </div>
        </div>

        {/* Contraste */}
        <div className="a11y-group">
          <span className="a11y-group__label">Contraste</span>
          <div className="flex items-center gap-1.5">
            {(
              [
                ['normal', 'Normal', 'conic-gradient(#fff 0 100%)', '#0f172a'],
                ['dark', 'Sombre', 'conic-gradient(#0f172a 0 50%, #fff 50% 100%)', '#0f172a'],
                ['high', 'Élevé', 'conic-gradient(#ffeb00 0 50%, #000 50% 100%)', '#000'],
              ] as const
            ).map(([value, label, bg, ring]) => (
              <button
                key={value}
                type="button"
                onClick={() => set('contrast', value)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition focus:outline-none"
                style={{
                  borderColor: state.contrast === value ? 'var(--brand-700)' : 'var(--border-strong)',
                  boxShadow: state.contrast === value ? `0 0 0 2px ${ring}22` : 'none',
                }}
                aria-pressed={state.contrast === value}
                aria-label={`Contraste ${label}`}
              >
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-black/10"
                  style={{ background: bg }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Mode simple */}
        <div className="a11y-group">
          <span className="a11y-group__label">Mode simple</span>
          <button
            type="button"
            className="a11y-toggle"
            aria-pressed={state.simple}
            onClick={() => set('simple', !state.simple)}
            aria-label="Activer le mode simple"
          >
            <span className="a11y-toggle__knob" />
          </button>
        </div>

        {/* Surligner les liens */}
        <div className="a11y-group">
          <span className="a11y-group__label">Surligner les liens</span>
          <button
            type="button"
            className="a11y-toggle"
            aria-pressed={state.highlightLinks}
            onClick={() => set('highlightLinks', !state.highlightLinks)}
            aria-label="Surligner tous les liens"
          >
            <span className="a11y-toggle__knob" />
          </button>
        </div>

        {/* Langue des signes */}
        <div className="a11y-group">
          <span className="a11y-group__label">Langue des signes</span>
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[var(--border)] px-3 text-sm font-bold text-[var(--ink)]">
            <HandIcon width={18} height={18} className="text-[var(--brand-700)]" />
            LFSB
          </span>
        </div>

        {/* Langue du site */}
        <div className="a11y-group">
          <span className="a11y-group__label">Langue du site</span>
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[var(--border)] px-3 text-sm font-bold text-[var(--ink)]">
            <GlobeIcon width={18} height={18} className="text-[var(--muted)]" />
            Français
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-alt)] focus:outline-none"
          aria-label="Fermer la barre d'accessibilité"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </aside>
    </div>
  )
}
