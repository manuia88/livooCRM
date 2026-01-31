import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global reference
declare global {
    var _whatsappSocket: any;
    var _whatsappQR: string | null;
}

const SESSION_DIR = 'whatsapp-auth-session';

export class WhatsAppService {
    private socket: any = null;
    private qr: string | null = null;
    private supabase: SupabaseClient;

    // Anti-ban Queue
    private messageQueue: { to: string; text: string; resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];
    private isProcessingQueue = false;

    constructor() {
        if (global._whatsappSocket) {
            this.socket = global._whatsappSocket;
            this.qr = global._whatsappQR || null;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for WhatsAppService');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        });
    }

    async connect(): Promise<{ qr?: string; status: string }> {
        if (this.socket) {
            return { qr: this.qr || undefined, status: 'connected' };
        }

        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }) as any,
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }) as any),
            },
            generateHighQualityLinkPreview: true,
            browser: ['Nexus OS', 'Chrome', '1.0.0']
        });

        this.socket = sock;
        global._whatsappSocket = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qr = qr;
                global._whatsappQR = qr;
                console.log('QR Code generated');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);

                this.socket = null;
                global._whatsappSocket = null;
                this.qr = null;
                global._whatsappQR = null;

                if (shouldReconnect) {
                    this.connect();
                }
            } else if (connection === 'open') {
                console.log('opened connection');
                this.qr = null;
                global._whatsappQR = null;
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    await this.handleIncomingMessage(msg);
                }
            }
        });

        return { status: 'initializing' };
    }

    async sendMessage(to: string, text: string) {
        if (!this.socket) {
            throw new Error('WhatsApp not connected');
        }

        // Add to queue logic
        return new Promise((resolve, reject) => {
            this.messageQueue.push({ to, text, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;

        this.isProcessingQueue = true;

        while (this.messageQueue.length > 0) {
            const item = this.messageQueue.shift();
            if (!item) break;

            const { to, text, resolve, reject } = item;
            const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

            try {
                // Anti-ban: Simulate typing
                if (this.socket) {
                    await this.socket.presenceSubscribe(jid);
                    await this.socket.sendPresenceUpdate('composing', jid);

                    // Anti-ban: Random delay based on message length (min 1s, max 3s for demo speed)
                    // Real scenarios assume longer delays
                    const delay = Math.max(1000, Math.min(3000, text.length * 50));
                    await new Promise(r => setTimeout(r, delay));

                    await this.socket.sendPresenceUpdate('paused', jid);

                    const sentMsg = await this.socket.sendMessage(jid, { text });

                    await this.handleOutboundMessage(jid, text, sentMsg.key.id!, 'sent');

                    resolve(sentMsg);

                    // Anti-ban: Interval between messages (1-2 seconds)
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
                } else {
                    reject(new Error('Socket disconnected during queue processing'));
                }

            } catch (error) {
                console.error('Failed to send message:', error);
                reject(error);
            }
        }

        this.isProcessingQueue = false;
    }

    private async handleIncomingMessage(msg: WAMessage) {
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid!;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text) return;

        try {
            const conversationId = await this.getOrCreateConversation(remoteJid, msg.pushName || undefined);

            const { error } = await this.supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    direction: 'inbound',
                    content: text,
                    status: 'received',
                    platform_message_id: msg.key.id,
                    created_at: new Date((msg.messageTimestamp as number) * 1000).toISOString()
                });

            if (error) console.error('Supabase insert error (inbound):', error);

        } catch (err) {
            console.error('Error handling incoming message:', err);
        }
    }

    private async handleOutboundMessage(jid: string, text: string, messageId: string, status: string) {
        try {
            const conversationId = await this.getOrCreateConversation(jid);

            const { error } = await this.supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    direction: 'outbound',
                    content: text,
                    status: status,
                    platform_message_id: messageId,
                });

            if (error) console.error('Supabase insert error (outbound):', error);

        } catch (err) {
            console.error('Error logging outbound message:', err);
        }
    }

    private async getOrCreateConversation(jid: string, pushName?: string): Promise<string> {
        // 1. Check if conversation exists
        const { data: convs } = await this.supabase
            .from('conversations')
            .select('id')
            .eq('platform_id', jid)
            .eq('channel', 'whatsapp')
            .limit(1);

        if (convs && convs.length > 0) {
            return convs[0].id;
        }

        // 2. Check/Create Contact
        const phone = jid.replace('@s.whatsapp.net', '');

        let contactId: string | undefined;

        const { data: contacts } = await this.supabase
            .from('contacts')
            .select('id')
            .eq('whatsapp', phone)
            .limit(1);

        if (contacts && contacts[0]) {
            contactId = contacts[0].id;
        } else {
            // Get first agency (temporary fallback)
            const { data: agency } = await this.supabase.from('agencies').select('id').limit(1).single();
            const agencyId = agency?.id;

            if (!agencyId) throw new Error('No agency found');

            const { data: newContact, error } = await this.supabase
                .from('contacts')
                .insert({
                    agency_id: agencyId,
                    first_name: pushName || 'Unknown',
                    last_name: '(WhatsApp)',
                    whatsapp: phone,
                    source: 'whatsapp_inbound',
                    type: 'other' // unqualified
                })
                .select('id')
                .single();

            if (error) throw error;
            contactId = newContact.id;
        }

        // 3. Create Conversation
        const { data: agency } = await this.supabase.from('agencies').select('id').limit(1).single();
        const agencyId = agency?.id;

        const { data: newConv, error: convError } = await this.supabase
            .from('conversations')
            .insert({
                agency_id: agencyId,
                contact_id: contactId,
                channel: 'whatsapp',
                platform_id: jid,
                platform_thread_id: jid,
                status: 'open',
                unread_count: 0
            })
            .select('id')
            .single();

        if (convError) throw convError;
        return newConv.id;
    }

    getQR() {
        return this.qr || global._whatsappQR;
    }

    getStatus() {
        if (this.socket) return 'connected';
        return 'disconnected';
    }
}

export const textWhatsAppService = new WhatsAppService();
