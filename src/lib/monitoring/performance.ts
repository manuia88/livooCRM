import * as Sentry from '@sentry/nextjs'

/**
 * Hook para tracking de performance de componentes React.
 * Observa entradas de PerformanceObserver y reporta renders lentos a Sentry.
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          Sentry.captureMessage(`Slow render: ${componentName}`, {
            level: 'info',
            contexts: {
              performance: {
                component: componentName,
                duration: entry.duration,
                type: entry.entryType,
              },
            },
          })
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    return () => observer.disconnect()
  }
}
