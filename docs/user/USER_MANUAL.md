# Manual de Usuario - Livoo CRM

## Bienvenido a Livoo CRM

Livoo CRM es tu herramienta para gestionar propiedades, leads y ventas de forma eficiente.

### Que puedes hacer?

- **Captar propiedades** en 5 pasos simples
- **Gestionar leads** desde primer contacto hasta cierre
- **Asignar y dar seguimiento** a tareas
- **Publicar automaticamente** en portales inmobiliarios
- **Ver reportes** de tu desempeno en tiempo real
- **Enviar mensajes** por WhatsApp directamente desde el CRM
- **Usar asistente IA** (Cortex) para recomendaciones inteligentes

---

## Primeros Pasos

### 1. Iniciar Sesion

1. Abre tu navegador (Chrome, Firefox, o Safari)
2. Ve a: **https://livoo-crm.vercel.app**
3. Ingresa tu **email** y **contrasena**
4. Click en **"Iniciar Sesion"**

> **Tip:** Guarda tus credenciales en el navegador para acceso rapido

### 2. Conoce el Dashboard

Al iniciar sesion veras tu **Dashboard** con:

- **Metricas del mes:** Propiedades, leads, tareas
- **Graficos:** Conversion de leads, propiedades por tipo
- **Tareas pendientes:** Las mas urgentes primero
- **Notificaciones:** En el icono de campana (arriba derecha)

### 3. Menu de Navegacion

**Barra lateral izquierda:**

| Seccion | Descripcion |
|---------|-------------|
| **Dashboard** | Vista general y metricas |
| **Propiedades** | Inventario completo de inmuebles |
| **Contactos** | Leads y clientes |
| **Tareas** | To-do list y seguimiento |
| **Inbox** | Mensajeria unificada (WhatsApp, email) |
| **Analytics** | Estadisticas y graficos |
| **Reportes** | Reportes exportables |
| **Captaciones** | Pipeline de ventas |
| **Inventario** | Tracking de inventario |
| **Configuracion** | Ajustes del sistema y equipo |

---

## Captar una Propiedad

### Wizard en 5 Pasos

#### **Paso 1: Informacion General**

1. Click en **"Propiedades"** > **"Nueva Propiedad"**
2. Llena los campos:

| Campo | Ejemplo | Obligatorio |
|-------|---------|-------------|
| **Titulo** | Casa en Polanco con jardin | Si |
| **Descripcion** | Amplia casa de 3 recamaras... | Si |
| **Tipo** | Casa / Departamento / Terreno / Oficina / Local | Si |
| **Operacion** | Venta / Renta | Si |
| **Precio** | $3,500,000 | Si |
| **Moneda** | MXN / USD | Si |
| **Recamaras** | 3 | Si |
| **Banos** | 2 | Si |
| **m2 construidos** | 180 | Si |
| **m2 de terreno** | 200 | Opcional |

3. Click en **"Siguiente"**

#### **Paso 2: Ubicacion**

1. **Buscar direccion:**
   - Escribe: "Masaryk 123, Polanco, CDMX"
   - Selecciona de la lista de sugerencias (geocodificacion automatica)

2. **Ajustar en el mapa:**
   - El mapa (Leaflet) se centra automaticamente
   - Haz click en el mapa para ajustar la ubicacion exacta
   - Puedes hacer zoom con la rueda del mouse

3. Click en **"Siguiente"**

> **Tip:** Mientras mas precisa la ubicacion, mejor para los clientes

#### **Paso 3: Fotos**

1. **Subir fotos:**
   - Click en **"Seleccionar archivos"**
   - O arrastra fotos directamente al area
   - Formatos: JPG, PNG, WebP (max. 10MB por foto)
   - El sistema optimiza automaticamente a WebP/AVIF para carga rapida

2. **Reordenar:**
   - Arrastra las miniaturas para cambiar el orden
   - La primera foto es la principal (portada)

3. **Eliminar:**
   - Click en la X roja sobre cada foto

4. Click en **"Siguiente"**

> **Recomendaciones de fotos:**
> - Minimo 5 fotos, ideal 10-15
> - Buena iluminacion natural
> - Enfoca caracteristicas clave: cocina, banos, sala
> - Incluye exteriores si aplica

