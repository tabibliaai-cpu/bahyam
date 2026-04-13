'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0F1E',
      color: '#F1F5F9',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          404
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: '#94A3B8', marginBottom: 24, lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#3B82F6',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
