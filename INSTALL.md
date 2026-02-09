# INSTALACION - WHATSAPP + AUTOMATIZACION

## PASO 1: Instalar dependencias

```bash
cd tu-proyecto
npm install
```

## PASO 2: Crear carpetas

```bash
mkdir -p src/lib/whatsapp
mkdir -p src/components/whatsapp
mkdir -p src/app/api/whatsapp/{connect,status,send,disconnect}
mkdir -p .data/whatsapp-auth
mkdir -p supabase/migrations
```

## PASO 3: Copiar todos los archivos

Copia cada archivo del codigo anterior a su ubicacion correspondiente.

## PASO 4: Aplicar migraciones

```bash
npm run supabase:migrate
```

O desde Supabase Dashboard > SQL Editor:
1. Ejecuta `20260209_whatsapp_sessions.sql`
2. Ejecuta `20260209_automation_tables.sql`

## PASO 5: Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y agrega tus credenciales de Supabase.

```bash
cp .env.local.example .env.local
```

## PASO 6: Iniciar aplicacion

```bash
npm run dev
```

## PASO 7: Probar

1. Ve a: http://localhost:3000/backoffice/inbox
2. Click en "Start Connection"
3. Debe aparecer QR en 5-10 segundos
4. Escanea con WhatsApp
5. Estado debe cambiar a "Connected"

## Troubleshooting

### QR no aparece

```bash
# Ver logs
npm run dev

# Limpiar sesion
rm -rf .data/whatsapp-auth/*
npm run dev
```

### Error de permisos

```bash
chmod -R 755 .data/
```

## Docker (Opcional)

```bash
docker-compose up -d
```

Accede a n8n en: http://localhost:5678
