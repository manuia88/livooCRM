'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Algo sali&oacute; mal
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
