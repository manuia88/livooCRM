'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { Conversation, Message } from '@/types/inbox';

const supabase = createClient();

export function useConversations(filter: string = 'active') {
    return useQuery({
        queryKey: ['conversations', filter],
        queryFn: async () => {
            // We need to fetch conversations and join with contacts
            // Assuming relation is 'messages' for last message info is not needed if we utilize the 'last_message_at' on conversation table
            // But if we want contact details, we assume a foreign key 'contact_id' exists and relation 'contacts' is valid.

            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    contact:contacts(first_name, last_name, full_name, avatar_url, phone)
                `)
                .eq('status', filter)
                .order('last_message_at', { ascending: false });

            if (error) throw error;
            return data as Conversation[];
        },
        refetchInterval: 5000 // Poll every 5s (fallback for realtime)
    });
}

export function useMessages(conversationId: string | null) {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
        refetchInterval: 3000 // Fallback for realtime
    });
}

interface SendMessageVariables {
    conversation_id: string;
    content: string;
    type?: 'text' | 'image' | 'video' | 'audio' | 'document';
    fileUrl?: string; // If type is not text
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ conversation_id, content, type = 'text', fileUrl }: SendMessageVariables) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            // 1. Insert message
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id,
                    sender_type: 'agent', // TODO: Make this dynamic if needed, but 'agent' is fine for Dashboard
                    sender_id: user.id,
                    content,
                    message_type: type,
                    media_url: fileUrl,
                    status: 'sent',
                    direction: 'outbound'
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Update conversation
            await supabase
                .from('conversations')
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message_preview: type === 'text' ? content : `[${type}]`,
                    status: 'open', // Reopen if it was closed
                    unread_count: 0 // Reset unread for agent? No, unread is for agent usually. 
                    // Actually unread_count usually tracks user's unread messages.
                    // If agent replies, unread_count for AGENT should be 0.
                })
                .eq('id', conversation_id);

            return data as Message;
        },
        onSuccess: (newMessage) => {
            queryClient.setQueryData(['messages', newMessage.conversation_id], (old: Message[] = []) => {
                return [...old, newMessage];
            });
            // Invalidate conversations to update last_message preview
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
}