#### **Paso 4: Caracteristicas**

1. **Seleccionar amenidades:**
   - Jardin
   - Estacionamiento (cantidad de autos)
   - Seguridad 24/7
   - Terraza
   - Closets
   - Alberca
   - Gym
   - Y mas...

2. **Agregar detalles:**
   - Antiguedad
   - Niveles
   - Mascotas permitidas/no permitidas

3. Click en **"Siguiente"**

#### **Paso 5: Resumen y Publicacion**

1. **Revisar informacion:**
   - Verifica que todo este correcto
   - Si algo esta mal, usa **"Volver"**

2. **Seleccionar portales:**
   - Inmuebles24
   - Vivanuncios
   - Lamudi
   - Propiedades.com

3. **Asignar a agente:**
   - Por defecto se asigna a ti
   - Puedes asignar a otro agente del equipo

4. Click en **"Crear Propiedad"**

> **Listo!** La propiedad se crea y publica automaticamente en los portales seleccionados.

### Estados de una Propiedad

Las propiedades tienen los siguientes estados:

| Estado | Descripcion |
|--------|-------------|
| **Borrador** | En proceso de captura, no visible al publico |
| **Activa** | Publicada y visible en busqueda publica |
| **Vendida** | Se concreto la venta |
| **Rentada** | Se concreto la renta |
| **Inactiva** | Temporalmente fuera de publicacion |
| **Archivada** | Guardada para referencia futura |

### Property Health Score

Cada propiedad tiene un puntaje de salud (0-100) que indica que tan completa y atractiva es. Para mejorar tu puntaje:

- Agrega mas fotos (minimo 5)
- Completa todos los campos opcionales
- Escribe una descripcion detallada (minimo 100 caracteres)
- Agrega amenidades relevantes
- Verifica la ubicacion en el mapa

### Busqueda y Filtros de Propiedades

En la lista de propiedades puedes filtrar por:

- **Tipo:** Casa, Departamento, Terreno, Oficina, Local
- **Operacion:** Venta, Renta
- **Rango de precio:** Min - Max
- **Ubicacion:** Colonia, ciudad, estado
- **Recamaras y banos:** Cantidad minima
- **Estado:** Activa, Vendida, Rentada, etc.

Usa la **busqueda rapida** (`Ctrl + K`) para encontrar propiedades por nombre o direccion.

### Exportar Propiedades

1. Selecciona propiedades con los checkboxes
2. Click en **"Exportar"**
3. Elige formato: **Excel** o **PDF**
4. Se descarga automaticamente

---

## Gestionar Leads

### Que es un Lead?

Un **lead** es una persona interesada en comprar o rentar. Livoo te ayuda a darles seguimiento desde el primer contacto hasta el cierre.

### Tipos de Contacto

| Tipo | Descripcion |
|------|-------------|
| **Comprador** | Busca comprar propiedad |
| **Vendedor** | Quiere vender su propiedad |
| **Arrendatario** | Busca rentar |
| **Arrendador** | Ofrece propiedad en renta |
| **Inversionista** | Busca oportunidades de inversion |

### Crear un Lead

1. Click en **"Contactos"** > **"Nuevo Lead"**
2. Llena el formulario:

| Campo | Ejemplo |
|-------|---------|
| **Nombre** | Juan |
| **Apellido** | Perez |
| **Email** | juan@example.com |
| **Telefono** | 55 1234 5678 |
| **Tipo** | Comprador / Vendedor / Arrendatario / etc. |
| **Origen** | Website / Llamada / Referido / Portal |
| **Interes** | Compra / Renta |
| **Presupuesto** | $3,000,000 - $5,000,000 |

3. Click en **"Guardar"**

### Pipeline de Leads

Los leads pasan por **6 etapas**:

1. **Nuevo** - Recien llego, sin contactar
2. **Contactado** - Ya hablaste con el
3. **Calificado** - Tiene interes y presupuesto real
4. **Presentacion** - Le mostraste propiedades
5. **Negociacion** - Esta negociando precio
6. **Cerrado** - Venta exitosa!

**Mover entre etapas:**

