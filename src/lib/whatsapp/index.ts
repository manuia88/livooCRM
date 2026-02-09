/**
 * WhatsApp Client - Baileys Singleton
 *
 * Provides a single persistent WhatsApp connection per process.
 * Uses Supabase for session state (QR, status) and message logging.
 * Uses file-based auth state for Baileys credentials (dev) or
 * Supabase Storage (production).
 *
 * Usage:
 *   import { getWhatsAppSocket, sendMessage, getConnectionStatus, disconnect } from '@/lib/whatsapp'
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  WASocket,
  proto,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import P from 'pino'
import path from 'path'
import { createServerAdminClient } from '@/lib/supabase/server-admin'
import { useSupabaseAuthState, ensureWhatsAppBucket } from './supabase-auth-state'

// ---------------------------------------------------------------------------
// Global singleton state (survives hot-reloads in dev via globalThis)
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __waSocket: WASocket | null
  // eslint-disable-next-line no-var
  var __waConnecting: boolean
  // eslint-disable-next-line no-var
  var __waReconnectAttempts: number
}

globalThis.__waSocket ??= null
globalThis.__waConnecting ??= false
globalThis.__waReconnectAttempts ??= 0

const MAX_RECONNECT_ATTEMPTS = 5
const STORAGE_BUCKET = 'whatsapp-sessions'
const USE_SUPABASE_STORAGE = process.env.NODE_ENV === 'production'

function getSupabase() {
  return createServerAdminClient()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get or create the singleton WhatsApp socket.
 * If already connected, returns the existing socket immediately.
 * If connecting, waits until the current attempt finishes.
 */
export async function getWhatsAppSocket(): Promise<WASocket> {
  console.log('[WhatsApp] getWhatsAppSocket called', {
    hasSocket: !!globalThis.__waSocket,
    hasUser: !!globalThis.__waSocket?.user,
    isConnecting: globalThis.__waConnecting,
  })

  if (globalThis.__waSocket?.user) {
    return globalThis.__waSocket
  }

  if (globalThis.__waConnecting) {
    // Wait for the in-progress connection attempt
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return getWhatsAppSocket()
  }

  globalThis.__waConnecting = true

  try {
    const socket = await createWhatsAppClient()
    globalThis.__waSocket = socket
    globalThis.__waReconnectAttempts = 0
    return socket
  } catch (error) {
    console.error('[WhatsApp] Failed to create socket:', error)
    throw error
  } finally {
    globalThis.__waConnecting = false
  }
}

/**
 * Send a text (or image) message and persist it to the database.
 */
export async function sendMessage(
  phoneNumber: string,
  message: string,
  options?: { mediaUrl?: string; contactId?: string; agencyId?: string }
): Promise<proto.WebMessageInfo | undefined> {
  console.log('[WhatsApp] Sending message:', { phoneNumber, hasMedia: !!options?.mediaUrl })

  const sock = await getWhatsAppSocket()
  const supabase = getSupabase()

  const jid = phoneNumber.includes('@')
    ? phoneNumber
    : `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`

  const cleanPhone = phoneNumber.replace(/\D/g, '')

  try {
    let result: proto.WebMessageInfo | undefined

    if (options?.mediaUrl) {
      const response = await fetch(options.mediaUrl)
      const buffer = await response.arrayBuffer()
      result = await sock.sendMessage(jid, {
        image: Buffer.from(buffer),
        caption: message,
      })
    } else {
      result = await sock.sendMessage(jid, { text: message })
    }

    // Log outbound message
    await supabase.from('whatsapp_messages').insert({
      agency_id: options?.agencyId,
      contact_id: options?.contactId || null,
      phone_number: cleanPhone,
      message: message,
      message_type: options?.mediaUrl ? 'image' : 'text',
      media_url: options?.mediaUrl,
      direction: 'outbound',
      status: 'sent',
      whatsapp_message_id: result?.key?.id,
      metadata: { timestamp: Date.now() },
    })

    // Also log to contact_interactions if we have a contactId
    if (options?.contactId) {
      await supabase.from('contact_interactions').insert({
        contact_id: options.contactId,
        interaction_type: 'message',
        channel: 'whatsapp',
        notes: message,
        metadata: {
          phone_number: cleanPhone,
          whatsapp_message_id: result?.key?.id,
        },
      })
    }

    console.log('[WhatsApp] Message sent successfully')
    return result
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error)

    await supabase.from('whatsapp_messages').insert({
      agency_id: options?.agencyId,
      contact_id: options?.contactId || null,
      phone_number: cleanPhone,
      message: message,
      message_type: options?.mediaUrl ? 'image' : 'text',
      media_url: options?.mediaUrl,
      direction: 'outbound',
      status: 'failed',
      error: (error as Error).message,
      metadata: { timestamp: Date.now() },
    })

    throw error
  }
}

