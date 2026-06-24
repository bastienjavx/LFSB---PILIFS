'use client'

import { useState, useEffect, useCallback } from 'react'

interface Media {
  id: string
  filename: string
  url: string
  type: string
  mimeType: string
  size: number
  alt: string
  createdAt: string
  note?: { id: string; title: string; slug: string } | null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  const load = useCallback(async () => {
    const res = await fetch('/api/media')
    if (res.ok) setMedia(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpload(files: FileList | null) {
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      await fetch('/api/upload', { method: 'POST', body: form })
    }
    await load()
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
    if (res.ok) { setMedia((m) => m.filter((f) => f.id !== id)); setSelected(null) }
  }

  const filtered = filter ? media.filter((m) => m.type === filter) : media
  const selectedMedia = media.find((m) => m.id === selected)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-500 text-sm mt-1">{media.length} fichier{media.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Zone upload */}
      <label className="block">
        <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-green-50'}`}>
          <span className="text-4xl block mb-2" aria-hidden>⬆️</span>
          <p className="font-medium text-gray-600">
            {uploading ? 'Upload en cours...' : 'Glisser des fichiers ou cliquer pour uploader'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Images (JPG, PNG, GIF, WebP), Vidéos (MP4, WebM)</p>
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

      {/* Filtres */}
      <div className="flex gap-2">
        {['', 'IMAGE', 'VIDEO', 'GIF'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t === '' ? 'Tout' : t === 'IMAGE' ? '🖼️ Images' : t === 'VIDEO' ? '🎬 Vidéos' : '🎞️ GIFs'}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Grille */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3" aria-hidden>🖼️</span>
              <p>Aucun média</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id === selected ? null : m.id)}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                    selected === m.id ? 'border-green-500 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                  aria-label={m.filename}
                  aria-pressed={selected === m.id}
                >
                  {m.type === 'VIDEO' ? (
                    <video
                      src={m.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={m.url} alt={m.alt || m.filename} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{m.filename}</p>
                  </div>
                  {m.type === 'VIDEO' && (
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      ▶
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détail du média sélectionné */}
        {selectedMedia && (
          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 shrink-0 self-start sticky top-20">
            {selectedMedia.type === 'VIDEO' ? (
              <video src={selectedMedia.url} controls className="w-full rounded-lg" />
            ) : (
              <img src={selectedMedia.url} alt={selectedMedia.alt || selectedMedia.filename} className="w-full rounded-lg" />
            )}
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-800 break-all">{selectedMedia.filename}</p>
              <p className="text-gray-400">{selectedMedia.type} · {formatSize(selectedMedia.size)}</p>
              {selectedMedia.note && (
                <p className="text-gray-500">
                  Lié à:{' '}
                  <a href={`/admin/notes/${selectedMedia.note.id}`} className="text-green-700 hover:underline">
                    {selectedMedia.note.title}
                  </a>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">URL</label>
                <input
                  readOnly
                  value={selectedMedia.url}
                  className="input-field text-xs"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
              <button
                onClick={() => handleDelete(selectedMedia.id)}
                className="btn-danger w-full text-sm"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