1. Abre el lead (click en su tarjeta)
2. Click en el badge de etapa actual
3. Selecciona la nueva etapa
4. Agrega notas opcionales
5. Click en **"Actualizar"**

### Lead Scoring

El sistema asigna automaticamente un puntaje (0-100) a cada lead basado en:

- **Actividad:** Frecuencia de interacciones
- **Interes:** Nivel de engagement demostrado
- **Presupuesto:** Si coincide con las propiedades disponibles
- **Urgencia:** Tiempo estimado para decidir

Leads con puntaje alto aparecen prioritarios en tu lista.

### Dar Seguimiento

**Agregar interaccion:**

1. Abre el lead
2. Scroll a **"Historial de Interacciones"**
3. Click en **"+ Nueva Interaccion"**
4. Selecciona tipo:
   - Llamada
   - Email
   - WhatsApp
   - Reunion
   - Visita a propiedad
5. Escribe notas
6. Click en **"Guardar"**

> **Tip:** Mientras mas interacciones registres, mejor entiendes al cliente y mas preciso es el lead scoring.

### Enviar WhatsApp

1. Abre el lead
2. Click en icono de **WhatsApp** (verde)
3. Escribe mensaje o usa plantilla:
   - "Hola [Nombre], te envio info de la propiedad..."
4. Click en **"Enviar"**

> **Requisito:** Debes tener WhatsApp conectado (ver seccion Configuracion)

### Asignar Lead a Otro Agente

1. Abre el lead
2. En el campo **"Asignar a"**
3. Selecciona el agente del equipo
4. Click en **"Guardar"**
5. El agente recibe notificacion automatica

---

## Inbox - Mensajeria Unificada

### Que es el Inbox?

El Inbox centraliza todas tus conversaciones en un solo lugar: WhatsApp, email y mensajes internos.

### Usar el Inbox

1. Click en **"Inbox"** en el menu lateral
2. Veras la lista de conversaciones a la izquierda
3. Click en una conversacion para ver los mensajes
4. Escribe tu respuesta en el campo inferior
5. Click en **"Enviar"**

### Broadcast (Envio Masivo)

Para enviar mensajes a multiples contactos:

1. Ve a **"Inbox"** > **"Broadcast"**
2. Click en **"Crear Campana"**
3. Selecciona destinatarios (por filtros o manualmente)
4. Escribe el mensaje o usa plantilla
5. Click en **"Enviar Campana"**

> **Nota:** Usa el broadcast con responsabilidad para no saturar a tus contactos.

---

## Gestionar Tareas

### Crear Tarea

1. Click en **"Tareas"** > **"Nueva Tarea"**
2. Llena:

| Campo | Ejemplo |
|-------|---------|
| **Titulo** | Llamar a Juan Perez |
| **Descripcion** | Enviar info de casa en Polanco |
| **Prioridad** | Urgente / Alta / Normal / Baja |
| **Vencimiento** | 10 Feb 2026, 3:00 PM |
| **Asignar a** | Yo / Otro agente |
| **Relacionada con** | Lead: Juan Perez / Propiedad: Casa Polanco |

3. Click en **"Crear"**

### Completar Tarea

**Opcion 1: Rapida**
- Click en el checkbox junto a la tarea
- Se marca como completada automaticamente

**Opcion 2: Con notas**
1. Abre la tarea (click en titulo)
2. Agrega notas de cierre
3. Click en **"Marcar como Completada"**

### Ver Tareas

**Filtros disponibles:**

- **Todas** - Ver todo
- **Pendientes** - Solo sin completar
- **Completadas** - Solo completadas
- **Urgentes** - Solo alta prioridad
- **Mis tareas** - Solo asignadas a mi
- **Vencidas** - Tareas pasadas de fecha

> **Notificaciones:** Recibiras alerta 1 hora antes del vencimiento.

### Tareas Automaticas

El sistema puede generar tareas automaticamente basandose en:

- Nuevos leads asignados (tarea de primer contacto)
- Propiedades sin actividad (tarea de seguimiento)
- Tareas vencidas (recordatorio de escalacion)

---

## Ver Reportes y Analytics

### Dashboard Personal

Tu dashboard muestra:

