'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export const dynamic = 'force-dynamic'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'EDITOR'
  twoFactorEnabled: boolean
  lockedUntil: string | null
  createdAt: string
}

interface LoginEvt {
  id: string
  email: string
  success: boolean
  reason: string | null
  ip: string | null
  createdAt: string
}

const REASONS: Record<string, string> = {
  unknown_user: 'Compte inconnu',
  bad_password: 'Mot de passe incorrect',
  locked: 'Compte verrouillé',
  '2fa_required': 'Code 2FA manquant',
  bad_2fa: 'Code 2FA incorrect',
}

export default function UtilisateursPage() {
  const { data: session } = useSession()
  const myId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN'

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrateurs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestion des comptes, double authentification et journal de connexions.
        </p>
      </div>

      <TwoFactorSection />

      {isAdmin && (
        <>
          <UsersSection myId={myId} />
          <LoginLogSection />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ma sécurité : double authentification (TOTP)                        */
/* ------------------------------------------------------------------ */

function TwoFactorSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [enroll, setEnroll] = useState<{ qrDataUrl: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'idle' | 'enrolling' | 'disabling'>('idle')

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/me/2fa-status')
    if (res.ok) {
      const data = await res.json()
      setEnabled(data.twoFactorEnabled)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function startSetup() {
    setBusy(true); setError('')
    const res = await fetch('/api/admin/2fa/setup', { method: 'POST' })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { setError(data.error || 'Erreur'); return }
    setEnroll({ qrDataUrl: data.qrDataUrl, secret: data.secret })
    setMode('enrolling')
  }

  async function confirmEnable() {
    setBusy(true); setError('')
    const res = await fetch('/api/admin/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: code }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { setError(data.error || 'Code incorrect'); return }
    setEnroll(null); setCode(''); setMode('idle'); refresh()
  }

  async function confirmDisable() {
    setBusy(true); setError('')
    const res = await fetch('/api/admin/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: code }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { setError(data.error || 'Code incorrect'); return }
    setCode(''); setMode('idle'); refresh()
  }

  function cancel() {
    setEnroll(null); setCode(''); setError(''); setMode('idle')
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-800">Ma double authentification</h2>
          <p className="text-sm text-gray-500">
            Protège ton compte avec une application d'authentification (sans email).
          </p>
        </div>
        {enabled !== null && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
              enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {enabled ? '🔒 Activée' : 'Désactivée'}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Activation : QR code + confirmation par code */}
      {mode === 'enrolling' && enroll && (
        <div className="mt-4 space-y-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            1. Scanne ce QR code avec Google Authenticator, Authy, ou similaire.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qrDataUrl} alt="QR code de configuration 2FA" className="rounded-lg border border-gray-200" width={200} height={200} />
          <p className="text-xs text-gray-500">
            Clé manuelle : <code className="rounded bg-white px-1.5 py-0.5 font-mono text-gray-700">{enroll.secret}</code>
          </p>
          <p className="text-sm text-gray-600">2. Saisis le code à 6 chiffres affiché :</p>
          <CodeInput value={code} onChange={setCode} />
          <div className="flex gap-2">
            <button onClick={confirmEnable} disabled={busy || code.length !== 6} className="btn-primary">
              {busy ? 'Vérification…' : 'Activer la 2FA'}
            </button>
            <button onClick={cancel} className="btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      {/* Désactivation : exige un code */}
      {mode === 'disabling' && (
        <div className="mt-4 space-y-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Saisis un code de ton application pour confirmer la désactivation :</p>
          <CodeInput value={code} onChange={setCode} />
          <div className="flex gap-2">
            <button onClick={confirmDisable} disabled={busy || code.length !== 6} className="btn-primary !bg-red-600 hover:!bg-red-700">
              {busy ? 'Vérification…' : 'Désactiver'}
            </button>
            <button onClick={cancel} className="btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {mode === 'idle' && enabled !== null && (
        <div className="mt-4">
          {enabled ? (
            <button onClick={() => setMode('disabling')} className="text-sm font-bold text-red-600 hover:underline">
              Désactiver la double authentification
            </button>
          ) : (
            <button onClick={startSetup} disabled={busy} className="btn-primary">
              {busy ? 'Préparation…' : 'Activer la double authentification'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Gestion des comptes administrateurs                                 */
/* ------------------------------------------------------------------ */

function UsersSection({ myId }: { myId?: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'ADMIN' })

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function create() {
    setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); return }
    setForm({ email: '', name: '', password: '', role: 'ADMIN' })
    setCreating(false)
    load()
  }

  async function patch(id: string, body: object, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    setError('')
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return }
    load()
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Supprimer définitivement le compte ${u.email} ?`)) return
    setError('')
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return }
    load()
  }

  async function resetPassword(u: AdminUser) {
    const pwd = prompt(`Nouveau mot de passe pour ${u.email} (8 caractères min.) :`)
    if (!pwd) return
    patch(u.id, { password: pwd })
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">Comptes</h2>
          <p className="text-sm text-gray-500">{users.length} compte{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-primary">
          {creating ? 'Fermer' : '+ Nouvel admin'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {creating && (
        <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="prenom@mainverte.be" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Nom</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Prénom Nom" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Mot de passe *</label>
            <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field font-mono" placeholder="8 caractères min." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Rôle</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              <option value="ADMIN">Administrateur (accès total)</option>
              <option value="EDITOR">Éditeur (contenu uniquement)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button onClick={create} className="btn-primary">Créer le compte</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="mt-4 space-y-2">
          {users.map((u) => {
            const locked = u.lockedUntil && new Date(u.lockedUntil) > new Date()
            return (
              <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    {u.name || u.email}
                    {u.id === myId && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">VOUS</span>}
                    {u.twoFactorEnabled && <span title="2FA activée" aria-label="2FA activée">🔒</span>}
                    {locked && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">VERROUILLÉ</span>}
                  </div>
                  <div className="text-xs text-gray-400">{u.name ? u.email + ' · ' : ''}{u.role === 'ADMIN' ? 'Administrateur' : 'Éditeur'}</div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm font-bold">
                  {locked && (
                    <button onClick={() => patch(u.id, { unlock: true })} className="text-orange-600 hover:underline">Déverrouiller</button>
                  )}
                  {u.id !== myId && (
                    <button
                      onClick={() => patch(u.id, { role: u.role === 'ADMIN' ? 'EDITOR' : 'ADMIN' }, `Changer le rôle de ${u.email} ?`)}
                      className="text-gray-600 hover:underline"
                    >
                      → {u.role === 'ADMIN' ? 'Éditeur' : 'Admin'}
                    </button>
                  )}
                  <button onClick={() => resetPassword(u)} className="text-green-700 hover:underline">Mot de passe</button>
                  {u.id !== myId && (
                    <button onClick={() => remove(u)} className="text-red-500 hover:underline">Supprimer</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Journal des connexions                                              */
/* ------------------------------------------------------------------ */

function LoginLogSection() {
  const [events, setEvents] = useState<LoginEvt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/login-events')
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-gray-800">Journal de connexions</h2>
      <p className="text-sm text-gray-500">100 dernières tentatives.</p>

      {loading ? (
        <div className="py-6 text-center text-gray-400">Chargement…</div>
      ) : events.length === 0 ? (
        <div className="py-6 text-center text-gray-400">Aucune connexion enregistrée.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400">
                <th className="pb-2 pr-3 font-semibold">Date</th>
                <th className="pb-2 pr-3 font-semibold">Email</th>
                <th className="pb-2 pr-3 font-semibold">Résultat</th>
                <th className="pb-2 pr-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 pr-3 whitespace-nowrap text-gray-500">
                    {new Date(e.createdAt).toLocaleString('fr-BE', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-2 pr-3 text-gray-700">{e.email}</td>
                  <td className="py-2 pr-3">
                    {e.success ? (
                      <span className="font-bold text-green-700">✓ Réussie</span>
                    ) : (
                      <span className="text-red-600">✗ {e.reason ? REASONS[e.reason] || e.reason : 'Échec'}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-gray-400">{e.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      className="input-field w-40 text-center font-mono text-lg tracking-[0.4em]"
      placeholder="000000"
      autoFocus
    />
  )
}
