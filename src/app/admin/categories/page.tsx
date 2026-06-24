'use client'

import { useState, useEffect, useCallback } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  order: number
  _count?: { notes: number }
}

const COLORS = ['#15803d', '#16a34a', '#dc2626', '#92400e', '#7c3aed', '#0284c7', '#d97706', '#db2777', '#0891b2']

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', icon: '', color: COLORS[0] })

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
    if (res.ok) { setEditing(null); setCreating(false); setForm({ name: '', slug: '', icon: '', color: COLORS[0] }); load() }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ?\nLes notes ne seront pas supprimées.`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setCreating(false)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', color: cat.color })
  }

  function startCreate() {
    setCreating(true)
    setEditing('new')
    setForm({ name: '', slug: '', icon: '', color: COLORS[0] })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2">
          <span aria-hidden>➕</span> Nouvelle
        </button>
      </div>

      {/* Formulaire création */}
      {creating && (
        <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-green-200">
          <h2 className="font-semibold text-gray-800 mb-4">Nouvelle catégorie</h2>
          <CategoryForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={() => { setCreating(false); setEditing(null) }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id}>
              {editing === cat.id ? (
                <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-green-200">
                  <CategoryForm
                    form={form}
                    setForm={setForm}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                    isEdit
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}
                    aria-hidden
                  >
                    {cat.icon || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-400">/{cat.slug} · {cat._count?.notes || 0} note{(cat._count?.notes || 0) !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-sm text-green-700 hover:underline"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && !creating && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <p>Aucune catégorie.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryForm({
  form,
  setForm,
  onSave,
  onCancel,
  isEdit = false,
}: {
  form: { name: string; slug: string; icon: string; color: string }
  setForm: (f: { name: string; slug: string; icon: string; color: string }) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}) {
  function handleName(val: string) {
    setForm({
      ...form,
      name: val,
      slug: isEdit ? form.slug : val.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    })
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleName(e.target.value)}
          className="input-field"
          placeholder="Animaux"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="input-field font-mono text-sm"
          placeholder="animaux"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icône (emoji)</label>
        <input
          type="text"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="input-field"
          placeholder="🐄"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'scale-125 border-gray-400' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
              aria-pressed={form.color === c}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200"
            aria-label="Couleur personnalisée"
          />
        </div>
      </div>
      <div className="sm:col-span-2 flex gap-3">
        <button type="button" onClick={onSave} className="btn-primary">
          {isEdit ? '💾 Enregistrer' : '✅ Créer'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}
