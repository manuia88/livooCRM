# Livoo CRM

Sistema de gestion inmobiliaria moderno con captacion inteligente, gestion de leads, y publicacion automatizada en portales.

## Demo

- **Produccion:** https://livoo-crm.vercel.app
- **Staging:** https://livoo-crm-staging.vercel.app
- **Documentacion:** [Ver docs/](./docs/)

## Caracteristicas Principales

### Gestion de Propiedades
- Wizard de captacion en 5 pasos
- Geolocalizacion con Leaflet + Nominatim / Google Maps
- Optimizacion de imagenes (Sharp + WebP/AVIF)
- Busqueda avanzada con filtros multiples
- Publicacion automatica en portales
- Health scoring de propiedades
- Exportacion a Excel y PDF

### Gestion de Leads
- Pipeline visual por etapas
- Lead scoring automatico
- Asignacion inteligente
- Seguimiento de interacciones
- WhatsApp integrado (Baileys)
- Bandeja de entrada unificada
- Broadcast masivo

### Analytics & Reporting
- Dashboard en tiempo real
- Metricas por agente
- Graficos de conversion (Recharts)
- Reportes exportables (Excel/PDF)
- Vistas materializadas para performance

### Notificaciones
- Real-time con Supabase Realtime
- Email transaccional (Resend + React Email)
- WhatsApp Business (Baileys)
- Alertas de tareas automaticas

### Inteligencia Artificial
- Integracion con Google AI (Gemini)
- Langchain para flujos avanzados
- Asistente Cortex para agentes

### Seguridad
- Multi-tenant con Row Level Security (RLS)
- Auth con Supabase (JWT)
- Roles: Admin, Manager, Agent
- Auditoria completa
- CSP headers + CORS configurado
- Rate limiting por IP/usuario

## Stack Tecnologico

### Frontend
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Next.js | 16.1.6 | App Router, SSR, API Routes |
| React | 19.2.3 | UI Components |
| TypeScript | 5.x | Tipado estatico |
| Tailwind CSS | 4.x | Estilos utility-first |
| shadcn/ui | - | Componentes base (Radix UI) |
| React Query | 5.90+ | Estado servidor, cache |
| React Hook Form | 7.71+ | Formularios |
| Zod | 4.3+ | Validacion de schemas |
| Leaflet | 1.9.4 | Mapas interactivos |
| Recharts | 3.7+ | Graficos y charts |
| Framer Motion | 12.29+ | Animaciones |
| Zustand | 5.0+ | Estado global |

### Backend
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Supabase | 2.45+ | PostgreSQL + Auth + Storage |
| Supabase SSR | 0.5.2 | Auth server-side |
| PostgreSQL | - | Base de datos principal |
| Edge Functions | - | Logica serverless |
| Supabase Realtime | - | WebSocket subscriptions |
| pg | 8.17+ | Connection pooling |

### Integraciones
| Servicio | Libreria | Uso |
|----------|----------|-----|
| Resend | 6.9+ | Email transaccional |
| Baileys | 7.0-rc.9 | WhatsApp Web |
| Sharp | 0.34+ | Procesamiento de imagenes |
| Cheerio | 1.2+ | Web scraping |
| jsPDF | 4.0+ | Generacion de PDFs |
| XLSX | 0.18+ | Exportacion a Excel |
| Pino | 10.3+ | Logging estructurado |
| Google AI | 3.0+ | LLM/AI features |
| Langchain | 1.2+ | Cadenas AI avanzadas |

### DevOps
| Herramienta | Uso |
|-------------|-----|
| Vercel | Hosting + CDN + Edge |
| GitHub Actions | CI/CD |
| Jest 30 | Unit testing |
| Playwright 1.58 | E2E testing |
| ESLint 9 | Linting |
| Bundle Analyzer | Analisis de bundle |

## Requisitos Previos

- Node.js 18+ (recomendado 20+)
- npm 10+
- Git
- Cuenta Supabase (free tier funcional)
- Cuenta Vercel (free tier funcional)

## Quick Start

### 1. Clonar repositorio
```bash
git clone https://github.com/manuia88/livoocrmag.git
cd livoocrmag
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```bash
# Supabase (obtener de dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Maps (opcional, para geocoding avanzado)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Email (Resend)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar base de datos

Ejecutar el schema completo en Supabase SQL Editor:
```bash
# Opcion 1: Usar el schema completo
# Copiar contenido de supabase/master_setup_complete.sql en SQL Editor

# Opcion 2: Aplicar migraciones individualmente
# Ejecutar archivos en supabase/migrations/ en orden numerico
```

