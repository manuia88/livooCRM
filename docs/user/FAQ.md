# Preguntas Frecuentes - Livoo CRM

## Propiedades

### Cuantas propiedades puedo captar?
Ilimitadas. No hay limite en el numero de propiedades por agente ni por agencia.

### Puedo editar una propiedad despues de crearla?
Si. Abre la propiedad y click en el icono de lapiz para editar cualquier campo.

### Como elimino una propiedad?
No se eliminan permanentemente. Se marcan como "Inactiva" o "Archivada". Esto preserva el historial y las relaciones con leads.

### Por que no aparece mi propiedad en busqueda publica?
Verifica que:
- El estado sea "Activa" (no Borrador, Inactiva o Archivada)
- Tenga al menos 1 foto subida
- Tenga precio definido (mayor a 0)
- La ubicacion este correctamente marcada en el mapa

### Que formatos de foto acepta?
JPG, PNG y WebP. Maximo 10MB por foto. El sistema optimiza automaticamente a WebP/AVIF para carga rapida en web.

### Cuantas fotos debo subir?
Minimo 5 para una buena presentacion, ideal 10-15. Las propiedades con mas fotos reciben mas vistas y mejor Property Health Score.

### Puedo reordenar las fotos?
Si. Arrastra las miniaturas en el Paso 3 del wizard o en la edicion de la propiedad. La primera foto es siempre la portada.

### Las fotos se comprimen automaticamente?
Si. El sistema usa Sharp para optimizar automaticamente todas las fotos a WebP/AVIF, reduciendo tamano sin perder calidad visible.

### Que es el Property Health Score?
Es un puntaje de 0-100 que indica que tan completa y atractiva es tu propiedad. Para mejorarlo:
- Agrega mas fotos (minimo 5)
- Completa todos los campos del formulario
- Escribe una descripcion detallada
- Agrega todas las amenidades relevantes
- Verifica la ubicacion en el mapa

### En que portales se publica mi propiedad?
Puedes seleccionar entre: Inmuebles24, Vivanuncios, Lamudi y Propiedades.com. La publicacion es automatica al crear la propiedad.

### Puedo exportar mi lista de propiedades?
Si. En la lista de propiedades, selecciona las que deseas y click en "Exportar" para descargar en formato Excel o PDF.

### Que tipos de propiedad puedo captar?
Casa, Departamento, Terreno, Oficina, Local y otros tipos configurables.

### Puedo importar propiedades masivamente?
Si. En Propiedades hay opcion de importacion masiva desde archivos Excel o mediante web scraping de portales.

---

## Leads y Contactos

### Que es un lead?
Una persona interesada en comprar, vender o rentar una propiedad. Es el primer paso del proceso de venta.

### Que tipos de contacto existen?
- **Comprador:** Busca comprar propiedad
- **Vendedor:** Quiere vender su propiedad
- **Arrendatario:** Busca rentar
- **Arrendador:** Ofrece propiedad en renta
- **Inversionista:** Busca oportunidades de inversion

### Como califico un lead?
Muevelo a la etapa "Calificado" cuando confirmes que tiene interes real y presupuesto adecuado. El Lead Scoring automatico tambien ayuda a priorizar.

### Puedo asignar un lead a otro agente?
Si. Abre el lead > campo "Asignar a" > Selecciona agente > Guardar. El agente recibe notificacion automatica.

### Que es el Lead Scoring?
Puntaje automatico (0-100) que el sistema calcula basandose en:
- **Actividad:** Frecuencia de interacciones registradas
- **Interes:** Nivel de engagement demostrado
- **Presupuesto:** Si coincide con propiedades disponibles
- **Urgencia:** Tiempo estimado para tomar decision

Leads con puntaje alto aparecen prioritarios en tu lista.

### Como envio WhatsApp a un lead?
1. Primero conecta tu WhatsApp (Configuracion > Integraciones)
2. Abre el lead > Click en icono de WhatsApp (verde)
3. Escribe mensaje o selecciona plantilla > Enviar

### Se registran automaticamente las interacciones?
Los WhatsApps enviados desde el sistema se registran automaticamente. Llamadas, emails externos y reuniones debes registrarlos manualmente.

### Cuando debo registrar una interaccion?
Cada vez que contactes al lead: llamada, email, WhatsApp, reunion, visita. Mientras mas interacciones registres, mas preciso es el Lead Scoring.

### Puedo ver historial completo de un lead?
Si. Abre el lead > scroll a "Historial de Interacciones". Veras todas las interacciones registradas en orden cronologico.

### Cuales son las etapas del pipeline?
1. **Nuevo** - Sin contactar
2. **Contactado** - Primer contacto realizado
3. **Calificado** - Interes y presupuesto confirmados
4. **Presentacion** - Se mostraron propiedades
5. **Negociacion** - Negociando precio/condiciones
6. **Cerrado** - Venta/renta concretada

---

## Tareas

### Cuantas tareas puedo tener activas?
Ilimitadas, aunque recomendamos mantener menos de 20 activas por persona para buena gestion.

