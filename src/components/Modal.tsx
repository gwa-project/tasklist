'use client'

import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur" onClick={onClose} />

      <div className="card relative z-10 w-full max-w-xl border-white/5 bg-slate-900/80 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id="modal-title" className="text-2xl font-semibold text-white">
              {title}
            </h2>
            {description ? <p className="mt-2 text-sm text-slate-300/80">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button-soft h-12 w-12 rounded-full p-0 text-slate-200 hover:text-white"
            aria-label="Tutup modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </div>
  )
}
