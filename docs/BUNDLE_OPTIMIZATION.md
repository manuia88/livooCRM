# Optimización de Bundle y Rendimiento

Este documento detalla los cambios realizados para reducir el First Load JS a menos de 100KB y mejorar el rendimiento general de Livoo CRM.

## Estrategia de Optimización

### 1. Code Splitting por Route Groups
Hemos organizado el proyecto en grupos de rutas `(public)` y `(private)` para separar los layouts:
- **Public Layout**: Minimalista, sin sidebar pesado ni lógica de autenticación compleja en el bundle inicial.
- **Private Layout**: Incluye sidebar, estado de autenticación y componentes específicos del backoffice.

### 2. Dynamic Imports (Lazy Loading)
Los componentes más pesados se cargan bajo demanda utilizando `next/dynamic`:
- **Mapas**: `Leaflet.js` solo se descarga cuando se renderiza un componente de mapa.
- **Gráficas**: `Recharts` y sus dependencias solo se cargan en las páginas de analytics y reportes.
- **Componentes Complejos**: Modalidades y formularios pesados se han movido a carga dinámica.

### 3. Optimización de Librerías y Tree-Shaking
- **next.config.ts**: Configurado `experimental.optimizePackageImports` para `lucide-react`, `recharts` y `radix-ui`.
- **Iconos**: Se ha creado un barrel file en `src/components/icons/index.ts` para centralizar los iconos de `lucide-react` y asegurar que no se importe la librería completa.
- **Lodash**: Configurado alias para usar `lodash-es` permitiendo tree-shaking efectivo.

### 4. Optimización de Imágenes
Se ha implementado el componente `OptimizedImage` que:
- Usa formatos modernos (AVIF, WebP).
- Implementa lazy loading nativo.
- Muestra un skeleton/loader durante la carga para mejorar el LCP y CLS.

## Cómo Analizar el Bundle

Para verificar los tamaños de los chunks y el First Load JS:

```bash
npm run analyze
```

Esto generará reportes visuales en `.next/analyze/` y mostrará la tabla de tamaños en la terminal.

## Checklist para Desarrolladores

- [ ] Usar `dynamic()` para cualquier componente que importe librerías externas grandes (>50KB).
- [ ] Importar iconos desde `@/components/icons` en lugar de directamente desde `lucide-react`.
- [ ] Utilizar `OptimizedImage` para imágenes que no sean críticas para el LCP inicial.
- [ ] Evitar importar `lodash` completo; usar funciones específicas de `lodash-es`.
