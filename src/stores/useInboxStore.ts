import { create } from 'zustand';
import { Conversation, Message, ChannelType } from '@/types/inbox';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface InboxState {
    conversations: Conversation[];
    messages: Message[];
    selectedId: string | null;
    activeChannel: ChannelType | 'all';
    isLoading: boolean;

    // Actions
    fetchConversations: () => Promise<void>;
    selectConversation: (id: string) => Promise<void>;
    setChannel: (channel: ChannelType | 'all') => void;
    sendMessage: (content: string) => Promise<void>;

    // Subscriptions
    subscription: RealtimeChannel | null;
    subscribe: () => void;
    unsubscribe: () => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
    conversations: [],
    messages: [],
    selectedId: null,
    activeChannel: 'all',
    isLoading: false,
    subscription: null,

    fetchConversations: async () => {
        const supabase = createClient();
        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    contact:contacts(first_name, last_name, full_name, avatar_url)
                `)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Transform contact array to object if needed (Supabase returns array for relation usually, but single() if 1:1)
            // Assuming contact is 1:1 or N:1, returns object or array. 
            // In schema, Contact is One, Conversation belongs toContact.
            // Types expect contact object.

            const formattedConversations = (data || []).map((c: any) => ({
                ...c,
                contact: c.contact // If contact relation returns object
            }));

            set({ conversations: formattedConversations, isLoading: false });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            set({ isLoading: false });
        }
    },

    selectConversation: async (id: string) => {
        set({ selectedId: id, messages: [] }); // formatting messages cleared
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            set({ messages: data || [] });

            // Mark as read (optional, can be done in background)
            await supabase.from('conversations').update({ unread_count: 0 }).eq('id', id);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    },

    setChannel: (channel) => {
        set({ activeChannel: channel });
        // Could filter conversations locally or refetch
    },

    sendMessage: async (content: string) => {
        const { selectedId, conversations } = get();
        if (!selectedId) return;

        const conversation = conversations.find(c => c.id === selectedId);
        if (!conversation) return;

        // Optimistic update
        const tempId = crypto.randomUUID();
        const newMessage: Message = {
            id: tempId,
            conversation_id: selectedId,
            direction: 'outbound',
            content,
            message_type: 'text',
            status: 'sent', // Initially sent
            is_automated: false,
            created_at: new Date().toISOString()
        };

        set(state => ({ messages: [...state.messages, newMessage] }));

        try {
            // Call API to send via WhatsApp (or generic handler)
            if (conversation.channel === 'whatsapp') {
                const res = await fetch('/api/whatsapp/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: conversation.platform_id, // JID or Phone
                        message: content
                    })
                });

                if (!res.ok) throw new Error('Failed to send');
            } else {
                // Handle other channels or throw
                console.warn('Channel not supported for sending yet:', conversation.channel);
            }
        } catch (error) {
            console.error('Send failed:', error);
            // Rollback or mark error
            set(state => ({
                messages: state.messages.map(m =>
                    m.id === tempId ? { ...m, status: 'failed' } : m
                )
            }));
        }
    },

    subscribe: () => {
        const supabase = createClient();
        // Subscribe to messages and conversations
        const sub = supabase
            .channel('inbox_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                const { selectedId, messages, fetchConversations } = get();
                const newMsg = payload.new as Message;

                // Update messages if this conversation is selected
                if (payload.eventType === 'INSERT' && newMsg.conversation_id === selectedId) {
                    set({ messages: [...messages, newMsg] });
                }

                // Refresh conversations list (to update last_message, unread_count, reorder)
                fetchConversations();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                get().fetchConversations();
            })
            .subscribe();

        set({ subscription: sub });
    },

    unsubscribe: () => {
        const { subscription } = get();
        if (subscription) subscription.unsubscribe();
        set({ subscription: null });
    }
}));