/**
 * Get connection status from the database (safe to call from any context).
 */
export async function getConnectionStatus(agencyId?: string): Promise<{
  status: string
  phoneNumber?: string
  qrCode?: string
  connectedAt?: string
}> {
  const supabase = getSupabase()

  let query = supabase.from('whatsapp_sessions').select('*').eq('id', 'primary')
  if (agencyId) {
    query = query.eq('agency_id', agencyId)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    return { status: 'disconnected' }
  }

  return {
    status: data.status,
    phoneNumber: data.phone_number,
    qrCode: data.qr_code,
    connectedAt: data.connected_at,
  }
}

/**
 * Disconnect and clear the WhatsApp session.
 */
export async function disconnect() {
  console.log('[WhatsApp] Disconnecting...')

  if (globalThis.__waSocket) {
    try {
      await globalThis.__waSocket.logout()
      console.log('[WhatsApp] Logged out successfully')
    } catch (error) {
      console.error('[WhatsApp] Error during logout:', error)
    }

    globalThis.__waSocket = null
  }

  await clearAuthState()
  await updateSessionStatus('disconnected')
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function createWhatsAppClient(): Promise<WASocket> {
  console.log('[WhatsApp] Initializing Baileys client...')

  const logger = P({ level: process.env.NODE_ENV === 'production' ? 'silent' : 'warn' }) as any

  const { version } = await fetchLatestBaileysVersion()
  console.log(`[WhatsApp] Using WA version ${version.join('.')}`)

  // Choose auth storage based on environment
  let state, saveCreds

  if (USE_SUPABASE_STORAGE) {
    console.log('[WhatsApp] Using Supabase Storage for session persistence')
    const supabase = getSupabase()
    await ensureWhatsAppBucket(supabase, STORAGE_BUCKET)
    const authState = await useSupabaseAuthState(supabase, {
      bucketName: STORAGE_BUCKET,
      folderPath: 'session',
    })
    state = authState.state
    saveCreds = authState.saveCreds
  } else {
    console.log('[WhatsApp] Using local filesystem for session (development)')
    const authPath = path.join(process.cwd(), '.data', 'whatsapp-auth')
    // Ensure directory exists
    const fs = await import('fs/promises')
    await fs.mkdir(authPath, { recursive: true })
    const authState = await useMultiFileAuthState(authPath)
    state = authState.state
    saveCreds = authState.saveCreds
  }

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['Livoo CRM', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    getMessage: async () => ({ conversation: '' }),
  })

  console.log('[WhatsApp] Socket created successfully')

  // --- Event handlers ---

  sock.ev.on('creds.update', async () => {
    console.log('[WhatsApp] Credentials updated, saving...')
    await saveCreds()
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    console.log('[WhatsApp] Connection update:', {
      connection,
      hasQR: !!qr,
      hasLastDisconnect: !!lastDisconnect,
    })

    if (qr) {
      await handleQRCode(qr)
    }

    if (connection === 'close') {
      await handleDisconnection(lastDisconnect)
    }

    if (connection === 'open') {
      await handleConnection(sock)
    }

    if (connection === 'connecting') {
      await updateSessionStatus('connecting')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      for (const msg of messages) {
        await handleIncomingMessage(msg)
      }
    }
  })

  return sock
}

