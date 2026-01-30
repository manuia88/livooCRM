'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Edit, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ResponseTemplate } from '@/types/templates';

export function TemplateManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', content: '' });
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        setIsLoading(true);
        // Assuming we can get agency_id from context or user profile. 
        // For now fetching all visible to user (RLS should handle it)
        const { data, error } = await supabase
            .from('response_templates')
            .select('*')
            .order('name');

        if (!error && data) {
            setTemplates(data as ResponseTemplate[]);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.content) return;

        // Mock agency ID retrieval - in real app, use auth context
        const { data: user } = await supabase.auth.getUser();
        // Fallback or specific fetching of agency_id required if not in session metadata
        // For simplicity assuming RLS or trigger handles defaults, or fetching first agency

        const { data: agency } = await supabase.from('agencies').select('id').limit(1).single();
        const agencyId = agency?.id;

        if (!agencyId) {
            console.error("No agency found");
            return;
        }

        if (editingId) {
            await supabase
                .from('response_templates')
                .update({ name: formData.name, content: formData.content })
                .eq('id', editingId);
        } else {
            await supabase
                .from('response_templates')
                .insert({
                    name: formData.name,
                    content: formData.content,
                    agency_id: agencyId
                });
        }

        setEditingId(null);
        setFormData({ name: '', content: '' });
        fetchTemplates();
    };

    const handleDelete = async (id: string) => {
        await supabase.from('response_templates').delete().eq('id', id);
        fetchTemplates();
    };

    const startEdit = (t: ResponseTemplate) => {
        setEditingId(t.id);
        setFormData({ name: t.name, content: t.content });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Templates</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Response Templates</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {/* Form */}
                    <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                        <h4 className="text-sm font-medium">{editingId ? 'Edit Template' : 'New Template'}</h4>
                        <Input
                            placeholder="Template Name (e.g., Intro)"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Textarea
                            placeholder="Hello {first_name}, thanks for contacting us..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            rows={3}
                        />
                        <div className="text-xs text-muted-foreground">
                            Available variables: {'{first_name}'}, {'{last_name}'}, {'{full_name}'}
                        </div>
                        <Button onClick={handleSave} size="sm" className="w-full">
                            <Save className="w-4 h-4 mr-2" /> Save Template
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {templates.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/10">
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-sm">{t.content}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => startEdit(t)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-red-500">
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
