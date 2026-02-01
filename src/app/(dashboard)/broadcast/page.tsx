'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Send, BarChart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Broadcast } from '@/types/broadcast';
import { Badge } from '@/components/ui/badge';
import { CreateBroadcastDialog } from '@/components/broadcast/CreateBroadcastDialog';

export default function BroadcastPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('broadcasts')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setBroadcasts(data as Broadcast[]);
        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Broadcasts</h1>
                    <p className="text-muted-foreground">Manage your mass messaging campaigns.</p>
                </div>
                <CreateBroadcastDialog onCreated={fetchBroadcasts} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Send className="w-4 h-4" /> Total Messages
                    </div>
                    <div className="text-2xl font-bold">
                        {broadcasts.reduce((acc, b) => acc + (b.sent_count || 0), 0)}
                    </div>
                </div>
                {/* More stats cards could go here */}
            </div>

            <div className="border rounded-lg bg-card">
                <div className="p-4 border-b font-medium">History</div>
                <div className="divide-y text-sm">
                    {broadcasts.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No broadcasts found. Create your first campaign.
                        </div>
                    ) : (
                        broadcasts.map((b) => (
                            <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {b.name}
                                        <Badge variant="outline" className={getStatusColor(b.status)}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {b.message_content.substring(0, 60)}...
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(b.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {b.sent_count} / {b.total_recipients}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Sent</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
