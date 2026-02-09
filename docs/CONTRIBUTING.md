# Guia de Contribucion

## Codigo de Conducta

- Ser respetuoso y profesional
- Aceptar criticas constructivas
- Enfocarse en lo mejor para el proyecto
- Mostrar empatia hacia otros contribuidores

## Getting Started

### 1. Fork y Clone

```bash
# Fork en GitHub, luego clone tu fork:
git clone https://github.com/TU-USUARIO/livoocrmag.git
cd livoocrmag
```

### 2. Setup

```bash
npm install
cp .env.example .env.local
# Configurar .env.local con credenciales de Supabase
npm run dev
```

### 3. Crear Branch

```bash
# Para nuevas funcionalidades
git checkout -b feature/nueva-funcionalidad

# Para correcciones
git checkout -b fix/correccion-bug

# Para documentacion
git checkout -b docs/actualizar-readme
```

## Convenciones

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add property export to Excel"

# Fixes
git commit -m "fix: resolve timezone issue in calendar"

# Docs
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve property search performance"

# Tests
git commit -m "test: add unit tests for useProperties hook"

# Chore
git commit -m "chore: update dependencies"
```

**Prefijos:**

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Correccion de bug |
| `docs:` | Cambios en documentacion |
| `style:` | Formato, sin cambios de codigo |
| `refactor:` | Refactorizacion sin cambios funcionales |
| `test:` | Agregar o modificar tests |
| `chore:` | Tareas de mantenimiento |
| `perf:` | Mejoras de performance |

### Codigo TypeScript

```typescript
// BUENO: Types explicitos, nombres descriptivos
interface PropertySearchParams {
  query: string
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  city?: string
}

async function searchProperties(
  params: PropertySearchParams
): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .ilike('title', `%${params.query}%`)

  if (error) throw error
  return data
}

// MALO: Any types, nombres crípticos
async function search(p: any): Promise<any> {
  return await supabase.from('properties').select('*')
}
```

### Componentes React

```tsx
// BUENO: Props tipadas, componente funcional
interface PropertyCardProps {
  property: Property
  onSelect?: (id: string) => void
  variant?: 'compact' | 'detailed'
}

export function PropertyCard({
  property,
  onSelect,
  variant = 'compact'
}: PropertyCardProps) {
  return (
    <div
      onClick={() => onSelect?.(property.id)}
      className={cn('rounded-lg border p-4', {
        'p-2': variant === 'compact',
        'p-6': variant === 'detailed'
      })}
    >
      <h3>{property.title}</h3>
      <p>{formatCurrency(property.price)}</p>
    </div>
  )
}

// MALO: Sin types, logica mezclada
export function PropertyCard(props: any) {
  return <div onClick={props.onClick}>{props.title}</div>
}
```

### Custom Hooks

```typescript
// BUENO: Prefijo 'use', return tipado, usa React Query
export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// BUENO: Mutation con invalidation
export function useCreateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePropertyInput) =>
      fetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })
}
```

### API Routes

```typescript
// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerAdmin } from '@/lib/supabase/server-admin'

