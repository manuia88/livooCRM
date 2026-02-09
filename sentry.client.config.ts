import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing
  tracesSampleRate: 1.0,

  // Session Replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filter out noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
  ],

  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message: string }).message
        if (message.includes('ResizeObserver')) {
          return null
        }
      }
    }

    return event
  },
})