async function handleQRCode(qr: string) {
  console.log('[WhatsApp] QR Code generated')

  const supabase = getSupabase()

  try {
    // Get default agency if needed
    const agencyId = await getDefaultAgencyId()

    await supabase.from('whatsapp_sessions').upsert({
      id: 'primary',
      agency_id: agencyId,
      qr_code: qr,
      status: 'waiting_scan',
      updated_at: new Date().toISOString(),
    })

    console.log('[WhatsApp] QR saved to database')
  } catch (error) {
    console.error('[WhatsApp] Error saving QR:', error)
  }
}

async function handleDisconnection(lastDisconnect: any) {
  const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
  const shouldReconnect = statusCode !== DisconnectReason.loggedOut

  console.log('[WhatsApp] Connection closed', {
    statusCode,
    shouldReconnect,
    reconnectAttempts: globalThis.__waReconnectAttempts,
  })

  await updateSessionStatus('disconnected')

  globalThis.__waSocket = null

  if (shouldReconnect && globalThis.__waReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    globalThis.__waReconnectAttempts++
    const attempt = globalThis.__waReconnectAttempts
    console.log(`[WhatsApp] Reconnecting (attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})...`)

    const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
    await new Promise((resolve) => setTimeout(resolve, delay))

    try {
      await getWhatsAppSocket()
    } catch (err) {
      console.error('[WhatsApp] Reconnection failed:', err)
    }
  } else if (statusCode === DisconnectReason.loggedOut) {
    console.log('[WhatsApp] User logged out, clearing session')
    await clearAuthState()
  } else {
    console.log('[WhatsApp] Max reconnect attempts reached')
  }
}

async function handleConnection(sock: WASocket) {
  const phoneNumber = sock.user?.id?.replace(/:\d+/, '')

  console.log('[WhatsApp] Connected successfully!', {
    phoneNumber,
    userId: sock.user?.id,
  })

  const supabase = getSupabase()

  try {
    const agencyId = await getDefaultAgencyId()

    await supabase.from('whatsapp_sessions').upsert({
      id: 'primary',
      agency_id: agencyId,
      status: 'connected',
      phone_number: phoneNumber,
      qr_code: null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Also update the whatsapp_agency_auth table for backward compatibility
    await supabase.from('whatsapp_agency_auth').upsert(
      {
        agency_id: agencyId,
        phone_number: phoneNumber,
        is_active: true,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
        last_qr_code: null,
      },
      { onConflict: 'agency_id' }
    )

    globalThis.__waReconnectAttempts = 0
    console.log('[WhatsApp] Session status updated to connected')
  } catch (error) {
    console.error('[WhatsApp] Error updating session status:', error)
  }
}

async function handleIncomingMessage(msg: proto.IWebMessageInfo) {
  if (msg.key.fromMe) return

  const remoteJid = msg.key.remoteJid
  if (!remoteJid) return

  const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
  const messageText =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ''

  if (!messageText) return

  console.log('[WhatsApp] Incoming message:', {
    from: phoneNumber,
    text: messageText.substring(0, 50),
  })

  const supabase = getSupabase()

  try {
    const agencyId = await getDefaultAgencyId()

    // Try to find an existing contact by whatsapp number
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('whatsapp', phoneNumber)
      .limit(1)
      .maybeSingle()

    // Log in whatsapp_messages
    await supabase.from('whatsapp_messages').insert({
      agency_id: agencyId,
      contact_id: contact?.id || null,
      phone_number: phoneNumber,
      message: messageText,
      message_type: 'text',
      direction: 'inbound',
      status: 'delivered',
      whatsapp_message_id: msg.key.id,
      metadata: {
        timestamp: msg.messageTimestamp,
        pushName: msg.pushName,
      },
    })

    // Also insert into conversations/messages for the inbox
    await syncToConversation(supabase, agencyId, remoteJid, messageText, msg)
  } catch (error) {
    console.error('[WhatsApp] Error saving incoming message:', error)
  }
}

/**
 * Sync an incoming WhatsApp message to the conversations/messages tables
 * used by the Inbox UI.
 */
async function syncToConversation(
  supabase: ReturnType<typeof getSupabase>,
  agencyId: string,
  jid: string,
  text: string,
  msg: proto.IWebMessageInfo
) {
  try {
    // Check if conversation exists for this jid
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('platform_id', jid)
      .eq('channel', 'whatsapp')
      .limit(1)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const phone = jid.replace('@s.whatsapp.net', '')

      // Find or create contact
      let contactId: string | undefined
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('whatsapp', phone)
        .limit(1)
        .maybeSingle()

      if (contact) {
        contactId = contact.id
      } else {
        const { data: newContact } = await supabase
          .from('contacts')
          .insert({
            agency_id: agencyId,
            first_name: msg.pushName || 'Unknown',
            last_name: '(WhatsApp)',
            whatsapp: phone,
            source: 'whatsapp_inbound',
            type: 'other',
          })
          .select('id')
          .single()

        contactId = newContact?.id
      }

      // Create conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          agency_id: agencyId,
          contact_id: contactId,
          channel: 'whatsapp',
          platform_id: jid,
          platform_thread_id: jid,
          status: 'open',
          unread_count: 1,
          last_message_at: new Date().toISOString(),
          last_message_preview: text.substring(0, 100),
        })
        .select('id')
        .single()

      conversationId = newConv?.id
    } else {
      // Update existing conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: text.substring(0, 100),
          unread_count: supabase.rpc ? 1 : 1, // Increment would need RPC
          status: 'open',
        })
        .eq('id', conversationId)
    }

    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        direction: 'inbound',
        content: text,
        status: 'received',
        platform_message_id: msg.key.id,
        created_at: msg.messageTimestamp
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('[WhatsApp] Error syncing to conversation:', error)
  }
}

