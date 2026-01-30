'use client';

import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn exists, if not I'll just use template literals or import clsx/tailwind-merge

interface InboxLayoutProps {
    filtersPanel: React.ReactNode;
    chatListPanel: React.ReactNode;
    threadPanel: React.ReactNode;
    infoPanel: React.ReactNode;
    className?: string;
}

export function InboxLayout({
    filtersPanel,
    chatListPanel,
    threadPanel,
    infoPanel,
    className
}: InboxLayoutProps) {
    return (
        <div className={cn("flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background", className)}>
            {/* 1. Filters & Search Panel (Small Sidebar) */}
            <div className="w-16 md:w-64 border-r flex flex-col hidden md:flex">
                {filtersPanel}
            </div>

            {/* 2. Chat List Panel */}
            <div className="w-full md:w-80 border-r flex flex-col bg-muted/10">
                {chatListPanel}
            </div>

            {/* 3. Message Thread Panel (Main Content) */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
                {threadPanel}
            </div>

            {/* 4. Info Panel (Right Sidebar) */}
            <div className="w-80 border-l hidden xl:flex flex-col bg-muted/10">
                {infoPanel}
            </div>
        </div>
    );
}
