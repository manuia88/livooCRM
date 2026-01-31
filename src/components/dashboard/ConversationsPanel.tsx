'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar } from 'lucide-react'
import { useConversations } from '@/hooks/useConversations'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function ConversationsPanel() {
    const { data: allConversations } = useConversations('open')
    const conversations = allConversations?.slice(0, 10)

    return (
        <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversaciones</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar conversación"
                        className="pl-10"
                    />
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
                {conversations?.map((conv) => (
                    <div
                        key={conv.id}
                        className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={conv.contact?.avatar_url} />
                                <AvatarFallback>{conv.contact?.first_name?.[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm truncate">
                                        {conv.contact?.first_name} {conv.contact?.last_name}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), {
                                            addSuffix: true,
                                            locale: es
                                        })}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 truncate mb-2">
                                    {conv.last_message_preview}
                                </p>

                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {conv.channel === 'whatsapp' && '📱 WhatsApp'}
                                        {conv.channel === 'facebook_messenger' && '📘 Facebook'}
                                    </Badge>
                                    {(conv.status as string) === 'descartado' && (
                                        <span className="text-xs text-gray-500">descartado</span>
                                    )}
                                    {(conv.status as string) === 'perdido' && (
                                        <span className="text-xs text-red-600">perdido</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
