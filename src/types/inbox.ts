export type ChannelType = 'whatsapp' | 'instagram_dm' | 'facebook_messenger' | 'sms' | 'email' | 'webchat' | 'telegram' | 'tiktok';
export type ConversationStatus = 'open' | 'pending' | 'closed' | 'spam';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Conversation {
    id: string;
    agency_id: string;
    contact_id?: string;
    assigned_to?: string;
    channel: ChannelType;
    platform_id?: string;
    platform_thread_id?: string;
    status: ConversationStatus;
    last_message_at?: string;
    last_message_from?: 'contact' | 'agent';
    unread_count: number;
    tags: string[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joins (optional for now, depending on query)
    contact?: {
        first_name: string;
        last_name?: string;
        full_name: string;
        avatar_url?: string;
    };
}

export interface Message {
    id: string;
    conversation_id: string;
    direction: MessageDirection;
    sender_id?: string;
    content: string;
    media_urls?: string[];
    platform_message_id?: string;
    status: MessageStatus;
    delivered_at?: string;
    read_at?: string;
    is_automated: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
    created_at: string;
}