export async function GET(request: NextRequest) {
  const supabase = createServerAdmin()
  const searchParams = request.nextUrl.searchParams

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### Estructura de Archivos

```
src/
├── app/                           # Paginas (App Router)
│   ├── (public)/                 # Sin auth
│   └── (private)/                # Con auth
├── components/
│   ├── ui/                       # shadcn/ui base (no modificar directamente)
│   ├── [feature]/                # Por feature (properties/, contacts/, etc.)
│   └── [Feature]Card.tsx         # PascalCase para componentes
├── hooks/
│   └── use[Feature].ts           # camelCase con prefijo 'use'
├── lib/
│   └── [service]/                # Por servicio (supabase/, whatsapp/, etc.)
├── services/
│   └── [entity]-service.ts       # Servicios de datos
└── types/
    └── [entity].ts               # Por entidad
```

**Convenciones de nombrado:**

| Tipo | Convencion | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `PropertyCard.tsx` |
| Hooks | camelCase con `use` | `useProperties.ts` |
| Utilidades | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Property`, `ContactFilter` |
| Constantes | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Archivos CSS | kebab-case | `property-card.css` |
| Directorios | kebab-case | `property-details/` |

## Testing

### Unit Tests (Jest)

```typescript
// __tests__/utils/formatCurrency.test.ts
describe('formatCurrency', () => {
  it('should format Mexican pesos', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('should handle millions', () => {
    expect(formatCurrency(5500000)).toBe('$5,500,000')
  })
})
```

### Component Tests

```typescript
// __tests__/components/PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyCard } from '@/components/properties/PropertyCard'

const mockProperty = {
  id: '1',
  title: 'Casa en Polanco',
  price: 5500000,
  bedrooms: 3,
  bathrooms: 2
}

describe('PropertyCard', () => {
  it('should render property details', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Casa en Polanco')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<PropertyCard property={mockProperty} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Casa en Polanco'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/properties.spec.ts
import { test, expect } from '@playwright/test'

test('should search properties', async ({ page }) => {
  await page.goto('/propiedades')

  // Buscar
  await page.fill('[data-testid="search-input"]', 'Polanco')
  await page.click('[data-testid="search-button"]')

  // Verificar resultados
  await expect(page.locator('.property-card')).toHaveCount.greaterThan(0)
})

test('should create a property', async ({ page }) => {
  // Login
  await page.goto('/auth/login')
  await page.fill('#email', 'admin@livoo.mx')
  await page.fill('#password', 'password123')
  await page.click('button[type="submit"]')

  // Navegar a crear propiedad
  await page.goto('/backoffice/propiedades/nueva')

  // Llenar formulario wizard
  // ... pasos del wizard

  await expect(page).toHaveURL(/\/backoffice\/propiedades/)
})
```

### Ejecutar Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage

# Security tests
npm run test:security

# E2E tests
npm run test:e2e

# E2E con UI (debug)
npx playwright test --ui
```

## Pull Request Process

### 1. Antes de crear el PR

```bash
# Lint
npm run lint

# Tests
npm test

# Build (verifica que compila)
npm run build
```

### 2. Crear el PR

Usar este template en la descripcion:

```markdown
## Descripcion
Breve descripcion de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe funcionalidad existente)
- [ ] Documentacion (solo cambios en docs)
- [ ] Refactor (cambio de codigo sin cambio funcional)

## Testing
- [ ] Unit tests agregados/actualizados
- [ ] E2E tests agregados/actualizados
- [ ] Testeado manualmente en navegador

## Screenshots (si aplica)
[Agregar capturas de pantalla para cambios visuales]

## Checklist
- [ ] Codigo sigue las convenciones del proyecto
- [ ] Documentacion actualizada si es necesario
- [ ] Tests pasan localmente
- [ ] Sin conflictos con main
- [ ] Build exitoso (npm run build)
```

### 3. Review Process

- **Minimo:** 1 aprobacion requerida
- **Requerido:** Tests automaticos pasan
- **Requerido:** Build exitoso
- **Recomendado:** Screenshots para cambios de UI

### 4. Merge Strategy

- **Squash and merge:** Para features pequenas (1-3 commits)
- **Merge commit:** Para features grandes con historial relevante
- **Rebase:** Para mantener historia limpia en branches personales

## Reportar Bugs

Usar este template al crear un Issue:

```markdown
## Descripcion del Bug
Descripcion clara y concisa del problema.

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error en '...'

## Comportamiento Esperado
Lo que deberia pasar.

## Comportamiento Actual
Lo que realmente pasa.

## Screenshots
[Si aplica, agregar capturas]

## Entorno
- OS: [e.g. macOS 14, Windows 11]
- Browser: [e.g. Chrome 120, Safari 17]
- Node.js: [e.g. 20.10]

## Contexto Adicional
Cualquier otra informacion relevante (logs de consola, network requests, etc.)
```

## Solicitar Features

```markdown
## Feature Request
Descripcion de la funcionalidad deseada.

## Problema que Resuelve
Que problema de usuario o negocio resuelve esta funcionalidad?

## Solucion Propuesta
Como deberia funcionar? Incluir mockups o wireframes si es posible.

## Alternativas Consideradas
Otras soluciones que se evaluaron y por que se descartaron.

## Impacto
A quien beneficia? Cuantos usuarios se ven afectados?
```

## Flujo de Trabajo Git

### Mantener fork actualizado

```bash
# Agregar upstream (solo una vez)
git remote add upstream https://github.com/manuia88/livoocrmag.git

# Sincronizar con upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Resolver conflictos

```bash
git fetch upstream
git rebase upstream/main
# Resolver conflictos manualmente en cada archivo
git add .
git rebase --continue
git push -f origin feature/mi-branch
```

### Branches multiples

Cada PR debe tener su propio branch separado. No mezclar features en un solo branch.

```bash
# Feature 1
git checkout -b feature/export-excel
# ... trabajo ...
git push origin feature/export-excel

# Feature 2 (desde main limpio)
git checkout main
git checkout -b feature/whatsapp-templates
# ... trabajo ...
git push origin feature/whatsapp-templates
```

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

## Contacto

- **Slack:** #livoo-dev
- **Email:** dev@livoo.mx
- **Issues:** [GitHub Issues](https://github.com/manuia88/livoocrmag/issues)
