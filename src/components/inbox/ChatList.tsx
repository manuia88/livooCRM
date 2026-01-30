'use client';

import React from 'react';
import { Conversation } from '@/types/inbox';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns'; // We might need to install date-fns if not present
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold mb-2">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search messages..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No conversations found.
                    </div>
                ) : (
                    <div className="divide-y">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3",
                                    selectedId === conv.id && "bg-muted"
                                )}
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                                    {conv.contact?.first_name?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium truncate block">{conv.contact?.full_name || 'Unknown'}</span>
                                        {conv.last_message_at && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {/* Simple date format for now if date-fns fails */}
                                                {new Date(conv.last_message_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground truncate max-w-[85%]">
                                            {conv.last_message_from === 'agent' && 'You: '}
                                            {/* We don't have the last message content in Conversation type yet, maybe add it later. For now assume it's fetched or blank */}
                                            Click to view message
                                        </p>
                                        {conv.unread_count > 0 && (
                                            <span className="h-5 w-5 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