### Que pasa si no completo una tarea a tiempo?
Aparece marcada como "Vencida" en rojo. No hay penalizacion automatica, pero tu manager puede ver las tareas vencidas en reportes.

### Puedo asignar tareas a mi equipo?
Si, si tienes rol de Manager o Admin. Los Agentes solo pueden crear tareas para si mismos.

### Recibo recordatorios de tareas?
Si. El sistema envia notificacion 1 hora antes del vencimiento por los canales que tengas activados (push, email, WhatsApp).

### Puedo ver tareas de todo mi equipo?
Si, si eres Manager o Admin. Los Agentes solo ven sus propias tareas.

### Como marco una tarea como completada?
Click en el checkbox junto a la tarea para completacion rapida, o abre la tarea para agregar notas de cierre antes de completar.

### Que son las tareas automaticas?
El sistema puede generar tareas automaticamente basandose en reglas como:
- Nuevo lead asignado > Tarea de primer contacto
- Propiedad sin actividad > Tarea de seguimiento
- Tarea vencida > Recordatorio de escalacion

### Puedo relacionar una tarea con un lead o propiedad?
Si. Al crear o editar la tarea, usa el campo "Relacionada con" para vincularla a un lead, propiedad u otro elemento.

---

## Inbox y Mensajeria

### Que es el Inbox?
Es la bandeja de mensajeria unificada que centraliza todas tus conversaciones: WhatsApp, email y mensajes internos en un solo lugar.

### Que es el Broadcast?
Es la funcion de envio masivo que permite enviar mensajes a multiples contactos simultaneamente. Util para campanas, avisos y seguimiento a escala.

### Puedo enviar archivos por el Inbox?
Si. Puedes adjuntar fotos, documentos y otros archivos al enviar mensajes.

### Los mensajes de WhatsApp se sincronizan en tiempo real?
Si. Una vez conectado, los mensajes entrantes y salientes se sincronizan automaticamente via WebSocket.

---

## Reportes y Analytics

### Los reportes son en tiempo real?
Si. El dashboard y analytics se actualizan automaticamente via WebSocket. No necesitas refrescar la pagina.

### Puedo exportar reportes?
Si (Managers y Admins). Click en "Exportar" para descargar en Excel o PDF.

### Que periodo muestran los reportes?
Por defecto el mes actual. Puedes cambiar el rango de fechas: semana, mes, trimestre, ano, o rango personalizado.

### Puedo comparar mi desempeno con otros agentes?
Los Managers y Admins pueden ver comparativas entre agentes. Los Agentes solo ven sus propias metricas.

### Que metricas puedo ver en el dashboard?
- Propiedades: captadas, activas, vendidas, rentadas
- Leads: nuevos, calificados, tasa de conversion
- Tareas: pendientes, completadas, vencidas
- Comisiones: generadas en el periodo
- Graficos de tendencias y distribucion

---

## Notificaciones

### Que tipos de notificaciones recibo?
- Tareas asignadas a ti
- Tareas proximas a vencer (1 hora antes)
- Leads asignados a ti
- Cambios de estado en propiedades
- Menciones en comentarios
- Mensajes nuevos en Inbox
- Respuestas de leads por WhatsApp

### Puedo desactivar notificaciones?
Si. Configuracion > Notificaciones > Activa/desactiva por tipo y canal (email, push, WhatsApp, en sistema).

### Recibo notificaciones por email?
Solo si esta activado en Configuracion > Notificaciones. El sistema usa Resend para emails transaccionales.

### Las notificaciones son en tiempo real?
Si. Usan Supabase Realtime (WebSocket) para entrega instantanea. Aparecen en la campana sin necesidad de refrescar.

---

## Configuracion y Cuenta

### Como cambio mi contrasena?
Configuracion > Seguridad > Cambiar contrasena. Necesitas la contrasena actual para cambiarla.

### Como actualizo mi foto de perfil?
Configuracion > Perfil > Click en foto actual > Seleccionar nueva imagen > Guardar.

### Puedo cambiar mi email?
No directamente. Contacta al administrador de tu agencia para cambiarlo.

### Como conecto WhatsApp?
Configuracion > Integraciones > WhatsApp > Click "Conectar" > Escanear codigo QR con tu celular (WhatsApp > Menu > Dispositivos vinculados).

### Cuanto dura la sesion de WhatsApp?
Aproximadamente 30 dias. Despues de ese periodo necesitas reconectar escaneando un nuevo codigo QR.

### Puedo usar Livoo en movil?
Si. El sistema es completamente responsive y funciona en cualquier navegador movil (Chrome, Safari, Firefox).

### Cuanto dura mi sesion de login?
30 dias de inactividad. Si no usas el sistema en ese periodo, deberas iniciar sesion nuevamente.

---

## Seguridad

### Mis datos estan seguros?
Si. El sistema usa:
- Encriptacion SSL/TLS para toda la comunicacion
- Row Level Security (RLS) en base de datos: cada agencia solo ve sus datos
- Autenticacion JWT via Supabase Auth
- Headers de seguridad (CSP, CORS)
- Rate limiting para prevenir abuso

