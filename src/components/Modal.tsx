'use client'

import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  description?: string
  children: React.ReactNode
}

export default function Modal({ open, title, description, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity"
        role="presentation"
        onClick={onClose}
      />

      <div className="glass-panel relative w-full max-w-2xl animate-fade-in-up overflow-hidden px-8 py-8 shadow-[0_30px_90px_-40px_rgba(59,130,246,0.55)]">
        <div className="absolute inset-0 bg-grid-soft opacity-50" aria-hidden="true" />

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="pill-label text-[10px]">Konfigurasi</span>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            {description ? <p className="max-w-lg text-sm text-slate-400">{description}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="button-ghost h-10 w-10 rounded-full border-white/15 bg-white/10 p-0 text-sm font-semibold"
            aria-label="Tutup modal"
          >
            X
          </button>
        </div>

        <div className="divider-soft mt-6" />
        <div className="relative z-10 mt-6 space-y-5">{children}</div>
      </div>
    </div>
  )
}
