// /app/dashboard/inbox/page.tsx
'use client'

import { useState } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { ChatList } from '@/components/inbox/ChatList'
import { ChatWindow } from '@/components/inbox/ChatWindow'
import { MessageSquareDashed } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function InboxPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const { data: conversations, isLoading } = useConversations()

    const selectedConversation = conversations?.find(c => c.id === selectedId)

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden border rounded-lg bg-white shadow-sm m-4">
            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col">
                <ChatList
                    selectedId={selectedId}
                    onSelect={(c) => setSelectedId(c.id)}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 relative">
                {selectedConversation ? (
                    <ChatWindow
                        conversationId={selectedConversation.id}
                        conversation={selectedConversation}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                        <div className="bg-gray-100 p-6 rounded-full">
                            <MessageSquareDashed className="h-12 w-12 text-gray-300" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900">Tu Inbox está listo</h3>
                            <p className="max-w-xs mx-auto mt-2">Selecciona una conversación de la izquierda para comenzar a chatear con tus contactos.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
