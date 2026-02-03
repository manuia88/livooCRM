'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Smartphone } from 'lucide-react';

export function WhatsAppConnect() {
    const [qr, setQr] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('disconnected');
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/whatsapp/status');
            const data = await res.json();
            setQr(data.qr);
            setStatus(data.status);
        } catch (e) {
            console.error(e);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            await fetch('/api/whatsapp/status', { method: 'POST' });
            await fetchStatus();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Poll every 3 seconds if not connected
        const interval = setInterval(() => {
            if (status !== 'connected') {
                fetchStatus();
            }
        }, 3000);

        // Initial fetch
        fetchStatus();

        return () => clearInterval(interval);
    }, [status]);

    return (
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    WhatsApp Connection
                </h3>
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {status}
                </span>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/20 rounded border border-dashed p-4">
                {status === 'connected' ? (
                    <div className="text-center text-green-600">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Device Connected</p>
                    </div>
                ) : qr ? (
                    <div className="space-y-4 text-center">
                        <div className="bg-white p-2 rounded inline-block">
                            <QRCodeSVG value={qr} size={180} />
                        </div>
                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                            Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p className="mb-4 text-sm">No active session.</p>
                        <Button onClick={handleConnect} disabled={loading} size="sm">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                            Start Connection
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
