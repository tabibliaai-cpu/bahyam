'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Home } from 'lucide-react'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const router = useRouter()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#08090E', color: '#F8FAFC' }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.1)' }}
        >
          <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer mx-auto"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  )
}
