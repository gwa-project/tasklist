'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal')
      }

      // Redirect to dashboard
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Enhanced background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-soft opacity-25" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-400/40 bg-indigo-500/10 px-6 py-3 backdrop-blur-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
              </span>
              <span className="text-xl font-bold text-white">Project Tasklist</span>
            </div>
            <h2 className="mt-8 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-4xl font-bold text-transparent">
              Selamat Datang Kembali
            </h2>
            <p className="mt-3 text-slate-300">
              Login untuk mengelola project dan task Anda
            </p>
          </div>

          {/* Login Form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.7)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10">
                  {isLoading ? 'Memproses...' : 'Login'}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-300">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Dengan melanjutkan, Anda setuju dengan{' '}
            <a href="#" className="text-indigo-300 hover:text-indigo-200">
              Syarat & Ketentuan
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
