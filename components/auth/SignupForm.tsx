'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateSignupPasswords } from '@/lib/auth-validation'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const passwordError = validateSignupPasswords(password, confirmPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-lg text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent transition-all border border-white/[0.12]'

  const inputStyle = { background: 'rgba(255,255,255,0.08)' }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(16,185,129,0.2)' }}>
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Check your email</h3>
        <p className="text-sm text-white/50">
          We sent a confirmation link to <strong className="text-white/70">{email}</strong>. Click it to activate your account.
        </p>
      </div>
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
        <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          autoComplete="new-password"
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
            Creating account...
          </span>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  )
}
