'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
    return () => {
      html.style.overflow = 'hidden'
      html.style.height = '100dvh'
      body.style.overflow = 'hidden'
      body.style.height = '100dvh'
    }
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg, #08090E)', color: 'var(--color-text-primary, #F8FAFC)' }}
    >
      <div className="text-center">
        <div
          className="text-7xl font-black mb-4"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary, #F8FAFC)' }}
        >
          Page not found
        </h1>
        <p
          className="text-sm mb-8 max-w-xs mx-auto"
          style={{ color: 'var(--color-text-secondary, #94A3B8)' }}
        >
          This page doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              border: '1px solid var(--color-border, #1F2130)',
              background: 'transparent',
              color: 'var(--color-text-secondary, #94A3B8)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
