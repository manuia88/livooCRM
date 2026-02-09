# CI/CD Pipeline

## Workflows

### 1. CI Pipeline (`ci.yml`)

Ejecuta en cada push y PR a `main`/`develop`:

- **Lint** - ESLint validation
- **Type Check** - TypeScript `tsc --noEmit`
- **Build** - Next.js production build
- Unit tests (descomentar cuando estén listos)
- E2E tests (descomentar cuando estén listos)

### 2. Deploy Pipeline (`deploy.yml`)

Ejecuta según la rama:

| Evento | Rama | Destino | Health Check | Rollback |
|--------|------|---------|:------------:|:--------:|
| Pull Request | `main` | Preview | No | No |
| Push | `develop` | Staging | Si | No |
| Push | `main` | Production | Si (3 reintentos) | Automatico |

#### Pull Request → Preview
- Deploy a Vercel preview environment
- Comenta la URL del preview en el PR

#### Push a `develop` → Staging
- Deploy a staging environment
- Health check automatico post-deploy

#### Push a `main` → Production
- Deploy a production
- Health check con 3 reintentos
- Rollback automatico si falla el health check

## GitHub Secrets Requeridos

Configurar en: **GitHub repo > Settings > Secrets and variables > Actions**

### Supabase
| Secret | Descripcion |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key publica |
| `DATABASE_URL` | Connection string PostgreSQL |

### Vercel
| Secret | Donde obtenerlo |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel > Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel > Settings > General |
| `VERCEL_PROJECT_ID` | Vercel > Project Settings > General |

### Tests (opcional hasta implementacion)
| Secret | Descripcion |
|--------|-------------|
| `TEST_USER_EMAIL` | Email para tests E2E |
| `TEST_USER_PASSWORD` | Password para tests E2E |

## Setup Inicial

```bash
# 1. Ejecutar el script de setup
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh

# 2. Agregar GitHub secrets (ver tabla arriba)
```

## Activar Tests (Fase 2)

Cuando los tests esten listos:

1. Descomentar los jobs `test-unit` y `test-e2e` en `.github/workflows/ci.yml`
2. Actualizar el job `success`:
   ```yaml
   needs: [lint, build, test-unit, test-e2e]
   ```
3. Commit y push

## Health Check

**Endpoint:** `GET /api/health`

Verifica:
- Conectividad con la base de datos (Supabase)
- Respuesta del API

**Ejemplo:**
```bash
curl https://tu-dominio.vercel.app/api/health
```

**Respuesta (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T12:00:00.000Z",
  "checks": {
    "api": "ok",
    "database": "ok"
  },
  "responseTime": "45ms",
  "version": "abc1234"
}
```

**Respuesta de error (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-09T12:00:00.000Z",
  "checks": {
    "api": "ok"
  },
  "error": "Database check failed: ...",
  "responseTime": "2050ms",
  "version": "abc1234"
}
```

## Rollback Manual

```bash
# Listar deployments recientes
vercel ls

# Rollback a la version anterior
vercel rollback

# Rollback a un deployment especifico
vercel rollback [deployment-url]
```
