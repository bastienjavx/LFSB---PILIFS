'use client'

import { useEffect, useState } from 'react'

type Setting = 'contrast' | 'largeText' | 'reading' | 'spacing'

const settings: Array<{
  key: Setting
  label: string
  icon: string
  attribute: string
}> = [
  { key: 'contrast', label: 'Contraste', icon: '◐', attribute: 'data-high-contrast' },
  { key: 'largeText', label: 'Grand texte', icon: 'A+', attribute: 'data-large-text' },
  { key: 'spacing', label: 'Espacé', icon: '↔', attribute: 'data-wide-spacing' },
  { key: 'reading', label: 'Facile', icon: '✓', attribute: 'data-easy-reading' },
]

const storageKey = 'pilifs-accessibility'

export default function AccessibilityToolbar() {
  const [active, setActive] = useState<Record<Setting, boolean>>({
    contrast: false,
    largeText: false,
    reading: false,
    spacing: false,
  })

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return

    try {
      setActive(JSON.parse(saved))
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    settings.forEach((setting) => {
      if (active[setting.key]) {
        root.setAttribute(setting.attribute, 'true')
      } else {
        root.removeAttribute(setting.attribute)
      }
    })
    window.localStorage.setItem(storageKey, JSON.stringify(active))
  }, [active])

  return (
    <aside className="accessibility-toolbar" aria-label="Options d'accessibilité">
      {settings.map((setting) => (
        <button
          key={setting.key}
          type="button"
          className="accessibility-toggle"
          aria-pressed={active[setting.key]}
          onClick={() =>
            setActive((current) => ({
              ...current,
              [setting.key]: !current[setting.key],
            }))
          }
        >
          <span className="accessibility-toggle__icon" aria-hidden>
            {setting.icon}
          </span>
          <span>{setting.label}</span>
        </button>
      ))}
    </aside>
  )
}
