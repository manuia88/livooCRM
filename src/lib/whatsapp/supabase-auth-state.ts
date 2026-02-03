/**
 * Supabase Auth State Adapter para Baileys (WhatsApp)
 * 
 * Reemplaza useMultiFileAuthState para persistir la sesión
 * de WhatsApp en Supabase Storage en lugar del filesystem local.
 * 
 * VENTAJAS:
 * - Sesión persiste entre deployments
 * - Compatible con Vercel Serverless
 * - No se pierde en cold starts
 * 
 * USO:
 * const { state, saveCreds } = await useSupabaseAuthState(supabase, 'bucket-name')
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON,
  proto
} from '@whiskeysockets/baileys'

const CREDS_FILE = 'creds.json'
const KEYS_PREFIX = 'keys/'

interface SupabaseAuthStateOptions {
  bucketName: string
  folderPath?: string
}

/**
 * Crea un auth state que usa Supabase Storage para persistencia
 * 
 * @param supabase Cliente de Supabase con SERVICE_ROLE_KEY
 * @param options Configuración del bucket y carpeta
 * @returns {Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }>}
 */
export async function useSupabaseAuthState(
  supabase: SupabaseClient,
  options: SupabaseAuthStateOptions
): Promise<{
  state: AuthenticationState
  saveCreds: () => Promise<void>
}> {
  const { bucketName, folderPath = 'whatsapp-session' } = options

  // Función helper para construir paths
  const getPath = (filename: string) => `${folderPath}/${filename}`

  /**
   * Lee un archivo desde Supabase Storage
   */
  const readData = async (file: string): Promise<any> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(getPath(file))

      if (error) {
        if (error.message.includes('not found')) {
          return null
        }
        throw error
      }

      const text = await data.text()
      return JSON.parse(text, BufferJSON.reviver)
    } catch (error) {
      console.log(`No se pudo leer ${file}:`, error)
      return null
    }
  }

  /**
   * Escribe un archivo a Supabase Storage
   */
  const writeData = async (file: string, data: any): Promise<void> => {
    const json = JSON.stringify(data, BufferJSON.replacer, 2)
    const blob = new Blob([json], { type: 'application/json' })

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(getPath(file), blob, {
        upsert: true,
        contentType: 'application/json'
      })

    if (error) {
      console.error(`Error escribiendo ${file}:`, error)
      throw error
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   */
  const removeData = async (file: string): Promise<void> => {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([getPath(file)])

    if (error) {
      console.error(`Error eliminando ${file}:`, error)
    }
  }

  // Cargar credenciales o crear nuevas
  let creds: AuthenticationCreds = (await readData(CREDS_FILE)) || initAuthCreds()

  // State de autenticación
  const state: AuthenticationState = {
    creds,
    keys: {
      get: async (type, ids) => {
        const data: { [id: string]: SignalDataTypeMap[typeof type] } = {}

        await Promise.all(
          ids.map(async (id) => {
            let value = await readData(`${KEYS_PREFIX}${type}-${id}.json`)
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value)
            }
            data[id] = value
          })
        )

        return data
      },
      set: async (data) => {
        const tasks: Promise<void>[] = []

        for (const category in data) {
          for (const id in data[category]) {
            const value = data[category][id]
            const file = `${KEYS_PREFIX}${category}-${id}.json`

            if (value) {
              tasks.push(writeData(file, value))
            } else {
              tasks.push(removeData(file))
            }
          }
        }

        await Promise.all(tasks)
      }
    }
  }

  /**
   * Guarda las credenciales actualizadas
   */
  const saveCreds = async () => {
    await writeData(CREDS_FILE, creds)
  }

  return {
    state,
    saveCreds
  }
}

/**
 * Crea el bucket de WhatsApp si no existe
 * 
 * @param supabase Cliente de Supabase con SERVICE_ROLE_KEY
 * @param bucketName Nombre del bucket
 */
export async function ensureWhatsAppBucket(
  supabase: SupabaseClient,
  bucketName: string
): Promise<void> {
  // Verificar si el bucket existe
  const { data: buckets } = await supabase.storage.listBuckets()
  
  const exists = buckets?.some(b => b.name === bucketName)
  
  if (!exists) {
    console.log(`Creando bucket ${bucketName}...`)
    
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/json']
    })

    if (error && !error.message.includes('already exists')) {
      console.error('Error creando bucket:', error)
      throw error
    }

    console.log(`Bucket ${bucketName} creado exitosamente`)
  }
}

/**
 * Limpia la sesión de WhatsApp (útil para logout/reset)
 * 
 * @param supabase Cliente de Supabase con SERVICE_ROLE_KEY
 * @param options Configuración del bucket y carpeta
 */
export async function clearWhatsAppSession(
  supabase: SupabaseClient,
  options: SupabaseAuthStateOptions
): Promise<void> {
  const { bucketName, folderPath = 'whatsapp-session' } = options

  try {
    // Listar todos los archivos en la carpeta
    const { data: files } = await supabase.storage
      .from(bucketName)
      .list(folderPath)

    if (!files || files.length === 0) {
      console.log('No hay archivos de sesión para limpiar')
      return
    }

    // Eliminar todos los archivos
    const paths = files.map(f => `${folderPath}/${f.name}`)
    const { error } = await supabase.storage
      .from(bucketName)
      .remove(paths)

    if (error) {
      console.error('Error limpiando sesión:', error)
      throw error
    }

    console.log('Sesión de WhatsApp limpiada exitosamente')
  } catch (error) {
    console.error('Error en clearWhatsAppSession:', error)
    throw error
  }
}
