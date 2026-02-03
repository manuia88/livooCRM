#!/usr/bin/env tsx

/**
 * Script de Validación de Configuración
 * 
 * Valida que todas las variables de entorno y configuraciones
 * necesarias estén correctamente configuradas antes de deployment.
 * 
 * USO:
 * npm run validate-config
 * 
 * O en CI/CD:
 * npx tsx scripts/validate-config.ts
 */

import { validateSupabaseConfig } from '../src/lib/supabase/server-admin'

interface ValidationResult {
  section: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const results: ValidationResult[] = []

// ============================================================================
// 1. VALIDAR SUPABASE
// ============================================================================

function validateSupabase(): ValidationResult {
  console.log('🔍 Validando configuración de Supabase...')
  
  const result = validateSupabaseConfig()
  
  return {
    section: 'Supabase',
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings
  }
}

// ============================================================================
// 2. VALIDAR NODE_ENV
// ============================================================================

function validateEnvironment(): ValidationResult {
  console.log('🔍 Validando entorno...')
  
  const errors: string[] = []
  const warnings: string[] = []
  
  const nodeEnv = process.env.NODE_ENV
  
  if (!nodeEnv) {
    errors.push('NODE_ENV no está configurado')
  }
  
  if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    warnings.push(`NODE_ENV tiene un valor inusual: ${nodeEnv}`)
  }
  
  // Validar que en producción no haya configs de desarrollo
  if (nodeEnv === 'production') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      errors.push('SUPABASE_URL apunta a localhost en producción')
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY es requerida en producción')
    }
  }
  
  return {
    section: 'Environment',
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// 3. VALIDAR WHATSAPP (OPCIONAL)
// ============================================================================

function validateWhatsApp(): ValidationResult {
  console.log('🔍 Validando configuración de WhatsApp...')
  
  const errors: string[] = []
  const warnings: string[] = []
  
  // WhatsApp es opcional, pero si se usa en producción necesita Storage
  if (process.env.NODE_ENV === 'production') {
    // En producción, WhatsApp debe usar Supabase Storage
    warnings.push(
      'WhatsApp en producción requiere bucket "whatsapp-sessions" en Supabase Storage'
    )
  }
  
  return {
    section: 'WhatsApp',
    isValid: true, // WhatsApp es opcional
    errors,
    warnings
  }
}

// ============================================================================
// 4. VALIDAR SEGURIDAD
// ============================================================================

function validateSecurity(): ValidationResult {
  console.log('🔍 Validando configuración de seguridad...')
  
  const errors: string[] = []
  const warnings: string[] = []
  
  // Verificar que CRON_SECRET existe si se usan cron jobs
  if (!process.env.CRON_SECRET) {
    warnings.push('CRON_SECRET no está configurado (necesario para cron jobs)')
  }
  
  // En producción, validaciones adicionales
  if (process.env.NODE_ENV === 'production') {
    // Verificar longitud mínima de secrets
    if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 32) {
      errors.push('CRON_SECRET debe tener al menos 32 caracteres en producción')
    }
  }
  
  return {
    section: 'Security',
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// 5. EJECUTAR VALIDACIONES
// ============================================================================

async function runValidations() {
  console.log('🚀 Iniciando validación de configuración...\n')
  console.log('═'.repeat(60))
  console.log('\n')
  
  // Ejecutar todas las validaciones
  results.push(validateSupabase())
  results.push(validateEnvironment())
  results.push(validateWhatsApp())
  results.push(validateSecurity())
  
  console.log('\n')
  console.log('═'.repeat(60))
  console.log('\n')
  
  // Mostrar resultados
  let hasErrors = false
  let hasWarnings = false
  
  results.forEach(result => {
    const icon = result.isValid ? '✅' : '❌'
    console.log(`${icon} ${result.section}`)
    
    if (result.errors.length > 0) {
      hasErrors = true
      result.errors.forEach(error => {
        console.log(`   ❌ ERROR: ${error}`)
      })
    }
    
    if (result.warnings.length > 0) {
      hasWarnings = true
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  WARNING: ${warning}`)
      })
    }
    
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      console.log('   ✓ Todo correcto')
    }
    
    console.log('')
  })
  
  // Resumen final
  console.log('═'.repeat(60))
  console.log('\n')
  
  if (hasErrors) {
    console.log('❌ VALIDACIÓN FALLIDA')
    console.log('\nHay errores que deben corregirse antes de deployment.')
    console.log('Por favor, revisa los errores arriba y corrige la configuración.\n')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  VALIDACIÓN CON WARNINGS')
    console.log('\nNo hay errores críticos, pero hay warnings que deberías revisar.')
    console.log('Puedes continuar con el deployment, pero considera resolver los warnings.\n')
    process.exit(0)
  } else {
    console.log('✅ VALIDACIÓN EXITOSA')
    console.log('\nTodas las configuraciones están correctas.')
    console.log('El proyecto está listo para deployment.\n')
    process.exit(0)
  }
}

// Ejecutar
runValidations().catch(error => {
  console.error('\n❌ Error durante validación:', error)
  process.exit(1)
})
