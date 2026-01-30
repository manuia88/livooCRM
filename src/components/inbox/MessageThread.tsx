'use client';

import React, { useState } from 'react';
import { Conversation, Message } from '@/types/inbox';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { TemplatePicker } from './templates/TemplatePicker';

interface MessageThreadProps {
    conversation?: Conversation;
    messages: Message[];
    onSendMessage: (content: string) => void;
}

export function MessageThread({ conversation, messages, onSendMessage }: MessageThreadProps) {
    const [inputValue, setInputValue] = useState('');

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
                <div className="text-center">
                    <p className="mb-2">Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-background z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {conversation.contact?.first_name?.[0] || '?'}
                    </div>
                    <div>
                        <h3 className="font-semibold">{conversation.contact?.full_name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{conversation.channel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full mb-2",
                            msg.direction === 'outbound' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[70%] rounded-lg p-3 text-sm",
                                msg.direction === 'outbound'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white border rounded-bl-none shadow-sm"
                            )}
                        >
                            <p>{msg.content}</p>
                            <span className={cn(
                                "text-[10px] block mt-1 opacity-70 text-right"
                            )}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <Button type="button" variant="ghost" size="icon">
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    {/* Template Picker */}
                    <div className="relative">
                        <TemplatePicker onSelect={(content) => {
                            let processed = content;
                            if (conversation?.contact) {
                                processed = processed
                                    .replace(/{first_name}/g, conversation.contact.first_name || '')
                                    .replace(/{last_name}/g, conversation.contact.last_name || '')
                                    .replace(/{full_name}/g, conversation.contact.full_name || '');
                            }
                            setInputValue(processed);
                        }} />
                    </div>

                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!inputValue.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                    Using template variables: {'{first_name}'}, {'{last_name}'}
                </div>
            </div>
        </div>
    );
}
