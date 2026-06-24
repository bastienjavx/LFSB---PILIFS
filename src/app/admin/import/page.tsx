'use client'

import { useState } from 'react'

interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([])
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  async function handleImport() {
    if (files.length === 0) return
    setLoading(true)
    setError('')
    setResult(null)

    const fileContents = await Promise.all(
      files.map(async (f) => ({ name: f.name, content: await f.text() }))
    )

    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: fileContents, publish }),
    })

    setLoading(false)

    if (!res.ok) {
      setError("Erreur lors de l'import")
      return
    }

    setResult(await res.json())
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Obsidian</h1>
        <p className="text-gray-500 mt-1">
          Importer des notes depuis un vault Obsidian (fichiers .md)
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        <p className="font-medium mb-2">💡 Format supporté</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Fichiers Markdown (.md) avec ou sans frontmatter YAML</li>
          <li>Liens internes Obsidian <code>[[Autre note]]</code> convertis automatiquement</li>
          <li>Frontmatter: <code>category:</code>, <code>description:</code></li>
        </ul>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-5">
        {/* Sélection fichiers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichiers Markdown
          </label>
          <label className="block">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
              <span className="text-3xl block mb-2" aria-hidden>📂</span>
              <p className="font-medium text-gray-600">
                {files.length > 0
                  ? `${files.length} fichier${files.length > 1 ? 's' : ''} sélectionné${files.length > 1 ? 's' : ''}`
                  : 'Sélectionner les fichiers .md'}
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".md,.markdown"
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-500 space-y-0.5">
              {files.slice(0, 5).map((f) => (
                <div key={f.name} className="flex items-center gap-2">
                  <span aria-hidden>📄</span> {f.name}
                </div>
              ))}
              {files.length > 5 && <div>... et {files.length - 5} autres</div>}
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="w-4 h-4 rounded text-green-600"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Publier immédiatement</div>
              <div className="text-xs text-gray-400">Les notes seront visibles sur le site</div>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm" role="status">
            <p className="font-semibold text-green-800 mb-2">✅ Import terminé</p>
            <ul className="space-y-1 text-green-700">
              <li>✓ {result.created} note{result.created !== 1 ? 's' : ''} créée{result.created !== 1 ? 's' : ''}</li>
              <li>✓ {result.updated} note{result.updated !== 1 ? 's' : ''} mise{result.updated !== 1 ? 's' : ''} à jour</li>
              {result.skipped > 0 && <li>⏭ {result.skipped} fichier{result.skipped !== 1 ? 's' : ''} ignoré{result.skipped !== 1 ? 's' : ''}</li>}
            </ul>
            {result.errors.length > 0 && (
              <div className="mt-3 text-red-600">
                <p className="font-medium">Erreurs:</p>
                {result.errors.map((e, i) => <p key={i} className="text-xs">{e}</p>)}
              </div>
            )}
            <a href="/admin/notes" className="text-green-700 font-medium hover:underline mt-2 inline-block">
              Voir les notes →
            </a>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={files.length === 0 || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? '⏳ Import en cours...' : `⬆️ Importer ${files.length > 0 ? files.length + ' fichier' + (files.length > 1 ? 's' : '') : ''}`}
        </button>
      </div>
    </div>
  )
}
