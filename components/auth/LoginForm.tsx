'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-lg text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent transition-all border border-white/[0.12]'

  const inputStyle = { background: 'rgba(255,255,255,0.08)' }

  if (resetSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(16,185,129,0.2)' }}>
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Check your email</h3>
        <p className="text-sm text-white/50 mb-4">
          We sent a password reset link to <strong className="text-white/70">{email}</strong>.
        </p>
        <button
          onClick={() => { setResetMode(false); setResetSent(false) }}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  if (resetMode) {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <p className="text-sm text-white/50">Enter your email and we&apos;ll send you a reset link.</p>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-300 rounded-lg px-3 py-2 border border-rose-500/30"
            style={{ background: 'rgba(239,68,68,0.12)' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setResetMode(false); setError(null) }}
          className="w-full text-sm text-white/40 hover:text-white/60"
        >
          Back to sign in
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-white/70">Password</label>
          <button
            type="button"
            onClick={() => { setResetMode(true); setError(null) }}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-300 rounded-lg px-3 py-2 border border-rose-500/30"
          style={{ background: 'rgba(239,68,68,0.12)' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg"
        style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}