### 5. Seed de datos iniciales
```bash
# Opcion 1: Via script
npm run seed-properties

# Opcion 2: Via endpoint (con servidor corriendo)
# Visitar http://localhost:3000/api/seed
```

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
livoo-crm/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/              # Rutas publicas (sin auth)
│   │   │   ├── propiedades/       # Listado y detalle de propiedades
│   │   │   ├── mls/               # Multiple Listing Service
│   │   │   ├── auth/              # Login, registro, reset
│   │   │   ├── agencias/          # Directorio de agencias
│   │   │   ├── contacto/          # Formulario de contacto
│   │   │   ├── valuacion/         # Valuacion de propiedades
│   │   │   └── blog/              # Blog y guias
│   │   ├── (private)/             # Rutas protegidas (con auth)
│   │   │   └── backoffice/        # CRM principal
│   │   │       ├── propiedades/   # CRUD propiedades
│   │   │       ├── contactos/     # Gestion de contactos
│   │   │       ├── inventario/    # Inventario
│   │   │       ├── tareas/        # Sistema de tareas
│   │   │       ├── inbox/         # Bandeja unificada
│   │   │       ├── analytics/     # Dashboard analytics
│   │   │       ├── reportes/      # Reportes
│   │   │       ├── configuracion/ # Configuracion
│   │   │       ├── captaciones/   # Pipeline de captaciones
│   │   │       └── usuarios/      # Gestion de usuarios
│   │   ├── api/                   # API Routes
│   │   │   ├── properties/        # CRUD propiedades
│   │   │   ├── whatsapp/          # WhatsApp endpoints
│   │   │   ├── broadcast/         # Envios masivos
│   │   │   ├── tasks/             # Tareas y cron jobs
│   │   │   ├── scraping/          # Web scraping
│   │   │   ├── send-email/        # Envio de emails
│   │   │   ├── geocode/           # Geocodificacion
│   │   │   ├── upload/            # Subida de archivos
│   │   │   ├── cron/              # Cron jobs automaticos
│   │   │   └── publish-property/  # Publicacion en portales
│   │   └── actions/               # Server Actions (RSC)
│   ├── components/                # 186+ Componentes React
│   │   ├── ui/                   # shadcn/ui (base)
│   │   ├── layout/               # Navbar, Footer, Sidebar
│   │   ├── dashboard/            # Widgets de dashboard
│   │   ├── analytics/            # Graficos y metricas
│   │   ├── backoffice/           # UI del CRM
│   │   ├── properties/           # Cards, listados, galeria
│   │   ├── contacts/             # Gestion de contactos
│   │   ├── tasks/                # Sistema de tareas
│   │   ├── inbox/                # Mensajeria unificada
│   │   ├── whatsapp/             # UI WhatsApp (QR, chat)
│   │   ├── broadcast/            # Envios masivos
│   │   ├── notifications/        # Sistema de alertas
│   │   ├── maps/                 # Componentes Leaflet
│   │   ├── forms/                # Formularios
│   │   ├── auth/                 # Login, registro
│   │   ├── ai/                   # Componentes AI
│   │   ├── providers/            # Context providers
│   │   └── shared/               # Componentes reutilizables
│   ├── hooks/                    # 15 Custom hooks
│   │   ├── useProperties.ts      # CRUD propiedades
│   │   ├── useContacts.ts        # CRUD contactos
│   │   ├── useTasks.ts           # Gestion de tareas
│   │   ├── useAnalytics.ts       # Datos analytics
│   │   ├── useDashboard.ts       # Dashboard data
│   │   ├── useConversations.ts   # Mensajeria
│   │   ├── useCurrentUser.ts     # Usuario actual
│   │   ├── useScraping.ts        # Web scraping
│   │   ├── useEmailSender.ts     # Envio de emails
│   │   └── ...
│   ├── lib/                      # Utilidades (38 archivos)
│   │   ├── supabase/            # Clients (browser + server)
│   │   ├── auth/                # Middleware auth
│   │   ├── whatsapp/            # Baileys client + session
│   │   ├── email/               # Templates + envio
│   │   ├── notifications/       # Sistema de notificaciones
│   │   ├── scraping/            # Web scraping utils
│   │   ├── portals/             # Publicacion en portales
│   │   ├── ai/                  # Integracion LLM
│   │   ├── security/            # CORS, CSP, validacion
│   │   ├── geocoding/           # Google Maps + Nominatim
│   │   ├── monitoring/          # Logging (Pino)
│   │   ├── validations/         # Schemas Zod
│   │   ├── rate-limit.ts        # Rate limiting
│   │   ├── export-utils.ts      # Excel/PDF export
│   │   └── utils.ts             # Helpers generales
│   ├── services/                 # Servicios de datos
│   │   ├── properties.ts        # Property service
│   │   ├── property-service.ts  # CRUD avanzado
│   │   └── analytics-service.ts # Analytics service
│   ├── types/                    # TypeScript types (10 archivos)
│   │   ├── database.ts          # Schema completo DB
│   │   ├── properties.ts        # Tipos de propiedades
│   │   ├── analytics.ts         # Tipos analytics
│   │   └── index.ts             # Barrel exports
│   ├── stores/                   # Zustand stores
│   ├── contexts/                 # React Context
│   ├── constants/                # Constantes globales
│   ├── features/                 # Modulos por feature
│   │   └── mls/                 # Multiple Listing Service
│   └── emails/                   # Templates de email
├── supabase/
│   ├── migrations/              # 57+ archivos de migracion
│   ├── functions/               # Edge Functions
│   ├── schema.sql               # Schema completo
│   └── master_setup_complete.sql # Setup completo
├── __tests__/                    # Jest unit tests
├── e2e/                          # Playwright E2E tests
├── scripts/                      # Scripts utilitarios
├── docs/                         # 30+ documentos tecnicos
├── public/                       # Assets estaticos
├── next.config.ts                # Configuracion Next.js
├── vercel.json                   # Deployment + Cron jobs
├── jest.config.js                # Configuracion Jest
├── playwright.config.ts          # Configuracion Playwright
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui config
└── package.json                  # Dependencias
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (port 3000)
npm run build            # Build de produccion
npm start                # Servidor de produccion

