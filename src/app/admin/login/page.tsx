'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [show2fa, setShow2fa] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      token,
      redirect: false,
    })

    setLoading(false)

    if (res?.ok) {
      router.push(callbackUrl)
      return
    }

    // NextAuth renvoie le message d'erreur métier dans res.error.
    const message = res?.error || 'Email ou mot de passe incorrect'
    if (message.includes('2FA')) {
      setShow2fa(true)
    }
    setError(message)
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/main-verte-logo.svg"
            alt=""
            className="mx-auto mb-3"
            style={{ height: 92, width: 'auto' }}
            aria-hidden
          />
          <h1 className="text-2xl font-bold text-green-800">Main Verte</h1>
          <p className="text-gray-500 text-sm mt-1">Panneau d'administration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Connexion</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="input-field"
              placeholder="admin@mainverte.be"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input-field"
            />
          </div>

          {show2fa && (
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Code de double authentification
              </label>
              <input
                id="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                className="input-field tracking-[0.4em] text-center font-mono text-lg"
                placeholder="000000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Saisis le code à 6 chiffres de ton application d'authentification.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-400">
          <a href="/" className="hover:text-green-700">← Retour au site</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
