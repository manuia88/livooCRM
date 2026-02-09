# Testing Guide - livooCRM

## Stack
- **Vitest** - Test runner (fast, Vite-native)
- **Testing Library** - Component & hook testing
- **jsdom** - Browser environment simulation
- **MSW-compatible** - API mocking via Supabase client mocks

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Interactive UI
npm run test:ui

# With coverage report
npm run test:coverage

# Legacy Jest tests (security tests)
npm run test:jest

# E2E tests (Playwright)
npm run test:e2e
```

## Project Structure

```
src/
├── test/                          # Test infrastructure
│   ├── setup.ts                   # Global test setup (mocks, cleanup)
│   ├── test-utils.tsx             # Custom render with providers
│   └── mockData/                  # Shared mock data
│       ├── index.ts
│       ├── properties.ts
│       ├── contacts.ts
│       ├── tasks.ts
│       └── users.ts
├── hooks/
│   └── __tests__/                 # Hook tests
│       ├── useDebounce.test.ts
│       ├── useCurrentUser.test.ts
│       ├── useProperties.test.ts
│       ├── useContacts.test.ts
│       └── useTasks.test.ts
├── lib/
│   ├── __tests__/                 # Utility tests
│   │   ├── utils.test.ts
│   │   └── valuation.test.ts
│   └── validations/
│       └── __tests__/             # Validation schema tests
│           ├── auth.test.ts
│           └── property.test.ts
└── components/
    └── __tests__/                 # Component tests
        ├── PropertyCard.test.tsx
        └── PropertyHealthScore.test.tsx
```

## Coverage Targets

| Area | Target | Notes |
|------|--------|-------|
| Hooks | >90% | React Query hooks, custom hooks |
| Utilities | >80% | formatters, validators, valuation |
| Components | >70% | Critical UI components |

## Testing Patterns

### Mocking Supabase Client

Use `vi.hoisted()` to declare mock variables before `vi.mock()` hoisting:

```typescript
const { mockFrom } = vi.hoisted(() => {
  return { mockFrom: vi.fn() }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: vi.fn() },
  }),
}))
```

### Chainable Supabase Mock Builder

```typescript
function createChainableMock(resolveValue: any) {
  const chain: any = {}
  const methods = ['select', 'eq', 'neq', 'gte', 'lte', 'in', 'or', 'order', 'range', 'single']
  methods.forEach(method => {
    chain[method] = vi.fn().mockReturnValue(chain)
  })
  chain.range.mockResolvedValue(resolveValue)
  chain.single.mockResolvedValue(resolveValue)
  chain.order.mockReturnValue(chain)
  return chain
}
```

### Testing React Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/test/test-utils'

const wrapper = createQueryWrapper()

const { result } = renderHook(() => useMyHook(), { wrapper })

await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data).toBeDefined()
```

### Testing Components

```typescript
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
render(<MyComponent />)

await user.click(screen.getByRole('button'))
expect(screen.getByText('Result')).toBeInTheDocument()
```

### Testing Zod Schemas

```typescript
const result = mySchema.safeParse(invalidData)
expect(result.success).toBe(false)
if (!result.success) {
  expect(result.error.issues[0].message).toContain('expected message')
}
```

## Key Notes

- Use `createQueryWrapper()` for fresh QueryClient per test group
- Use `vi.clearAllMocks()` in `beforeEach` to reset mock state
- Async hooks need `await waitFor()` for state assertions
- Component tests mock child dependencies (icons, UI primitives)
- Supabase client is always mocked - no real API calls in tests
