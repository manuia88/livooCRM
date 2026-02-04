// /app/dashboard/inbox/page.tsx
'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/backoffice/PageContainer'
import { useConversations } from '@/hooks/useConversations'
import { ChatList } from '@/components/inbox/ChatList'
import { ChatWindow } from '@/components/inbox/ChatWindow'
import { WhatsAppConnect } from '@/components/inbox/WhatsAppConnect'
import { MessageSquareDashed, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function InboxPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const { data: conversations, isLoading } = useConversations()

    const selectedConversation = conversations?.find(c => c.id === selectedId)

    return (
        <PageContainer
            title="Inbox"
            subtitle="Mensajes y conversaciones con tus contactos"
            icon={Inbox}
        >
            <div className="flex flex-col gap-4">
            {/* WhatsApp Connection Status */}
            <WhatsAppConnect />

            {/* Inbox Container - Estilo Apple */}
            <div className="flex h-[calc(100vh-200px)] min-h-[400px] overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-200">
                {/* Sidebar List */}
                <div className="w-72 sm:w-80 border-r border-gray-200/50 flex flex-col bg-white/50">
                    <ChatList
                        selectedId={selectedId}
                        onSelect={(c) => setSelectedId(c.id)}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100/80 relative">
                    {selectedConversation ? (
                        <ChatWindow
                            conversationId={selectedConversation.id}
                            conversation={selectedConversation}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 px-4">
                            <div className="p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50">
                                <MessageSquareDashed className="h-14 w-14 text-gray-400" />
                            </div>
                            <div className="text-center max-w-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tu Inbox está listo</h3>
                                <p className="text-gray-600">Selecciona una conversación de la izquierda para comenzar a chatear con tus contactos.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </PageContainer>
    )
}
