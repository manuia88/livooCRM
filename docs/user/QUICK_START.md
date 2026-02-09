# Guia Rapida - Livoo CRM

## En 5 minutos

### 1. Captar Propiedad
```
Propiedades > Nueva > Wizard 5 pasos > Crear
```

### 2. Crear Lead
```
Contactos > Nuevo Lead > Llenar form > Guardar
```

### 3. Crear Tarea
```
Tareas > Nueva > Titulo + Fecha > Crear
```

### 4. Completar Tarea
```
Click en checkbox junto a la tarea
```

### 5. Mover Lead de Etapa
```
Abrir lead > Click en etapa > Seleccionar nueva > Guardar
```

---

## Flujos Principales

### Captacion a Publicacion
```
1. Nueva Propiedad (Wizard 5 pasos)
2. Sistema optimiza fotos automaticamente (WebP/AVIF)
3. Publica en portales seleccionados (Inmuebles24, Vivanuncios, Lamudi)
4. Aparece en busqueda publica (/propiedades)
5. Property Health Score indica completitud
```

### Lead a Cierre
```
1. Crear lead (Contactos > Nuevo)
2. Contactar (llamada/email/WhatsApp)
3. Calificar (mover a "Calificado")
4. Mostrar propiedades (mover a "Presentacion")
5. Negociar (mover a "Negociacion")
6. Cerrar (mover a "Cerrado")
```

### Asignar Tarea
```
1. Tareas > Nueva
2. Titulo + Descripcion
3. Asignar a: [Seleccionar agente]
4. Vencimiento: [Fecha/hora]
5. Crear
```

### Enviar WhatsApp
```
1. Abrir lead o contacto
2. Click en icono WhatsApp (verde)
3. Escribir mensaje o usar plantilla
4. Enviar
```

### Broadcast (Envio Masivo)
```
1. Inbox > Broadcast
2. Crear Campana
3. Seleccionar destinatarios
4. Escribir mensaje
5. Enviar Campana
```

---

## Atajos Utiles

| Necesito... | Hago... |
|-------------|---------|
| Buscar algo | `Ctrl + K` o click en busqueda |
| Nueva propiedad | `Ctrl + N` |
| Nuevo lead | `Ctrl + L` |
| Nueva tarea | `Ctrl + T` |
| Ver notificaciones | Click en campana |
| Abrir menu usuario | Click en foto perfil |
| Ir a inbox | Click en Inbox (menu lateral) |

---

## Metricas Clave

**Dashboard muestra:**
- Propiedades (totales, activas, vendidas, rentadas)
- Leads (nuevos, calificados, conversion %)
- Tareas (pendientes, completadas, vencidas)
- Comisiones del mes

**Actualizacion:** Tiempo real via WebSocket

---

## Roles y Permisos

| Rol | Que puede hacer |
|-----|----------------|
| **Admin** | Todo: config, usuarios, reportes globales |
| **Manager** | Gestionar equipo, ver reportes del equipo |
| **Agente** | CRUD propiedades/leads/tareas propios |
| **Viewer** | Solo lectura de todo el sistema |

---

## Estados de Propiedad

| Estado | Significado |
|--------|-------------|
| **Borrador** | En proceso, no publicada |
| **Activa** | Publicada y visible |
| **Vendida** | Venta concretada |
| **Rentada** | Renta concretada |
| **Inactiva** | Temporalmente oculta |
| **Archivada** | Guardada sin publicar |

---

## Pipeline de Leads

```
Nuevo > Contactado > Calificado > Presentacion > Negociacion > Cerrado
```

El **Lead Scoring** (0-100) prioriza automaticamente los leads mas prometedores.

---

## Problemas Comunes

| Problema | Solucion |
|----------|----------|
| No puedo subir foto | Max. 10MB, solo JPG/PNG/WebP |
| No aparece mi propiedad | Verifica que estado sea "Activa" |
| Lead no recibe WhatsApp | Conecta WhatsApp en Configuracion |
| Olvide contrasena | Login > "Olvidaste...?" > Email reset |
| No carga el dashboard | Refresca (F5) o limpia cache |
| Mapa no se ve | Verifica conexion a internet |
| No puedo asignar tarea | Verifica tu rol (Manager o Admin requerido) |
| Notificaciones no llegan | Config > Notificaciones > Activa canales |

---

## Integraciones Activas

| Servicio | Uso |
|----------|-----|
| **WhatsApp** (Baileys) | Mensajeria directa con leads |
| **Email** (Resend) | Notificaciones y comunicacion |
| **Portales** | Inmuebles24, Vivanuncios, Lamudi |
| **Mapas** (Leaflet) | Ubicacion de propiedades |
| **IA** (Cortex) | Recomendaciones inteligentes |

---

## Soporte Rapido

- **Email:** soporte@livoo.mx
- **Chat:** Widget en esquina inferior derecha
- **Telefono:** 55 1234 5678 (9-6pm)
- **Ayuda:** Menu lateral > Ayuda

---

## Documentacion Relacionada

- [Manual de Usuario Completo](./USER_MANUAL.md)
- [Guia de Onboarding](./ONBOARDING.md)
- [Preguntas Frecuentes](./FAQ.md)
- [Scripts de Videos Tutoriales](./VIDEO_SCRIPTS.md)

---

**Tip del dia:** Usa el buscador (`Ctrl + K`) para encontrar cualquier cosa en segundos.
