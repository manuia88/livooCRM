'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { TemplatePicker } from '@/components/inbox/templates/TemplatePicker';

interface CreateBroadcastDialogProps {
    onCreated: () => void;
}

interface Contact {
    id: string;
    full_name: string;
    whatsapp: string;
    tags: string[];
}

export function CreateBroadcastDialog({ onCreated }: CreateBroadcastDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');

    const supabase = createClient();

    useEffect(() => {
        if (open) {
            fetchContacts();
        }
    }, [open]);

    const fetchContacts = async () => {
        // Fetch all valid whatsapp contacts
        const { data } = await supabase
            .from('contacts')
            .select('id, full_name, whatsapp, tags') // Assuming tags is JSONB array
            .not('whatsapp', 'is', null);

        if (data) {
            setContacts(data as Contact[]);
        }
    };

    const handleSelectAll = () => {
        if (selectedContacts.size === filteredContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const toggleContact = (id: string) => {
        const next = new Set(selectedContacts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedContacts(next);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // 1. Get Agency ID
            const { data: agency } = await supabase.from('agencies').select('id').limit(1).single();
            const agencyId = agency?.id;

            // 2. Create Broadcast
            const res = await fetch('/api/broadcast/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    name,
                    message_content: message,
                    recipient_ids: Array.from(selectedContacts),
                })
            });

            if (!res.ok) throw new Error('Failed to create broadcast');

            onCreated();
            setOpen(false);
            // Reset
            setStep(1);
            setName('');
            setMessage('');
            setSelectedContacts(new Set());

        } catch (error) {
            console.error(error);
            alert('Error creating broadcast');
        }
        setIsLoading(false);
    };

    const filteredContacts = contacts.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.whatsapp?.includes(search)
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Broadcast
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? 'Select Recipients' : step === 2 ? 'Compose Message' : 'Review & Send'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    {/* STEP 1: RECIPIENTS */}
                    {step === 1 && (
                        <>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Broadcast Name (Internal)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mb-2"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="flex-1"
                                />
                                <div className="text-sm text-muted-foreground">
                                    {selectedContacts.size} selected
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox
                                    checked={selectedContacts.size > 0 && selectedContacts.size === filteredContacts.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label>Select All ({filteredContacts.length})</Label>
                            </div>

                            <ScrollArea className="flex-1 border rounded-md p-2">
                                <div className="space-y-2">
                                    {filteredContacts.map(contact => (
                                        <div key={contact.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                                            <Checkbox
                                                checked={selectedContacts.has(contact.id)}
                                                onCheckedChange={() => toggleContact(contact.id)}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{contact.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{contact.whatsapp}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    )}

                    {/* STEP 2: CONTENT */}
                    {step === 2 && (
                        <div className="space-y-4 flex flex-col flex-1">
                            <div className="flex justify-between items-center">
                                <Label>Message Content</Label>
                                <TemplatePicker onSelect={setMessage} />
                            </div>
                            <Textarea
                                className="flex-1 resize-none"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                <strong>Preview:</strong><br />
                                {message.replace(/{first_name}/g, '(Roberto)')
                                    .replace(/{full_name}/g, '(Roberto Gomez)')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : setOpen(false)}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                        onClick={() => step === 1 ? setStep(2) : handleSubmit()}
                        disabled={step === 1 && (selectedContacts.size === 0 || !name)}
                    >
                        {step === 1 ? 'Next: Compose' : (isLoading ? 'Creating...' : 'Launch Broadcast')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
