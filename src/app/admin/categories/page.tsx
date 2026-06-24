'use client'

import { useState, useEffect, useCallback } from 'react'
import { ICON_OPTIONS, CategoryGlyph } from '@/components/icons'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  order: number
  _count?: { notes: number }
}

const COLORS = ['#2563eb', '#1e3a8a', '#0d9488', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#d97706', '#92400e', '#0f172a']

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

type Form = { name: string; slug: string; icon: string; color: string }
const emptyForm: Form = { name: '', slug: '', icon: 'icon:people', color: COLORS[0] }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Form>(emptyForm)

  const load = useCallback(async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    if (!form.name) return
    const isEdit = editing && editing !== 'new'
    const res = await fetch(isEdit ? `/api/categories/${editing}` : '/api/categories', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { setEditing(null); setCreating(false); setForm(emptyForm); load() }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ?\nLes notes ne seront pas supprimées.`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setCreating(false)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || 'icon:dots', color: cat.color })
  }

  function startCreate() {
    setCreating(true)
    setEditing('new')
    setForm(emptyForm)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} · personnalisation complète (icône, couleur)
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary">+ Nouvelle catégorie</button>
      </div>

      {creating && (
        <div className="rounded-2xl border-2 border-green-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Nouvelle catégorie</h2>
          <CategoryForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null) }} />
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id}>
              {editing === cat.id ? (
                <div className="rounded-2xl border-2 border-green-200 bg-white p-5 shadow-sm">
                  <CategoryForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setEditing(null)} isEdit />
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: cat.color + '1a', color: cat.color }}
                    aria-hidden
                  >
                    <CategoryGlyph icon={cat.icon} slug={cat.slug} size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-400">/{cat.slug} · {cat._count?.notes || 0} note{(cat._count?.notes || 0) !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button onClick={() => startEdit(cat)} className="text-sm font-bold text-green-700 hover:underline">Éditer</button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-sm font-bold text-red-500 hover:underline">Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && !creating && (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400">Aucune catégorie.</div>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryForm({
  form, setForm, onSave, onCancel, isEdit = false,
}: {
  form: Form
  setForm: (f: Form) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}) {
  const isEmoji = !form.icon.startsWith('icon:')

  function handleName(val: string) {
    setForm({ ...form, name: val, slug: isEdit ? form.slug : slugify(val) })
  }

  return (
    <div className="space-y-5">
      {/* Aperçu en direct */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: form.color + '1a', color: form.color }}>
          <CategoryGlyph icon={form.icon} slug={form.slug} size={26} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800">{form.name || 'Aperçu'}</div>
          <div className="text-xs text-gray-400">/{form.slug || 'slug'}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Nom *</label>
          <input type="text" value={form.name} onChange={(e) => handleName(e.target.value)} className="input-field" placeholder="Animaux" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Slug (URL)</label>
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field font-mono text-sm" placeholder="animaux" />
        </div>
      </div>

      {/* Sélecteur d'icônes intégrées */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Icône</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((opt) => {
            const key = `icon:${opt.key}`
            const active = form.icon === key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm({ ...form, icon: key })}
                title={opt.label}
                aria-pressed={active}
                aria-label={opt.label}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 transition"
                style={{
                  borderColor: active ? form.color : '#e5e7eb',
                  background: active ? form.color + '14' : '#fff',
                  color: active ? form.color : '#475569',
                }}
              >
                <CategoryGlyph icon={key} size={24} />
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">ou un emoji :</span>
          <input
            type="text"
            value={isEmoji ? form.icon : ''}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="input-field w-24 text-center"
            placeholder="🐄"
            maxLength={4}
          />
        </div>
      </div>

      {/* Couleur */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Couleur</label>
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`h-8 w-8 rounded-full border-2 transition-all ${form.color === c ? 'scale-110 border-gray-700' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
              aria-pressed={form.color === c}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-gray-200"
            aria-label="Couleur personnalisée"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onSave} className="btn-primary">{isEdit ? 'Enregistrer' : 'Créer'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}
