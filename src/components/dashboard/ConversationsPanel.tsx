'use client';

import { useConversations } from '@/hooks/useConversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

export function ConversationsPanel() {
    const { data: conversations, isLoading } = useConversations('open');

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!conversations?.length) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F8F7F4] flex items-center justify-center border border-gray-100">
                    <span className="text-2xl">💬</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Sin mensajes</h3>
                    <p className="text-xs text-gray-400 font-medium">Tus conversaciones aparecerán aquí.</p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-50">
                {conversations.map((conv, index) => {
                    const initials = conv.contact?.first_name?.[0] || '?';
                    const hasUnread = conv.unread_count > 0;

                    return (
                        <motion.button
                            key={conv.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-all text-left group"
                        >
                            <div className="relative">
                                <Avatar className={`h-12 w-12 rounded-full border-2 transition-colors ${hasUnread ? 'border-[#B8975A]' : 'border-white shadow-sm'
                                    }`}>
                                    <AvatarImage src={conv.contact?.avatar_url} />
                                    <AvatarFallback className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-tighter">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                {hasUnread && (
                                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#B8975A] border-2 border-white rounded-full" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-bold truncate ${hasUnread ? 'text-gray-900 group-hover:text-[#B8975A]' : 'text-gray-700'
                                        }`}>
                                        {conv.contact?.first_name} {conv.contact?.last_name}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: es }) : ''}
                                    </span>
                                </div>
                                <p className={`text-xs truncate font-medium ${hasUnread ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                    {conv.last_message_preview || 'Sin mensajes aún'}
                                </p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </ScrollArea>
    );
}


