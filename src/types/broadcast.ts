export type BroadcastStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'cancelled';

export interface Broadcast {
    id: string;
    agency_id: string;
    name: string;
    status: BroadcastStatus;

    template_id?: string;
    message_content: string;

    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;

    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;

    created_at: string;
}

export interface BroadcastRecipient {
    id: string;
    broadcast_id: string;
    contact_id: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    error_message?: string;
    sent_at?: string;
    contact?: {
        id: string;
        first_name: string;
        last_name?: string;
        full_name: string;
        whatsapp?: string;
    };
}
