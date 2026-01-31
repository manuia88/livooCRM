# Módulo de Propiedades - LIVOO CRM

## 📋 Descripción

Sistema completo de gestión de propiedades con soporte para RED de inmobiliarias.

## 🏗️ Arquitectura

### Base de Datos
- **Tabla:** `properties`
- **Vista:** `properties_safe` (oculta datos de propietario según agencia)
- **Funciones SQL:**
  - `calculate_property_health_score()` - Calcula score 0-100
  - `generate_property_slug()` - Genera URL amigable
  - `increment_property_views()` - Contador de vistas

### Archivos Principales

```
src/
├── app/(backoffice)/propiedades/
│   ├── page.tsx                    # Listado de propiedades (3 tabs)
│   ├── nueva/
│   │   └── page.tsx                # Wizard de creación (7 pasos)
│   └── [id]/
│       └── page.tsx                # Detalle/Edición de propiedad
├── hooks/
│   └── useProperties.ts            # Hook con React Query
├── components/backoffice/properties/
│   ├── ImageGallery.tsx            # Galería de imágenes
│   └── FeaturesSelector.tsx        # Selector de amenidades
└── types/
    └── property-types.ts           # Tipos TypeScript
```

## 🔐 Lógica de Visibilidad

### Regla Principal
**TODOS (asesores y admins) ven propiedades de la RED, pero solo ven datos de propietario de su propia inmobiliaria.**

### Permisos por Rol

**Asesor:**
- ✅ Ve sus propias propiedades (con datos propietario)
- ✅ Ve propiedades de su inmobiliaria (SIN datos propietario)
- ✅ Ve propiedades de la RED (mls_shared=true o visibility='public') (SIN datos propietario)
- ✅ Edita SOLO sus propias propiedades
- ❌ NO edita propiedades de otros asesores

**Admin/Director:**
- ✅ Ve todas las propiedades de SU inmobiliaria (con datos propietario)
- ✅ Ve propiedades de la RED (SIN datos propietario)
- ✅ Edita TODAS las propiedades de su inmobiliaria
- ❌ NO edita propiedades de otras inmobiliarias

### Datos Protegidos
Los siguientes campos SOLO son visibles si `property.agency_id = user.agency_id`:
- `owner_name`
- `owner_phone`
- `owner_email`
- `owner_notes`

## 📊 Health Score

Score automático 0-100 basado en:
- Información básica (20 pts)
- Detalles (15 pts)
- Ubicación (10 pts)
- Multimedia (25 pts)
- Características (10 pts)
- Documentación (10 pts)
- Actividad (10 pts)

## 🎨 Funcionalidades

### Listado (page.tsx)
- 3 tabs: Mías / Inmobiliaria / Red
- Búsqueda por texto
- Cards con imagen, precio, características
- Health score visual
- Badges (publicada, red, mi agencia)
- Estadísticas en cards

### Wizard (nueva/page.tsx)
- 7 pasos con stepper visual
- Paso 1: Información Básica
- Paso 2: Ubicación
- Paso 3: Detalles
- Paso 4: Precios
- Paso 5: Características (básico)
- Paso 6: Imágenes (básico)
- Paso 7: Revisión y publicación

### Detalle ([id]/page.tsx)
- Vista completa de la propiedad
- Edición inline (click "Editar")
- Toggle publicar/despublicar
- Toggle compartir en MLS
- Datos de propietario (si aplica)
- Estadísticas (vistas, consultas, visitas)
- Link "Ver en Web" (si publicada)

## 🔄 Hooks Disponibles

```typescript
// Obtener propiedades con filtros
const { data: properties } = useProperties({ 
  source: 'own',  // 'own' | 'agency' | 'network'
  status: 'disponible',
  search: 'polanco'
})

// Obtener una propiedad
const { data: property } = useProperty(propertyId)

// Crear propiedad
const createProperty = useCreateProperty()
await createProperty.mutateAsync(propertyData)

// Actualizar propiedad
const updateProperty = useUpdateProperty()
await updateProperty.mutateAsync({ id, updates })

// Publicar/despublicar
const togglePublish = useTogglePublishProperty()
await togglePublish.mutateAsync({ id, published: true })

// Estadísticas
const { data: stats } = usePropertiesStats()
// { total: 10, mine: 5, network: 20 }
```

## 🚀 Próximas Mejoras

### Pendientes
- [ ] Upload real de imágenes a Supabase Storage
- [ ] Implementar pasos 5 y 6 del wizard (características e imágenes completos)
- [ ] Filtros avanzados en listado
- [ ] Mapa de ubicaciones
- [ ] Comparador de propiedades
- [ ] Export a PDF
- [ ] Historial de cambios

### Opcionales
- [ ] Duplicar propiedad
- [ ] Alertas de precio
- [ ] Reporte de rendimiento por propiedad
- [ ] Integración con portales (Inmuebles24, Propiedades.com)

## 📝 Queries SQL Útiles

```sql
-- Ver propiedades con visibilidad correcta
SELECT 
  title, 
  is_my_agency, 
  source, 
  owner_name 
FROM properties_safe 
LIMIT 10;

-- Verificar health scores
SELECT 
  title, 
  health_score,
  calculate_property_health_score(id) as calculated_score
FROM properties
LIMIT 10;

-- Propiedades compartidas en MLS
SELECT 
  title, 
  agency_id, 
  mls_shared, 
  published
FROM properties
WHERE mls_shared = true;
```

## ✅ Completado

- [x] Base de datos con RLS y vista segura
- [x] Health Score automático
- [x] Slug automático
- [x] Listado con 3 vistas
- [x] Wizard de creación básico
- [x] Página de detalle con edición
- [x] Toggle publicación
- [x] Toggle MLS
- [x] Protección de datos de propietario
- [x] Componentes de galería y características
