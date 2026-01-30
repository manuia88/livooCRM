'use client';

import React, { useState, useEffect } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ResponseTemplate } from '@/types/templates';

interface TemplatePickerProps {
    onSelect: (content: string) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
    const supabase = createClient();

    useEffect(() => {
        if (open && templates.length === 0) {
            fetchTemplates();
        }
    }, [open]);

    const fetchTemplates = async () => {
        const { data } = await supabase
            .from('response_templates')
            .select('*')
            .order('name');

        if (data) {
            setTemplates(data as ResponseTemplate[]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Zap className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px]" side="top" align="start">
                <Command>
                    <CommandInput placeholder="Search templates..." />
                    <CommandList>
                        <CommandEmpty>No templates found.</CommandEmpty>
                        <CommandGroup heading="Quick Responses">
                            {templates.map((template) => (
                                <CommandItem
                                    key={template.id}
                                    onSelect={() => {
                                        onSelect(template.content);
                                        setOpen(false);
                                    }}
                                    className="flex flex-col items-start cursor-pointer"
                                >
                                    <span className="font-medium">{template.name}</span>
                                    <span className="text-xs text-muted-foreground line-clamp-2 w-full">
                                        {template.content}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