**Metricas del mes actual:**
- Propiedades captadas
- Leads nuevos
- Tareas completadas
- Comisiones generadas

**Graficos (Recharts):**
- Conversion de leads por etapa (funnel)
- Propiedades por tipo (pie chart)
- Actividad diaria (line chart)
- Comparativa mensual (bar chart)

### Reportes Avanzados (Managers y Admins)

Si eres manager o admin, puedes ver:

1. Click en **"Reportes"** (menu lateral)
2. Selecciona tipo:
   - **Por agente** - Desempeno individual
   - **Por periodo** - Mes, trimestre, ano
   - **Por propiedad** - Mas vistas, mas contactadas
   - **Pipeline** - Estado general del funnel de ventas
3. Exportar a Excel o PDF

### Analytics en Tiempo Real

La seccion de **Analytics** muestra:

- KPIs del equipo actualizados en tiempo real
- Graficos interactivos con drill-down
- Comparativas entre periodos
- Tendencias y proyecciones

---

## Asistente IA - Cortex

### Que es Cortex?

Cortex es el asistente de inteligencia artificial integrado en Livoo CRM. Te ayuda con:

- **Recomendaciones de propiedades** para tus leads
- **Analisis de sentimiento** de conversaciones
- **Descripcion automatica** de propiedades
- **Sugerencias de precio** basadas en mercado
- **Clasificacion inteligente** de leads

### Usar Cortex

1. Click en el icono de **Cortex** (en la barra superior o menu lateral)
2. Escribe tu consulta en lenguaje natural:
   - "Recomienda propiedades para Juan Perez"
   - "Genera descripcion para esta casa"
   - "Analiza mis leads del mes"
3. Cortex procesa la consulta y te da resultados

---

## Pagina Publica de Propiedades

### Portal de Busqueda

Tus clientes pueden buscar propiedades en la pagina publica:

- **URL:** https://livoo-crm.vercel.app/propiedades
- Busqueda con filtros avanzados
- Vista de mapa interactivo
- Galeria de fotos de cada propiedad
- Formulario de contacto directo
- Compartir en redes sociales

### Otras Paginas Publicas

| Pagina | URL | Descripcion |
|--------|-----|-------------|
| **MLS** | /mls | Multiple Listing Service compartido |
| **Agencias** | /agencias | Directorio de agencias |
| **Valuacion** | /valuacion | Herramienta de valuacion |
| **Blog** | /blog | Contenido educativo |
| **Contacto** | /contacto | Formulario de contacto general |

---

## Configuracion

### Conectar WhatsApp

1. Click en tu **foto/nombre** (arriba derecha)
2. Click en **"Configuracion"**
3. Tab **"Integraciones"**
4. En WhatsApp, click en **"Conectar"**
5. Escanea el **codigo QR** con tu telefono:
   - Abre WhatsApp en tu celular
   - Ve a Menu > Dispositivos vinculados
   - Escanea el codigo

> **Nota:** La sesion dura aproximadamente 30 dias. Despues debes reconectar.

### Gestion de Equipo (Managers y Admins)

1. **Configuracion** > **Usuarios**
2. Puedes:
   - Agregar nuevos usuarios
   - Asignar roles (Admin, Manager, Agente, Viewer)
   - Desactivar cuentas
   - Ver actividad por usuario

### Roles y Permisos

| Rol | Propiedades | Leads | Tareas | Reportes | Config |
|-----|-------------|-------|--------|----------|--------|
| **Admin** | Todas | Todos | Todas | Todos | Total |
| **Manager** | Equipo | Equipo | Equipo | Equipo | Parcial |
| **Agente** | Propias | Propios | Propias | Propios | Personal |
| **Viewer** | Ver todo | Ver todo | Ver | Ver | No |

### Cambiar Foto de Perfil

1. **Configuracion** > **Perfil**
2. Click en tu foto actual
3. Selecciona nueva imagen
4. Click en **"Guardar"**

### Cambiar Contrasena

1. **Configuracion** > **Seguridad**
2. Ingresa contrasena actual
3. Ingresa nueva contrasena (min. 8 caracteres)
4. Confirma nueva contrasena
5. Click en **"Actualizar Contrasena"**

