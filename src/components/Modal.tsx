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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-xl border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button-ghost h-10 w-10 rounded-full border border-transparent bg-slate-800/70 p-0 text-slate-300 hover:text-white"
            aria-label="Tutup modal"
          >
            ×
          </button>
        </div>
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}