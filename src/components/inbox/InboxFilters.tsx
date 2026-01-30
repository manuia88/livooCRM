'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    MessageCircle,
    Instagram,
    Facebook,
    Mail,
    MessageSquare,
    Filter,
    Search
} from 'lucide-react';
import { ChannelType } from '@/types/inbox';
import { WhatsAppConnect } from './WhatsAppConnect';
import { TemplateManager } from './templates/TemplateManager';

interface InboxFiltersProps {
    activeChannel: ChannelType | 'all';
    onChannelChange: (channel: ChannelType | 'all') => void;
}

export function InboxFilters({ activeChannel, onChannelChange }: InboxFiltersProps) {
    const channels: { id: ChannelType | 'all'; icon: React.ReactNode; label: string }[] = [
        { id: 'all', icon: <MessageSquare className="w-4 h-4" />, label: 'All' },
        { id: 'whatsapp', icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp' },
        { id: 'instagram_dm', icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
        { id: 'facebook_messenger', icon: <Facebook className="w-4 h-4" />, label: 'Messenger' },
        { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
    ];

    return (
        <div className="flex flex-col h-full py-4 gap-2">
            <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Channels</h3>
            </div>
            <nav className="space-y-1 px-2">
                {channels.map((channel) => (
                    <Button
                        key={channel.id}
                        variant={activeChannel === channel.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => onChannelChange(channel.id)}
                    >
                        {channel.icon}
                        <span className="ml-2 hidden md:inline">{channel.label}</span>
                    </Button>
                ))}
            </nav>

            <div className="mt-auto px-4 pb-4">
                <WhatsAppConnect />
            </div>
        </div>
    );
}
