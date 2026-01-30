'use client';

import React from 'react';
import { Conversation } from '@/types/inbox';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

interface ThreadInfoProps {
    conversation?: Conversation;
}

export function ThreadInfo({ conversation }: ThreadInfoProps) {
    if (!conversation) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-2xl font-bold text-primary mb-3">
                    {conversation.contact?.first_name?.[0] || <User />}
                </div>
                <h2 className="text-xl font-bold">{conversation.contact?.full_name}</h2>
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                </p>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Contact Info */}
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Contact Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">user@example.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>+52 55 1234 5678</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>Mexico City, MX</span>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {conversation.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs text-secondary-foreground">
                                {tag}
                            </span>
                        ))}
                        <Button variant="outline" size="sm" className="h-6 text-xs">+ Add</Button>
                    </div>
                </div>

                {/* Actions */}
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Create Task</Button>
                        <Button variant="outline" size="sm">Add Note</Button>
                        <Button variant="outline" size="sm" className="col-span-2">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View CRM Profile
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
