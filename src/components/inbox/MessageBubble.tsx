'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/types/inbox';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isOutbound = message.direction === 'outbound';

    return (
        <div className={cn(
            "flex w-full mb-4",
            isOutbound ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[75%] rounded-lg px-4 py-2 shadow-sm relative group",
                isOutbound
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-white border rounded-tl-none"
            )}>
                {/* Text Content */}
                {message.message_type === 'text' && (
                    <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>
                )}

                {/* Image Content */}
                {message.message_type === 'image' && message.media_urls && (
                    <div className="mb-1 rounded overflow-hidden">
                        <img
                            src={message.media_urls[0]}
                            alt="Attachment"
                            className="max-w-full h-auto object-cover max-h-64"
                        />
                        {message.content && <p className="text-sm mt-1">{message.content}</p>}
                    </div>
                )}

                {/* Meta info (Time + Status) */}
                <div className={cn(
                    "flex items-center justify-end gap-1 mt-1 select-none",
                    isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                    <span className="text-[10px]">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isOutbound && (
                        <span>
                            {message.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-blue-300" />
                            ) : message.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
