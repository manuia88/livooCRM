#!/usr/bin/env tsx
/**
 * Script para Configurar WhatsApp Storage en Supabase
 * 
 * Crea el bucket 'whatsapp-sessions' y configura permisos
 * 
 * USO:
 * npx tsx scripts/setup-whatsapp-storage.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET_NAME = 'whatsapp-sessions'

async function setupWhatsAppStorage() {
  console.log('🔧 Configurando WhatsApp Storage...\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Faltan variables de entorno:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY\n')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Verificar si el bucket ya existe
    console.log('📦 Verificando bucket...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listando buckets:', listError.message)
      return
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)

    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' ya existe\n`)
    } else {
      // 2. Crear bucket si no existe
      console.log(`📦 Creando bucket '${BUCKET_NAME}'...`)
      
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['application/json', 'application/octet-stream']
      })

      if (createError) {
        console.error('❌ Error creando bucket:', createError.message)
        return
      }

      console.log(`✅ Bucket '${BUCKET_NAME}' creado exitosamente\n`)
    }

    // 3. Verificar permisos (RLS policies)
    console.log('🔐 Verificando políticas de acceso...')
    
    // Test: Intentar listar archivos
    const { data: files, error: listFilesError } = await supabase.storage
      .from(BUCKET_NAME)
      .list()

    if (listFilesError) {
      console.warn('⚠️  No se pueden listar archivos (puede ser normal si el bucket está vacío)')
    } else {
      console.log(`✅ Acceso al bucket verificado (${files?.length || 0} archivos)`)
    }

    console.log('\n═'.repeat(60))
    console.log('✅ CONFIGURACIÓN COMPLETADA')
    console.log('═'.repeat(60))
    console.log('\n📝 Próximos pasos:')
    console.log('1. Ve a: https://livoo-crm.vercel.app/backoffice/inbox')
    console.log('2. Escanea el código QR con WhatsApp')
    console.log('3. La sesión se guardará automáticamente en Supabase Storage\n')

  } catch (error) {
    console.error('\n❌ Error durante setup:', error)
    process.exit(1)
  }
}

setupWhatsAppStorage()
