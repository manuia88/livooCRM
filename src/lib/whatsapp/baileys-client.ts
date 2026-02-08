import makeWASocket, {
    DisconnectReason,
    WASocket,
    proto,
    AuthenticationCreds,
    AuthenticationState,
    SignalDataTypeMap,
    initAuthCreds,
    BufferJSON
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import P from 'pino'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WhatsAppClientConfig {
    agencyId: string
    onQR?: (qr: string) => void
    onConnected?: (phoneNumber: string) => void
    onDisconnected?: () => void
}

class WhatsAppClient {
    private socket: WASocket | null = null
    private agencyId: string
    private config: WhatsAppClientConfig
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5

    constructor(config: WhatsAppClientConfig) {
        this.agencyId = config.agencyId
        this.config = config
    }

    /**
     * Start WhatsApp connection
     */
    async start() {
        try {
            console.log(`Starting WhatsApp client for agency ${this.agencyId}`)

            // 1. Load auth state from DB
            const { state, saveCreds } = await this.loadAuthState()

            // 2. Create socket
            this.socket = makeWASocket({
                auth: state,
                printQRInTerminal: true,
                logger: P({ level: 'silent' }),
                browser: ['Livoo CRM', 'Chrome', '1.0.0']
            })

            // 3. Events
            this.socket.ev.on('creds.update', saveCreds)

            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update

                if (qr) {
                    console.log('QR Code generated')
                    this.config.onQR?.(qr)
                    await this.saveQRCode(qr)
                }

                if (connection === 'open') {
                    console.log('WhatsApp connected!')
                    this.reconnectAttempts = 0

                    const phoneNumber = this.socket!.user?.id.split(':')[0] || ''
                    this.config.onConnected?.(phoneNumber)
                    await this.markAsConnected(phoneNumber)
                }

                if (connection === 'close') {
                    const status = (lastDisconnect?.error as Boom)?.output?.statusCode
                    const shouldReconnect = status !== DisconnectReason.loggedOut

                    console.log(`Connection closed (status ${status}). Reconnect? ${shouldReconnect}`)

                    if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++
                        setTimeout(() => this.start(), 3000)
                    } else {
                        this.config.onDisconnected?.()
                        await this.markAsDisconnected()
                    }
                }
            })

            this.socket.ev.on('messages.upsert', async (m) => {
                const msg = m.messages[0]
                if (!msg.key.fromMe && msg.message) {
                    console.log('Message received:', msg)
                    // Handle incoming message tracking if needed
                }
            })

        } catch (error) {
            console.error('WhatsApp client error:', error)
            throw error
        }
    }

    async sendMessage(phoneNumber: string, message: string, contactId?: string) {
        if (!this.socket) throw new Error('WhatsApp not connected')

        try {
            const jid = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

            const sentMsg = await this.socket.sendMessage(jid, { text: message })

            await this.logMessage({
                contactId,
                phoneNumber: jid,
                message,
                whatsappMessageId: sentMsg?.key.id!,
                status: 'sent'
            })

            return {
                success: true,
                messageId: sentMsg?.key.id
            }
        } catch (error: any) {
            console.error('Send message error:', error)
            await this.logMessage({
                contactId,
                phoneNumber,
                message,
                status: 'failed',
                error: error.message
            })
            throw error
        }
    }

    isConnected(): boolean {
        return !!(this.socket && this.socket.user)
    }

    async disconnect() {
        if (this.socket) {
            await this.socket.logout()
            this.socket = null
        }
    }

    private async loadAuthState() {
        const { data: session } = await supabase
            .from('whatsapp_agency_auth')
            .select('session_data')
            .eq('agency_id', this.agencyId)
            .eq('is_active', true)
            .maybeSingle()

        let creds: AuthenticationCreds = session?.session_data || initAuthCreds()

        const state: AuthenticationState = {
            creds,
            keys: {
                get: async (type, ids) => {
                    // Keys are currently not persisted separately in this simplified storage
                    // Baileys might need more robust key storage for full multi-device support
                    return {}
                },
                set: async (data) => {
                    // Handle key updates if needed
                }
            }
        }

        return {
            state,
            saveCreds: async () => {
                await supabase
                    .from('whatsapp_agency_auth')
                    .upsert({
                        agency_id: this.agencyId,
                        session_data: JSON.parse(JSON.stringify(state.creds, BufferJSON.replacer)),
                        is_active: true,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'agency_id' })
            }
        }
    }

    private async saveQRCode(qr: string) {
        await supabase
            .from('whatsapp_agency_auth')
            .upsert({
                agency_id: this.agencyId,
                last_qr_code: qr,
                qr_generated_at: new Date().toISOString(),
                is_active: false
            }, { onConflict: 'agency_id' })
    }

    private async markAsConnected(phoneNumber: string) {
        await supabase
            .from('whatsapp_agency_auth')
            .update({
                phone_number: phoneNumber,
                is_active: true,
                connected_at: new Date().toISOString(),
                disconnected_at: null
            })
            .eq('agency_id', this.agencyId)
    }

    private async markAsDisconnected() {
        await supabase
            .from('whatsapp_agency_auth')
            .update({
                is_active: false,
                disconnected_at: new Date().toISOString()
            })
            .eq('agency_id', this.agencyId)
    }

    private async logMessage(data: {
        contactId?: string
        phoneNumber: string
        message: string
        mediaUrl?: string
        whatsappMessageId?: string
        status: string
        error?: string
    }) {
        // Note: This run on server side, we don't always have a user session here
        // But we have the agencyId
        await supabase.from('whatsapp_messages').insert({
            agency_id: this.agencyId,
            contact_id: data.contactId,
            phone_number: data.phoneNumber,
            message: data.message,
            media_url: data.mediaUrl,
            whatsapp_message_id: data.whatsappMessageId,
            status: data.status,
            error: data.error
        })

        if (data.contactId && data.status === 'sent') {
            await supabase.from('contact_interactions').insert({
                contact_id: data.contactId,
                interaction_type: 'message',
                channel: 'whatsapp',
                notes: data.message,
                metadata: {
                    phone_number: data.phoneNumber,
                    whatsapp_message_id: data.whatsappMessageId
                }
            })
        }
    }
}

const clients = new Map<string, WhatsAppClient>()

export function getWhatsAppClient(agencyId: string, config?: WhatsAppClientConfig): WhatsAppClient {
    if (!clients.has(agencyId)) {
        clients.set(agencyId, new WhatsAppClient({
            agencyId,
            ...config
        }))
    }
    return clients.get(agencyId)!
}

export { WhatsAppClient }
