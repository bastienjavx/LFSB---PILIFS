'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
}

interface Media {
  id: string
  url: string
  type: string
  alt: string
  filename: string
  mimeType: string
}

interface Note {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  published: boolean
  type: string
  categoryId: string | null
  media: Media[]
}

interface Props {
  categories: Category[]
  initialNote?: Note
  initialType?: string
}

export default function NoteEditor({ categories, initialNote, initialType = 'SIGN' }: Props) {
  const router = useRouter()
  const isEdit = !!initialNote

  const [title, setTitle] = useState(initialNote?.title || '')
  const [slug, setSlug] = useState(initialNote?.slug || '')
  const [content, setContent] = useState(initialNote?.content || '')
  const [excerpt, setExcerpt] = useState(initialNote?.excerpt || '')
  const [type, setType] = useState(initialNote?.type || initialType)
  const [categoryId, setCategoryId] = useState(initialNote?.categoryId || '')
  const [published, setPublished] = useState(initialNote?.published || false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [media, setMedia] = useState<Media[]>(initialNote?.media || [])
  const [uploading, setUploading] = useState(false)
  const [slugManual, setSlugManual] = useState(isEdit)

  function autoSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManual) setSlug(autoSlug(val))
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: Media[] = []

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      if (initialNote?.id) form.append('noteId', initialNote.id)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (res.ok) {
        const data = await res.json()
        uploaded.push(data.media)
      }
    }

    setMedia((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  async function handleDeleteMedia(mediaId: string) {
    const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
    if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== mediaId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      title,
      slug,
      content,
      excerpt,
      type,
      categoryId: categoryId || null,
      published,
      mediaIds: media.map((m) => m.id),
    }

    const res = await fetch(isEdit ? `/api/notes/${initialNote.id}` : '/api/notes', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Erreur lors de la sauvegarde')
      return
    }

    const note = await res.json()
    router.push(`/admin/notes/${note.id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette note définitivement ?')) return
    const res = await fetch(`/api/notes/${initialNote!.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/notes')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Titre + Slug */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="input-field text-lg font-medium"
            placeholder="Nom du signe ou de la page..."
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <span className="text-gray-400 text-sm flex items-center">/signes/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
              className="input-field font-mono text-sm"
              placeholder="mon-signe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
            Description courte
          </label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="input-field"
            placeholder="Brève description..."
          />
        </div>
      </div>

      {/* Type + Catégorie + Publié */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="input-field">
            <option value="SIGN">👐 Signe LFSB</option>
            <option value="INFORMATION">📖 Information</option>
            <option value="PAGE">📄 Page</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
            <option value="">Aucune</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-5 h-5 rounded text-green-600"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Publier</div>
              <div className="text-xs text-gray-400">Visible sur le site</div>
            </div>
          </label>
        </div>
      </div>

      {/* Médias */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800">Médias (vidéos, images)</h3>

        {/* Upload zone */}
        <label className="block">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
            <span className="text-3xl block mb-2" aria-hidden>⬆️</span>
            <p className="text-sm text-gray-500">
              {uploading ? 'Upload en cours...' : 'Glisser des fichiers ou cliquer pour uploader'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Vidéo MP4, Image JPG/PNG/GIF</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>

        {/* Media grid */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {media.map((m) => (
              <div key={m.id} className="relative group">
                {m.type === 'VIDEO' ? (
                  <video
                    src={m.url}
                    className="w-full aspect-square object-cover rounded-lg"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={m.alt || m.filename}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(m.id)}
                    className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700"
                    aria-label={`Supprimer ${m.filename}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-gray-400 truncate mt-1 text-center">{m.filename}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenu markdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Contenu (Markdown / Obsidian)</h3>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-sm text-green-700 hover:underline"
          >
            {preview ? '✏️ Éditer' : '👁 Aperçu'}
          </button>
        </div>

        {preview ? (
          <div className="p-5 prose prose-green max-w-none min-h-[200px]">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
            ) : (
              <p className="text-gray-400 italic">Aucun contenu.</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-5 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[300px]"
            placeholder={`# Titre\n\nContenu en Markdown...\n\nSupport des liens Obsidian: [[Autre signe]]`}
            spellCheck={false}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? '⏳ Sauvegarde...' : (isEdit ? '💾 Enregistrer' : '✅ Créer')}
          </button>
          <a href="/admin/notes" className="btn-secondary">Annuler</a>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger flex items-center gap-2"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>
    </form>
  )
}
