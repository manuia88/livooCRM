'use client';

import { useState } from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import type { Conversation } from '@/types/inbox';

export default function InboxLayout() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    const handleSelect = (conv: Conversation) => {
        setSelectedConversationId(conv.id);
        setSelectedConversation(conv);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Sidebar List */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r md:block hidden">
                <ChatList
                    selectedId={selectedConversationId}
                    onSelect={handleSelect}
                />
            </div>

            {/* Mobile List (Hidden on desktop) */}
            <div className={`w-full md:hidden flex-shrink-0 ${selectedConversationId ? 'hidden' : 'block'}`}>
                <ChatList
                    selectedId={selectedConversationId}
                    onSelect={handleSelect}
                />
            </div>

            {/* Main Window */}
            <div className={`flex-1 flex flex-col md:flex ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile Back Button could go here or inside ChatWindow */}
                <ChatWindow
                    conversationId={selectedConversationId}
                    conversation={selectedConversation}
                />
            </div>
        </div>
    );
}
