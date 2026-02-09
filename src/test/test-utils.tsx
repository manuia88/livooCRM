import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Creates a QueryClient configured for tests (no retry, no cache)
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

/**
 * Render with QueryClientProvider wrapper for testing hooks and components
 * that depend on React Query.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    user: userEvent.setup(),
  }
}

/**
 * Creates a wrapper component for testing hooks with renderHook
 */
export function createQueryWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient()
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    )
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent }
export { renderWithProviders as render }