### Quien puede ver mis propiedades?
- **Admin/Manager:** Todas las propiedades de la agencia
- **Agente:** Solo las propiedades asignadas
- **Publico:** Solo propiedades con estado "Activa" en la pagina publica

### Quien puede ver mis leads?
- **Admin/Manager:** Todos los leads de la agencia
- **Agente:** Solo los leads asignados

### Puedo compartir mi contrasena?
No. Cada usuario debe tener su propia cuenta con credenciales unicas. Compartir credenciales compromete la seguridad y el registro de auditoria.

### Que hago si olvido mi contrasena?
En la pagina de login, click en "Olvidaste tu contrasena?" > Ingresa tu email > Recibiras un link de reset por correo.

### Existe registro de auditoria?
Si. El sistema mantiene logs de todas las acciones importantes: creacion, edicion, eliminacion de registros, cambios de estado, etc.

---

## Asistente IA - Cortex

### Que es Cortex?
Es el asistente de inteligencia artificial integrado en Livoo CRM, basado en Google AI (Gemini) y LangChain.

### Que puede hacer Cortex?
- Recomendar propiedades para tus leads
- Generar descripciones automaticas de propiedades
- Analizar sentimiento de conversaciones
- Sugerir precios basados en mercado
- Clasificar leads inteligentemente
- Responder consultas en lenguaje natural

### Como uso Cortex?
Click en el icono de Cortex > Escribe tu consulta en lenguaje natural. Ejemplo: "Recomienda propiedades para Juan Perez" o "Genera descripcion para esta casa".

### Cortex tiene acceso a mis datos?
Si, dentro de tu agencia. Usa los datos de propiedades y leads para generar recomendaciones relevantes, respetando los permisos de seguridad.

---

## MLS (Multiple Listing Service)

### Que es el MLS?
Es un servicio que permite compartir propiedades entre diferentes agencias. Las propiedades publicadas en MLS son visibles para agentes de otras agencias.

### Como publico en MLS?
Al crear o editar una propiedad, activa la opcion de compartir en MLS. La propiedad aparecera en el directorio compartido (/mls).

### Puedo ver propiedades de otras agencias?
Si, las que esten publicadas en MLS. Accede via Menu > MLS o la pagina publica /mls.

---

## Problemas Tecnicos

### No puedo iniciar sesion
1. Verifica que email y contrasena sean correctos
2. Intenta reset de contrasena
3. Verifica tu conexion a internet
4. Prueba en modo incognito del navegador
5. Contacta soporte si persiste

### No carga el dashboard
1. Refresca la pagina (F5 o Ctrl+R)
2. Limpia cache del navegador
3. Intenta en modo incognito
4. Verifica conexion a internet
5. Contacta soporte si persiste

### No puedo subir fotos
- Verifica que el tamano sea menor a 10MB por foto
- Verifica que el formato sea JPG, PNG o WebP
- Verifica tu conexion a internet
- Intenta con otra foto para descartar problema del archivo
- Si persiste, contacta soporte

### El mapa no se ve
- Verifica tu conexion a internet (el mapa requiere conexion)
- Refresca la pagina
- Intenta en otro navegador (Chrome recomendado)
- Desactiva extensiones que bloqueen scripts
- Contacta soporte si persiste

### WhatsApp no conecta
- Verifica que tu celular tenga internet
- Verifica que WhatsApp este actualizado en tu celular
- Intenta desconectar y volver a escanear el QR
- Verifica que no tengas mas de 4 dispositivos vinculados
- Contacta soporte si persiste

### Las notificaciones no llegan
- Verifica que esten activadas en Configuracion > Notificaciones
- Para notificaciones push: permite notificaciones del sitio en tu navegador
- Para email: verifica tu carpeta de spam
- Para WhatsApp: verifica que este conectado
- Contacta soporte si persiste

### El sistema esta lento
- Refresca la pagina
- Cierra pestanas innecesarias del navegador
- Limpia cache del navegador
- Verifica tu velocidad de internet
- Si el problema persiste para todos los usuarios, contacta soporte

---

## Contacto

### Como contacto a soporte?
- **Email:** soporte@livoo.mx
- **Chat:** Widget en esquina inferior derecha del sistema
- **Telefono:** 55 1234 5678 (Lun-Vie 9am-6pm)
- **Seccion Ayuda:** Menu lateral > Ayuda

### Tiempo de respuesta de soporte?
- **Chat:** Menos de 5 minutos
- **Email:** Menos de 2 horas (en horario laboral)
- **Telefono:** Inmediato (en horario laboral)

### Donde reporto un bug?
Contacta a soporte por cualquiera de los canales anteriores. Incluye:
- Que estabas haciendo cuando ocurrio
- Que esperabas que pasara
- Que paso en su lugar
- Capturas de pantalla si es posible

---

**No encontraste tu respuesta?**
Envia tu pregunta a: soporte@livoo.mx
