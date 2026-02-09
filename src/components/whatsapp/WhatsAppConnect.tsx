'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { MessageSquare, Check, Loader2, AlertCircle, RefreshCw, Power } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting_scan' | 'connected'

export default function WhatsAppConnect() {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected')
    const [qrCode, setQrCode] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState('')
    const [isInitializing, setIsInitializing] = useState(false)
    const [isDisconnecting, setIsDisconnecting] = useState(false)

    const checkStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/whatsapp/status')
            const data = await response.json()

            if (data.isConnected) {
                setStatus('connected')
                setPhoneNumber(data.phoneNumber || '')
                setQrCode('')
            } else if (data.qrCode) {
                setStatus('waiting_scan')
                setQrCode(data.qrCode)
            } else if (data.status === 'connecting') {
                setStatus('connecting')
            } else {
                setStatus('disconnected')
            }
        } catch (err) {
            console.error('Check status error:', err)
        }
    }, [])

    // Poll every 2 seconds for responsive updates
    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 2000)
        return () => clearInterval(interval)
    }, [checkStatus])

    async function handleConnect() {
        try {
            setError('')
            setIsInitializing(true)
            setStatus('connecting')

            const response = await fetch('/api/whatsapp/connect', { method: 'POST' })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect')
            }

            toast.success('Conexion iniciada. Esperando QR...')
        } catch (err: any) {
            setError(err.message)
            setStatus('disconnected')
            toast.error(`Error: ${err.message}`)
        } finally {
            setIsInitializing(false)
        }
    }

    async function handleDisconnect() {
        try {
            setIsDisconnecting(true)
            const response = await fetch('/api/whatsapp/disconnect', { method: 'POST' })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to disconnect')
            }

            setStatus('disconnected')
            setPhoneNumber('')
            setQrCode('')
            toast.success('WhatsApp desconectado')
        } catch (err: any) {
            toast.error(`Error: ${err.message}`)
        } finally {
            setIsDisconnecting(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <CardTitle>WhatsApp Integration</CardTitle>
                </div>
                <CardDescription>
                    Conecta tu numero de WhatsApp para enviar mensajes desde el CRM.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Connected */}
                {status === 'connected' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-900">Conectado</p>
                                <p className="text-sm text-green-700">{phoneNumber}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            Ya puedes enviar mensajes de WhatsApp desde el CRM. La sesion se mantiene activa por ~30 dias.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleConnect}
                                disabled={isInitializing}
                                className="flex-1"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
                                Reconectar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                                className="flex-1"
                            >
                                {isDisconnecting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Power className="h-4 w-4 mr-2" />
                                )}
                                Desconectar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Connecting (show QR) */}
                {status === 'waiting_scan' && qrCode && (
                    <div className="flex flex-col items-center gap-6 p-4">
                        <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                            <QRCodeSVG value={qrCode} size={200} />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-semibold">Escanea el codigo QR</p>
                            <ol className="text-sm text-gray-600 text-left list-decimal list-inside space-y-1">
                                <li>Abre WhatsApp en tu telefono</li>
                                <li>Toca Menu &rarr; Dispositivos vinculados</li>
                                <li>Toca &quot;Vincular un dispositivo&quot;</li>
                                <li>Apunta tu telefono a esta pantalla</li>
                            </ol>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-amber-600 animate-pulse font-medium">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Esperando escaneo...
                        </div>
                    </div>
                )}

                {/* Loading/Initializing */}
                {(status === 'connecting' || (status === 'waiting_scan' && !qrCode)) && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                        <p className="text-gray-500 font-medium">Inicializando conexion...</p>
                    </div>
                )}

                {/* Disconnected */}
                {status === 'disconnected' && (
                    <div className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleConnect}
                            disabled={isInitializing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all hover:scale-[1.02]"
                        >
                            {isInitializing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generando QR...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Conectar WhatsApp
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                            Funciona con WhatsApp Business o WhatsApp normal. La conexion es segura y persistente.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
