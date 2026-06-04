'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/[0.1]"
        style={{ background: 'rgba(15,10,40,0.95)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          {confirmVariant === 'danger' && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(239,68,68,0.18)' }}>
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="text-sm text-white/50 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-colors border border-white/[0.1] hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-lg"
            style={
              confirmVariant === 'danger'
                ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' }
                : { background: 'linear-gradient(135deg, #10b981, #06b6d4)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