async function updateSessionStatus(status: string) {
  const supabase = getSupabase()

  try {
    const agencyId = await getDefaultAgencyId()

    await supabase.from('whatsapp_sessions').upsert({
      id: 'primary',
      agency_id: agencyId,
      status,
      updated_at: new Date().toISOString(),
    })

    // Backward compat: also update whatsapp_agency_auth
    if (status === 'disconnected') {
      await supabase
        .from('whatsapp_agency_auth')
        .update({
          is_active: false,
          disconnected_at: new Date().toISOString(),
        })
        .eq('agency_id', agencyId)
    }
  } catch (error) {
    console.error('[WhatsApp] Error updating session status:', error)
  }
}

async function clearAuthState() {
  if (USE_SUPABASE_STORAGE) {
    try {
      const { clearWhatsAppSession } = await import('./supabase-auth-state')
      const supabase = getSupabase()
      await clearWhatsAppSession(supabase, {
        bucketName: STORAGE_BUCKET,
        folderPath: 'session',
      })
      console.log('[WhatsApp] Supabase auth state cleared')
    } catch (error) {
      console.error('[WhatsApp] Error clearing Supabase auth state:', error)
    }
  } else {
    const authPath = path.join(process.cwd(), '.data', 'whatsapp-auth')
    const fs = await import('fs/promises')

    try {
      await fs.rm(authPath, { recursive: true, force: true })
      await fs.mkdir(authPath, { recursive: true })
      console.log('[WhatsApp] Local auth state cleared')
    } catch (error) {
      console.error('[WhatsApp] Error clearing local auth state:', error)
    }
  }
}

/** Cache the default agency ID to avoid repeated lookups */
let _cachedAgencyId: string | null = null

async function getDefaultAgencyId(): Promise<string> {
  if (_cachedAgencyId) return _cachedAgencyId

  const supabase = getSupabase()
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single()

  if (!agency?.id) {
    throw new Error('No active agency found in the database')
  }

  _cachedAgencyId = agency.id
  return agency.id
}
