'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Smartphone, Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';

export function WhatsAppConnect() {
    const [qr, setQr] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('disconnected');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/status');
            const data = await res.json();

            if (data.isConnected) {
                setStatus('connected');
                setPhoneNumber(data.phoneNumber || '');
                setQr(null);
            } else if (data.qrCode) {
                setStatus('waiting_scan');
                setQr(data.qrCode);
            } else if (data.status === 'connecting') {
                setStatus('connecting');
                setQr(null);
            } else {
                setStatus('disconnected');
                setQr(null);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect');
            }

            setStatus('connecting');
            toast.success('Conexion iniciada...');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to disconnect');
            }

            setStatus('disconnected');
            setQr(null);
            setPhoneNumber('');
            toast.success('WhatsApp desconectado');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Poll every 2 seconds
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    return (
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    WhatsApp Connection
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                        status === 'connected' ? 'bg-green-500' :
                        status === 'waiting_scan' || status === 'connecting' ? 'bg-amber-500 animate-pulse' :
                        'bg-gray-400'
                    }`} />
                    <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                        {status === 'waiting_scan' ? 'QR Ready' : status}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/20 rounded border border-dashed p-4">
                {status === 'connected' ? (
                    <div className="text-center space-y-3">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                        <div>
                            <p className="font-medium text-green-700">Dispositivo conectado</p>
                            {phoneNumber && (
                                <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                            )}
                        </div>
                        <Button
                            onClick={handleDisconnect}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Power className="w-4 h-4 mr-2" />
                            )}
                            Desconectar
                        </Button>
                    </div>
                ) : status === 'waiting_scan' && qr ? (
                    <div className="space-y-4 text-center">
                        <div className="bg-white p-2 rounded inline-block shadow-sm">
                            <QRCodeSVG value={qr} size={180} />
                        </div>
                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                            Abre WhatsApp &gt; Dispositivos vinculados &gt; Vincular dispositivo
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Esperando escaneo...
                        </div>
                    </div>
                ) : status === 'connecting' ? (
                    <div className="text-center space-y-3">
                        <Loader2 className="w-10 h-10 mx-auto animate-spin text-green-600" />
                        <p className="text-sm text-muted-foreground">Inicializando...</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p className="mb-4 text-sm">Sin sesion activa.</p>
                        <Button onClick={handleConnect} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                            Conectar WhatsApp
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
