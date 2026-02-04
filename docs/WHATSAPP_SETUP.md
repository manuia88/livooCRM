# 📱 Guía de Configuración de WhatsApp

**Esta guía te ayudará a conectar WhatsApp con tu CRM en producción.**

---

## ✅ **Pre-requisitos Completados**

- ✅ Bucket `whatsapp-sessions` creado en Supabase Storage
- ✅ Componente `WhatsAppConnect` agregado a la página de Inbox
- ✅ API endpoints de WhatsApp configurados
- ✅ Sistema de persistencia en Supabase Storage activo

---

## 🚀 **Pasos para Conectar WhatsApp**

### **1. Acceder a la Página de Inbox**

```
https://livoo-crm.vercel.app/backoffice/inbox
```

1. **Login** con tu usuario
2. Serás redirigido al backoffice
3. Haz click en **"Inbox"** en el menú lateral

---

### **2. Iniciar Conexión**

En la parte superior de la página verás el widget de **"WhatsApp Connection"**:

**Estado Inicial:**
```
┌─────────────────────────────────┐
│ 📱 WhatsApp Connection          │
│           DISCONNECTED          │
├─────────────────────────────────┤
│   No active session.            │
│                                 │
│   [Start Connection]            │
└─────────────────────────────────┘
```

**Acción:**
- Click en **"Start Connection"**

---

### **3. Escanear Código QR**

Después de hacer click, aparecerá un **código QR**:

```
┌─────────────────────────────────┐
│ 📱 WhatsApp Connection          │
│           DISCONNECTED          │
├─────────────────────────────────┤
│        ┌─────────┐              │
│        │ ▄▄ ▄▄ │              │
│        │ ██ ██ │              │
│        │ ▄▄ ▄▄ │              │
│        └─────────┘              │
│                                 │
│ Open WhatsApp > Settings >      │
│ Linked Devices > Link a Device  │
└─────────────────────────────────┘
```

**Acción:**
1. **Abre WhatsApp** en tu teléfono
2. Ve a **Configuración** (Settings)
3. Toca **"Dispositivos Vinculados"** (Linked Devices)
4. Toca **"Vincular un Dispositivo"** (Link a Device)
5. **Escanea el código QR** que aparece en pantalla

---

### **4. Verificar Conexión**

Una vez escaneado correctamente, el widget cambiará a:

```
┌─────────────────────────────────┐
│ 📱 WhatsApp Connection          │
│            CONNECTED ✅          │
├─────────────────────────────────┤
│         ✅                       │
│   Device Connected              │
│                                 │
└─────────────────────────────────┘
```

**¡Listo!** WhatsApp está conectado.

---

## 🔄 **Persistencia de Sesión**

### **Cómo Funciona:**

La sesión de WhatsApp se guarda automáticamente en **Supabase Storage**:

```
Bucket: whatsapp-sessions
├── creds.json (credenciales encriptadas)
└── keys/
    ├── app-state-sync-key-*.json
    ├── app-state-sync-version-*.json
    └── pre-key-*.json
```

**Ventajas:**
- ✅ La sesión persiste entre deployments
- ✅ No se pierde en cold starts de Vercel
- ✅ No necesitas reconectar cada vez

### **Verificar Almacenamiento:**

1. Ve a: **Supabase Dashboard** → **Storage** → `whatsapp-sessions`
2. Deberías ver los archivos de sesión

---

## 📤 **Enviar Mensajes de WhatsApp**

### **Desde el CRM:**

Una vez conectado, puedes enviar mensajes desde:

1. **Inbox** → Selecciona una conversación existente
2. **Contactos** → Click en contacto → "Enviar WhatsApp"
3. **Broadcasts** → Crear campaña de WhatsApp masiva

### **API Endpoint:**

También puedes usar el API endpoint:

```typescript
POST /api/whatsapp/send

Body:
{
  "phone": "+525512345678",
  "message": "Hola, ¿te interesa esta propiedad?"
}

Headers:
- Cookie: sb-access-token (autenticación)
```

---

## ⚠️ **Problemas Comunes**

### **1. "No active session" después de escanear**

**Solución:**
- Espera 5-10 segundos (el polling tarda 3 segundos)
- Recarga la página
- Si persiste, click en "Start Connection" nuevamente

---

### **2. QR Code no aparece**

**Verificar:**

1. **Logs de Vercel:**
   ```
   https://vercel.com/manuels-projects-b495aa85/livoo-crm/functions
   ```
   - Busca errores en `/api/whatsapp/status`

2. **Variables de entorno:**
   - `SUPABASE_SERVICE_ROLE_KEY` debe estar configurada en Vercel

---

### **3. "Device Connected" pero no envía mensajes**

**Verificar:**

1. **Bucket de Storage:**
   - Ve a Supabase → Storage → `whatsapp-sessions`
   - Debe tener archivos `creds.json` y `keys/`

2. **Logs de Supabase:**
   - Ve a Supabase Dashboard → Logs
   - Busca errores en Storage

---

### **4. Sesión se pierde después de deployment**

**Esto NO debería pasar** porque usamos Supabase Storage.

**Si pasa:**

1. Verifica que `NODE_ENV=production` en Vercel
2. Verifica que el bucket `whatsapp-sessions` existe
3. Re-ejecuta el setup:
   ```bash
   npm run setup-whatsapp-storage
   ```

---

## 🔐 **Seguridad**

### **Consideraciones:**

1. **Service Role Key:**
   - Solo se usa en server-side
   - NUNCA se expone al cliente
   - Solo en Vercel environment variables

2. **Bucket privado:**
   - El bucket `whatsapp-sessions` es **privado**
   - Solo accesible con service_role_key
   - Archivos encriptados

3. **Rate Limiting:**
   - El endpoint `/api/whatsapp/send` tiene rate limiting
   - Máximo 10 mensajes por minuto por usuario

---

## 📊 **Monitoreo**

### **Verificar Estado de Conexión:**

```bash
curl https://livoo-crm.vercel.app/api/whatsapp/status
```

**Respuestas:**

```json
// Conectado
{
  "status": "connected",
  "qr": null
}

// Desconectado con QR
{
  "status": "disconnected",
  "qr": "2@xxxxx..."
}

// Desconectado sin QR
{
  "status": "disconnected",
  "qr": null
}
```

---

## 🛠️ **Mantenimiento**

### **Reconectar WhatsApp:**

Si la sesión se desconecta por alguna razón:

1. Ve a `/backoffice/inbox`
2. Click en "Start Connection"
3. Escanea el nuevo QR code

### **Limpiar Sesión (Solo para troubleshooting):**

Si necesitas limpiar la sesión completamente:

1. **Supabase Dashboard** → **Storage** → `whatsapp-sessions`
2. **Eliminar todos los archivos**
3. **Reconectar** desde el CRM

---

## ✅ **Checklist Post-Conexión**

- [ ] QR code escaneado correctamente
- [ ] Estado muestra "Connected"
- [ ] Archivos de sesión en Supabase Storage
- [ ] Puedo enviar mensaje de prueba
- [ ] Mensaje llega al destinatario
- [ ] Sesión persiste después de recargar página

---

## 📚 **Recursos Adicionales**

- **Baileys Documentation:** https://github.com/WhiskeySockets/Baileys
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp

---

## 🎉 **¡Listo!**

Tu WhatsApp está ahora integrado con el CRM.

**Puedes:**
- ✅ Enviar mensajes individuales
- ✅ Crear campañas masivas (broadcasts)
- ✅ Ver historial de conversaciones
- ✅ Responder desde el inbox

---

**Documentado el:** 3 de Febrero, 2026
