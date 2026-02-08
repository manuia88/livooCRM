'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { MessageSquare, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function WhatsAppConnect() {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
    const [qrCode, setQrCode] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState('')
    const [isInitializing, setIsInitializing] = useState(false)

    // Verify status on load
    useEffect(() => {
        checkStatus()

        // Polling every 5 seconds
        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    async function checkStatus() {
        try {
            const response = await fetch('/api/whatsapp/status')
            const data = await response.json()

            if (data.isConnected) {
                setStatus('connected')
                setPhoneNumber(data.phoneNumber)
                setQrCode('')
            } else if (data.qrCode) {
                setStatus('connecting')
                setQrCode(data.qrCode)
            } else {
                setStatus('disconnected')
            }
        } catch (err) {
            console.error('Check status error:', err)
        }
    }

    async function handleConnect() {
        try {
            setError('')
            setIsInitializing(true)
            setStatus('connecting')

            const response = await fetch('/api/whatsapp/connect', {
                method: 'POST'
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error)
            }

            // Wait for QR to be generated
            setTimeout(checkStatus, 2000)

        } catch (err: any) {
            setError(err.message)
            setStatus('disconnected')
        } finally {
            setIsInitializing(false)
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
                    Connect your WhatsApp number to send messages directly from the CRM.
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
                                <p className="font-semibold text-green-900">Connected</p>
                                <p className="text-sm text-green-700">{phoneNumber}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            You can now send WhatsApp messages from the CRM. The session will remain active for approximately 30 days.
                        </p>

                        <Button variant="outline" onClick={handleConnect} disabled={isInitializing} className="w-full">
                            <RefreshCw className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
                            Refresh Connection
                        </Button>
                    </div>
                )}

                {/* Connecting (show QR) */}
                {status === 'connecting' && qrCode && (
                    <div className="flex flex-col items-center gap-6 p-4">
                        <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                            <QRCodeSVG value={qrCode} size={200} />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-semibold">Scan QR Code</p>
                            <ol className="text-sm text-gray-600 text-left list-decimal list-inside space-y-1">
                                <li>Open WhatsApp on your phone</li>
                                <li>Tap Menu (⋮ or ⚙️) → Linked Devices</li>
                                <li>Tap "Link a Device"</li>
                                <li>Point your phone to this screen to scan</li>
                            </ol>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-amber-600 animate-pulse font-medium">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Waiting for scan...
                        </div>
                    </div>
                )}

                {/* Loading/Initializing */}
                {status === 'connecting' && !qrCode && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                        <p className="text-gray-500 font-medium">Initializing connection...</p>
                    </div>
                )}

                {/* Disconnected */}
                {status === 'disconnected' && (
                    <div className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                                <AlertCircle className="h-4 w-4" />
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
                                    Generating QR...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Connect WhatsApp
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                            Works with WhatsApp Business or normal WhatsApp. The connection is secure and remains active.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
