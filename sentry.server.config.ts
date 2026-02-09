import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
