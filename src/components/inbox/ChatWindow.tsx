'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { useMessages, useSendMessage } from '@/hooks/useConversations';
import type { Conversation } from '@/types/inbox';

interface ChatWindowProps {
    conversationId: string | null;
    conversation?: Conversation | null;
}

export function ChatWindow({ conversationId, conversation }: ChatWindowProps) {
    const { data: messages, isLoading } = useMessages(conversationId);
    const sendMessage = useSendMessage();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, conversationId]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!conversationId || !inputValue.trim()) return;

        const content = inputValue;
        setInputValue(''); // Optimistic clear

        try {
            await sendMessage.mutateAsync({
                conversation_id: conversationId,
                content: content,
                type: 'text'
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputValue(content); // Restore on error
            // Toast here
        }
    };

    if (!conversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 h-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tu Bandeja de Entrada</h3>
                <p className="max-w-md">
                    Selecciona una conversación de la lista para ver el historial de mensajes y responder.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-muted/10">
            {/* Header */}
            <div className="h-16 border-b bg-background px-6 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={conversation?.contact?.avatar_url} />
                        <AvatarFallback>
                            {conversation?.contact?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">
                            {conversation?.contact?.first_name} {conversation?.contact?.last_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {conversation?.channel === 'whatsapp' ? 'En línea (WhatsApp)' : `${conversation?.channel}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Llamar">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Videollamada">
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Background Pattern could go here */}
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="flex flex-col justify-end min-h-full space-y-2 pb-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                Cargando historial...
                            </div>
                        ) : messages?.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm bg-background/50 rounded-lg mx-auto max-w-sm mt-10">
                                <p>Esta es una nueva conversación.</p>
                                <p>Envía un mensaje para comenzar.</p>
                            </div>
                        ) : (
                            messages?.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))
                        )}
                        <div ref={endRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <ImageIcon className="h-5 w-5" />
                    </Button>

                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
                        autoFocus
                    />

                    <Button
                        type="submit"
                        disabled={!inputValue.trim() || sendMessage.isPending}
                        size="icon"
                        className={cn(
                            "shrink-0 transition-all",
                            inputValue.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
