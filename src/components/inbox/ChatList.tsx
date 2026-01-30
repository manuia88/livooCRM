'use client';

import { useState } from 'react';
import { Search, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';
import type { Conversation } from '@/types/inbox';

interface ChatListProps {
    selectedId: string | null;
    onSelect: (conversation: Conversation) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
    const { data: conversations, isLoading } = useConversations();
    const [search, setSearch] = useState('');

    const filteredConversations = conversations?.filter(c => {
        const name = c.contact ? `${c.contact.first_name} ${c.contact.last_name || ''}`.toLowerCase() : '';
        return name.includes(search.toLowerCase());
    });

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full p-4 space-y-4">
                <div className="h-10 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full border-r bg-white/50 backdrop-blur-xl">
            {/* Search Header */}
            <div className="p-4 border-b space-y-4">
                <h2 className="text-xl font-bold tracking-tight px-1">Mensajes</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar chats..."
                        className="pl-9 bg-muted/50 border-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col p-2 gap-1">
                    {filteredConversations?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No se encontraron conversaciones
                        </div>
                    ) : filteredConversations?.map((conv) => {
                        const contactName = conv.contact ? `${conv.contact.first_name} ${conv.contact.last_name || ''}`.trim() : 'Desconocido';
                        const isSelected = selectedId === conv.id;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv)}
                                className={cn(
                                    "flex items-start gap-3 p-3 text-left rounded-lg transition-all duration-200 border border-transparent",
                                    isSelected
                                        ? "bg-primary/5 border-primary/10 shadow-sm"
                                        : "hover:bg-muted/50 hover:border-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={conv.contact?.avatar_url} />
                                    <AvatarFallback className={cn(isSelected ? "bg-primary text-primary-foreground" : "")}>
                                        {conv.contact?.first_name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={cn("font-medium truncate text-sm", isSelected ? "text-primary" : "text-foreground")}>
                                            {contactName}
                                        </span>
                                        {conv.last_message_at && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                            {conv.last_message_preview || 'Nueva conversación'}
                                        </p>

                                        {conv.unread_count > 0 && (
                                            <Badge variant="default" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] rounded-full">
                                                {conv.unread_count}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Channel Indicator */}
                                    <div className="mt-1 flex items-center gap-1">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            conv.channel === 'whatsapp' ? "bg-green-500" :
                                                conv.channel === 'facebook_messenger' ? "bg-blue-600" :
                                                    "bg-gray-400"
                                        )} />
                                        <span className="text-[10px] text-muted-foreground/70 capitalize">
                                            {conv.channel}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
