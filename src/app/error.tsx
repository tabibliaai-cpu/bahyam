'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(239,68,68,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ color: '#94A3B8', marginBottom: 24, lineHeight: 1.6 }}>
          PulseAPI encountered an unexpected error. This is usually temporary.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: '#3B82F6',
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <a href="/" style={{
          display: 'block',
          marginTop: 16,
          color: '#94A3B8',
          fontSize: 14,
          textDecoration: 'none',
        }}>
          Go to Homepage
        </a>
      </div>
    </div>
  );
}
