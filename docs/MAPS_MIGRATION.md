# Migración de Google Maps a Leaflet.js

## Resumen
Se ha eliminado completamente la dependencia de Google Maps API para ahorrar aproximadamente **$42,000 USD anuales** en costos de infraestructura. Toda la funcionalidad de mapas ahora utiliza **Leaflet.js** con tiles de **OpenStreetMap** (vía CartoDB).

## Cambios Principales
- **Eliminado:** `@react-google-maps/api`
- **Agregado:** `leaflet`, `react-leaflet`
- **Tiles:** CartoDB Light (OpenStreetMap) - Gratis, sin API key.
- **Buscador:** OpenStreetMap Nominatim API (reemplaza Google Places).

## Componentes Nuevos

### `PropertyMap`
Se usa en el listado de propiedades.
- Marcadores personalizados con precios.
- Ajuste automático de zoom (bounds) según las propiedades visibles.
- Popups "premium" con foto y detalles.
- **Ubicación:** `src/components/maps/PropertyMap.tsx`

### `SinglePropertyMap`
Se usa en el detalle de la propiedad.
- Marcador único centrado.
- Interacción simplificada.
- **Ubicación:** `src/components/maps/SinglePropertyMap.tsx`

### `LocationPicker`
Se usa en el flujo de creación de propiedades (Step 2).
- Permite seleccionar coordenadas haciendo clic en el mapa.
- Marcador arrastrable para precisión fina.
- **Ubicación:** `src/components/maps/LocationPicker.tsx`

### `AddressAutocomplete`
Buscador de direcciones que utiliza la API de Nominatim.
- No requiere API Key.
- Filtra resultados por país (México).
- Actualiza automáticamente las coordenadas en el formulario.
- **Ubicación:** `src/components/forms/AddressAutocomplete.tsx`

## Guía de Uso

### Cómo usar en una página nueva
Utilice siempre `next/dynamic` con `ssr: false` para importar componentes que usen Leaflet, ya que requieren el objeto `window`.

```tsx
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(
  () => import('@/components/maps/PropertyMap'),
  { ssr: false }
)
```

## Troubleshooting
- **Los iconos no se ven:** Asegúrese de que `globals.css` tenga el fix para los paths de iconos de Leaflet.
- **Error "window is not defined":** Asegúrese de usar `dynamic` import con `ssr: false`.
- **Lentitud con muchos marcadores:** En el futuro se puede implementar `react-leaflet-cluster` si el inventario supera las 500 propiedades.