# Testing
npm test                 # Jest unit tests
npm run test:watch       # Jest en modo watch
npm run test:e2e         # Playwright E2E tests
npm run test:security    # Tests de seguridad

# Calidad
npm run lint             # ESLint
npm run analyze          # Bundle analyzer

# Base de datos
npm run seed-properties  # Seed de propiedades ejemplo

# Deployment
npm run pre-deploy       # Validar + lint + build
npm run validate-config  # Validar configuracion

# Utilidades
npm run setup-whatsapp-storage  # Configurar storage WhatsApp
```

## Testing

```bash
# Unit tests con Jest
npm test

# Tests en modo watch
npm run test:watch

# Tests de seguridad
npm run test:security

# E2E tests con Playwright
npm run test:e2e

# Tests con coverage
npm test -- --coverage
```

## Deployment

### Automatico (Vercel)
Push a `main` despliega automaticamente a produccion via integracion con Vercel.

### Manual (Vercel CLI)
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy produccion
vercel --prod
```

### Pre-deploy checklist
```bash
npm run pre-deploy  # Ejecuta validate-config + lint + build
```

### Cron Jobs (vercel.json)
| Cron | Endpoint | Descripcion |
|------|----------|-------------|
| `0 0 * * *` | `/api/tasks/auto-generate` | Generacion automatica de tareas (diario) |
| `0 12 * * *` | `/api/tasks/check-overdue` | Verificacion de tareas vencidas (diario) |

## Documentacion

### Core
- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Base de Datos](./docs/DATABASE.md)
- [Resumen de Base de Datos](./docs/DATABASE_SUMMARY.md)
- [Seguridad](./docs/SECURITY.md)
- [Seguridad RLS](./docs/RLS_SECURITY.md)
- [Analisis de Auth](./docs/AUTH_ANALYSIS.md)

### Performance & Optimizacion
- [Performance de BD](./docs/DATABASE_PERFORMANCE.md)
- [Optimizacion de Bundle](./docs/BUNDLE_OPTIMIZATION.md)
- [Optimizacion de Imagenes](./docs/IMAGE_OPTIMIZATION.md)
- [Patrones React Query](./docs/REACT_QUERY_PATTERNS.md)
- [Plan de Optimizacion de Costos](./docs/COST_OPTIMIZATION_PLAN.md)

### Integraciones
- [Migracion de Mapas](./docs/MAPS_MIGRATION.md)
- [Servicio de Geocoding](./docs/GEOCODING_SERVICE.md)
- [Integracion WhatsApp](./docs/WHATSAPP_INTEGRATION.md)
- [Setup WhatsApp](./docs/WHATSAPP_SETUP.md)
- [Servicio de Email](./docs/EMAIL_SERVICE.md)
- [Sistema de Notificaciones](./docs/NOTIFICATIONS_SYSTEM.md)
- [Web Scraping](./docs/WEB_SCRAPING.md)

### Proceso & Guias
- [Guia de Contribucion](./docs/CONTRIBUTING.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Guia de Migracion](./docs/MIGRATION_GUIDE.md)
- [Checklist de Deployment](./docs/DEPLOYMENT_CHECKLIST.md)
- [Checklist de PR](./docs/PR_CHECKLIST.md)

### Progreso & Releases
- [Implementacion Completa](./docs/IMPLEMENTATION_COMPLETE.md)
- [Resumen de Implementacion](./docs/IMPLEMENTATION_SUMMARY.md)
- [Mejoras Fase 3](./docs/PHASE_3_IMPROVEMENTS.md)
- [Correcciones de Seguridad](./docs/SECURITY_FIXES.md)
- [Propiedades](./docs/PROPERTIES_README.md)

## Contribucion

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

Ver [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para convenciones y proceso completo.

## Troubleshooting

Ver [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) para problemas comunes y soluciones.

## Licencia

Propietario - Livoo 2024

## Soporte

- **Email:** soporte@livoo.mx
- **Slack:** #livoo-dev
- **Issues:** [GitHub Issues](https://github.com/manuia88/livoocrmag/issues)
