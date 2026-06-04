import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="text-white/50 mt-2">Get started with Task Manager</p>
      </div>
      <div className="rounded-2xl p-8 border border-white/[0.12]"
        style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <SignupForm />
        <p className="text-center text-sm text-white/50 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
