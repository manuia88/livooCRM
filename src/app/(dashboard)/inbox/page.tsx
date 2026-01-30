'use client';

import React, { useEffect } from 'react';
import { InboxLayout } from '@/components/inbox/InboxLayout';
import { InboxFilters } from '@/components/inbox/InboxFilters';
import { ChatList } from '@/components/inbox/ChatList';
import { MessageThread } from '@/components/inbox/MessageThread';
import { ThreadInfo } from '@/components/inbox/ThreadInfo';
import { useInboxStore } from '@/stores/useInboxStore';

export default function InboxPage() {
    const {
        conversations,
        messages,
        selectedId,
        activeChannel,
        fetchConversations,
        selectConversation,
        setChannel,
        sendMessage,
        subscribe,
        unsubscribe
    } = useInboxStore();

    useEffect(() => {
        fetchConversations();
        subscribe();

        return () => {
            unsubscribe();
        };
    }, []);

    const filteredConversations = activeChannel === 'all'
        ? conversations
        : conversations.filter(c => c.channel === activeChannel);

    const selectedConversation = conversations.find(c => c.id === selectedId);

    return (
        <InboxLayout
            filtersPanel={
                <InboxFilters
                    activeChannel={activeChannel}
                    onChannelChange={setChannel}
                />
            }
            chatListPanel={
                <ChatList
                    conversations={filteredConversations}
                    selectedId={selectedId || undefined}
                    onSelect={selectConversation}
                />
            }
            threadPanel={
                <MessageThread
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={sendMessage}
                />
            }
            infoPanel={
                <ThreadInfo
                    conversation={selectedConversation}
                />
            }
        />
    );
}
