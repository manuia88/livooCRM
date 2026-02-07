# 🔧 Instrucciones para vincular datos de Inventario con Nueva Propiedad

## Cambios aplicados:

### 1. ✅ Comisión (commission_percentage)
**Ya estaba vinculado correctamente**
- Se guarda desde el formulario Step 2 → Campo "Comisión"
- Se muestra en la tarjeta de inventario como "Comisión: X%"

### 2. ✅ Exclusiva/Opción (mls_shared)
**Corrección aplicada**

**Antes**: El formulario guardaba `exclusivity_contract` pero no actualizaba `mls_shared`

**Ahora**: 
- Cuando seleccionas **"Exclusiva"** → `mls_shared = false` (NO se comparte)
- Cuando seleccionas **"Opción"** → `mls_shared = true` (SÍ se comparte)
- Se muestra en la tarjeta como "Exclusiva" o "No Exclusiva"

### 3. ✅ Estado Legal (legal_status)
**Corrección aplicada**
- Se guarda desde el formulario Step 6 → Campo "Estado del Proceso Legal"
- Se muestra en la tarjeta como "Legal: [Estado]"

---

## 🗄️ Migración de Base de Datos Requerida

Para que funcione completamente, necesitas agregar el campo `legal_status` a la tabla `properties`:

### Opción 1: Desde Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/yrfzhkziipeiganxpwlv/sql/new
2. Copia y ejecuta el contenido del archivo: `supabase/migrations/add_legal_status_to_properties.sql`

```sql
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS legal_status TEXT;

COMMENT ON COLUMN properties.legal_status IS 'Estado del proceso legal de la propiedad';
```

3. Click en "Run"

### Opción 2: Desde terminal (si tienes Supabase CLI)

```bash
cd /Users/manuelacosta/Desktop/Antigravity/LivooCRMAG

# Aplicar migración
npx supabase db push
```

---

## 📝 Valores de legal_status disponibles:

Los valores que se pueden seleccionar en el formulario son:

1. `solicitud_docs` - "Solicitud de Docs"
2. `revision_legal` - "Revisión Legal"
3. `escrituras_proceso` - "Escrituras en Proceso"
4. `liberacion_gravamenes` - "Liberación de Gravámenes"
5. `sin_contrato` - "Sin Contrato"
6. `en_revision` - "En Revisión"
7. `escrituras_tramite` - "Escrituras en Trámite"
8. `escrituras_listas` - "Escrituras Listas"
9. `liberacion_gravamen` - "Liberación de Gravamen"
10. `contrato_firmado` - "Contrato Firmado"

---

## 🎯 Resultado Final

Después de aplicar la migración, cuando crees una nueva propiedad:

1. El **% de comisión** se guardará correctamente
2. La selección de **Exclusiva/Opción** se guardará en `mls_shared`
3. El **Estado Legal** se guardará en `legal_status`

Y en el módulo de Inventario, estos 3 datos se mostrarán automáticamente en el header de cada tarjeta:

```
┌─────────────────────────────────────────────┐
│ Comisión: 4.64%  │  Exclusiva  │  Legal: Sin Contrato │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Importante

Una vez aplicada la migración, reinicia el servidor de desarrollo:

```bash
# Detener el servidor (Ctrl+C)
# Limpiar caché
rm -rf .next .turbo

# Iniciar de nuevo
npm run dev
```