---

## Notificaciones

### Tipos de Notificaciones

Recibiras notificaciones cuando:

- Te asignan una tarea
- Una tarea vence pronto (1 hora antes)
- Te asignan un lead
- Una propiedad cambia de estado
- Alguien te menciona en un comentario
- Recibes un mensaje en el Inbox
- Un lead responde por WhatsApp

### Ver Notificaciones

1. Click en icono de **campana** arriba derecha
2. Se abre panel con notificaciones recientes
3. Click en notificacion para ir al detalle
4. Click en **"Marcar todas como leidas"** para limpiar

### Configurar Notificaciones

1. **Configuracion** > **Notificaciones**
2. Activa/desactiva segun prefieras:
   - Email (via Resend)
   - Push (en navegador)
   - WhatsApp
   - En sistema (campana)

### Notificaciones en Tiempo Real

Las notificaciones se entregan en tiempo real usando WebSocket. No necesitas refrescar la pagina para ver nuevas notificaciones.

---

## Ayuda y Soporte

### FAQs

**P: Cuantas propiedades puedo captar?**
R: Ilimitadas. No hay limite en el sistema.

**P: Puedo editar una propiedad despues de crearla?**
R: Si. Abre la propiedad > Click en "Editar" (icono de lapiz).

**P: Que pasa si olvido mi contrasena?**
R: En login, click en "Olvidaste tu contrasena?" > Recibiras email con link de reset.

**P: Puedo usar Livoo en mi celular?**
R: Si. El sistema es responsive y funciona en cualquier dispositivo con navegador.

**P: Los clientes pueden ver mis propiedades?**
R: Si. Las propiedades con estado "Activa" aparecen en la pagina publica de busqueda.

**P: Como funciona la seguridad de mis datos?**
R: Usamos encriptacion SSL, Row Level Security (RLS) en base de datos, y autenticacion JWT. Cada agencia solo ve sus propios datos.

Para mas preguntas, consulta la [Guia de FAQ completa](./FAQ.md).

### Contactar Soporte

- **Email:** soporte@livoo.mx
- **Chat:** Icono en esquina inferior derecha del sistema
- **Telefono:** 55 1234 5678 (Lun-Vie 9-6pm)
- **Seccion Ayuda:** Menu lateral > "Ayuda"

---

## Atajos de Teclado

| Atajo | Accion |
|-------|--------|
| `Ctrl + K` | Busqueda rapida global |
| `Ctrl + N` | Nueva propiedad |
| `Ctrl + L` | Nuevo lead |
| `Ctrl + T` | Nueva tarea |
| `/` | Ir a busqueda |

---

## Videos Tutoriales

1. [Introduccion a Livoo CRM (5 min)](./VIDEO_SCRIPTS.md#video-1-introduccion-a-livoo-crm-5-min)
2. [Captar tu primera propiedad (8 min)](./VIDEO_SCRIPTS.md#video-2-captar-tu-primera-propiedad-8-min)
3. [Gestionar leads eficientemente (10 min)](./VIDEO_SCRIPTS.md#video-3-gestionar-leads-y-pipeline-10-min)
4. [Conectar WhatsApp (3 min)](./VIDEO_SCRIPTS.md#video-4-conectar-whatsapp-y-enviar-mensajes-3-min)
5. [Reportes y metricas (7 min)](./VIDEO_SCRIPTS.md#video-5-reportes-y-metricas-7-min)

---

## Glosario

| Termino | Definicion |
|---------|-----------|
| **Lead** | Persona interesada en comprar o rentar |
| **Pipeline** | Flujo de etapas por las que pasa un lead |
| **Lead Scoring** | Puntaje automatico de calidad del lead |
| **Property Health** | Puntaje de completitud de una propiedad |
| **MLS** | Multiple Listing Service - propiedades compartidas entre agencias |
| **Broadcast** | Envio masivo de mensajes a multiples contactos |
| **Cortex** | Asistente de inteligencia artificial del CRM |
| **RLS** | Row Level Security - seguridad a nivel de fila en base de datos |

---

**Version:** 1.0
**Ultima actualizacion:** Febrero 2026
