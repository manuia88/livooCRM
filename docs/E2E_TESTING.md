# E2E Testing Guide

## Stack

- **Playwright 1.58+** - Multi-browser E2E testing framework
- **TypeScript** - Type-safe test code
- **Page Object Model (POM)** - Maintainable, reusable test structure

## Quick Start

```bash
# Run all tests (all browsers)
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run only Chrome
npm run test:e2e:chrome

# Run only Firefox
npm run test:e2e:firefox

# Run only Safari/WebKit
npm run test:e2e:webkit

# View HTML report
npm run test:e2e:report

# Generate tests with codegen
npm run test:e2e:codegen
```

## Project Structure

```
e2e/
├── .auth/               # Stored auth state (gitignored)
│   └── user.json
├── fixtures/            # Test data (images, etc.)
│   ├── test-image-1.jpg
│   └── test-image-2.jpg
├── pages/               # Page Object Models
│   ├── LoginPage.ts
│   ├── PropertyFormPage.ts
│   ├── ContactsPage.ts
│   ├── TasksPage.ts
│   └── PropertySearchPage.ts
├── auth.setup.ts        # Auth setup (runs before all tests)
├── auth.spec.ts         # Authentication flow tests
├── properties.spec.ts   # Property wizard + listing tests
├── contacts.spec.ts     # Contact/lead management tests
├── tasks.spec.ts        # Task management tests
├── public-search.spec.ts # Public property search tests
├── analytics.spec.ts    # Analytics dashboard tests
├── mls.spec.ts          # MLS sharing tests
├── whatsapp.spec.ts     # WhatsApp inbox tests
└── example.spec.ts      # Basic smoke test
```

## Test Coverage

| Flow | Tests | File |
|------|-------|------|
| Authentication | 8 | `auth.spec.ts` |
| Property Wizard | 5 | `properties.spec.ts` |
| Property Listing | 3 | `properties.spec.ts` |
| Contacts/Leads | 10 | `contacts.spec.ts` |
| Tasks | 11 | `tasks.spec.ts` |
| Public Search | 11 | `public-search.spec.ts` |
| Analytics | 3 | `analytics.spec.ts` |
| MLS | 5 | `mls.spec.ts` |
| WhatsApp Inbox | 1 | `whatsapp.spec.ts` |

**Total: 57+ test scenarios across 5 browsers**

## Browser Matrix

| Browser | Project Name | Device |
|---------|-------------|--------|
| Chrome | `chromium` | Desktop Chrome |
| Firefox | `firefox` | Desktop Firefox |
| Safari | `webkit` | Desktop Safari |
| Mobile Chrome | `Mobile Chrome` | Pixel 5 |
| Mobile Safari | `Mobile Safari` | iPhone 12 |

## Page Object Pattern

Tests use the Page Object Model pattern for maintainability:

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class MyPage {
  readonly page: Page
  readonly myButton: Locator

  constructor(page: Page) {
    this.page = page
    this.myButton = page.getByRole('button', { name: 'Click me' })
  }

  async goto() {
    await this.page.goto('/my-page')
  }

  async clickButton() {
    await this.myButton.click()
  }
}
```

## Authentication

Tests use a shared auth setup that runs once before all browser projects:

1. `auth.setup.ts` logs in and saves session state to `e2e/.auth/user.json`
2. All test projects load this stored state via `storageState`
3. Public tests (like `public-search.spec.ts`) override with empty state

## Environment Variables

Create `.env.test` in the project root:

```bash
TEST_USER_EMAIL=test@livoo.mx
TEST_USER_PASSWORD=TestPassword123!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Debugging

```bash
# Debug mode with step-through
npx playwright test --debug

# Debug a specific test file
npx playwright test e2e/auth.spec.ts --debug

# Run with trace viewer
npx playwright test --trace on

# View traces from failed tests
npx playwright show-trace test-results/*/trace.zip
```

## CI/CD

Tests run automatically via GitHub Actions on:
- Push to `main` or `develop`
- Pull requests targeting `main`

Artifacts uploaded:
- `playwright-report/` - HTML report (30-day retention)
- `test-results/` - JSON/JUnit results + screenshots/videos

## Best Practices

1. **Use semantic locators**: Prefer `getByRole`, `getByText`, `getByPlaceholder` over CSS selectors
2. **Wait for network**: Use `page.waitForLoadState('networkidle')` after navigation
3. **Explicit assertions**: Use `await expect(element).toBeVisible()` instead of truthy checks
4. **Test isolation**: Each test should be independent and not depend on other tests' side effects
5. **Conditional checks**: Use `if (await element.count() > 0)` when elements may not exist
6. **Timeouts**: Use explicit timeouts for slow operations: `{ timeout: 15000 }`
