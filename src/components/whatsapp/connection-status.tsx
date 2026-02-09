// src/components/whatsapp/connection-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, Smartphone } from 'lucide-react'
import QRCode from 'react-qr-code'

type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting_scan' | 'connected'

interface WhatsAppStatus {
  status: ConnectionStatus
  phoneNumber?: string
  qrCode?: string
}

export function WhatsAppConnectionStatus() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'disconnected'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchStatus()
    }, 2000)

    fetchStatus()

    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      const data = await response.json()

      if (data.success) {
        setStatus({
          status: data.status,
          phoneNumber: data.phoneNumber,
          qrCode: data.qrCode
        })
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to connect')
      }

      console.log('Connection started')

    } catch (err: any) {
      setError(err.message)
      console.error('Connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to disconnect')
      }

      setStatus({ status: 'disconnected' })

    } catch (err: any) {
      setError(err.message)
      console.error('Disconnect error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">WhatsApp Connection</h3>
        <StatusBadge status={status.status} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {status.status === 'disconnected' && (
        <div className="text-center py-8">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">No active session.</p>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Connection'
            )}
          </Button>
        </div>
      )}

      {status.status === 'connecting' && (
        <div className="text-center py-8">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Initializing WhatsApp connection...</p>
        </div>
      )}

      {status.status === 'waiting_scan' && status.qrCode && (
        <div className="text-center py-8">
          <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-sm">
            <QRCode
              value={status.qrCode}
              size={256}
              level="H"
            />
          </div>
          <p className="text-gray-600 mb-2">
            Scan this QR code with WhatsApp
          </p>
          <p className="text-sm text-gray-500">
            Open WhatsApp &rarr; Settings &rarr; Linked Devices &rarr; Link a Device
          </p>
        </div>
      )}

      {status.status === 'connected' && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-gray-600 mb-2">Connected successfully!</p>
          {status.phoneNumber && (
            <p className="text-sm text-gray-500 mb-4">
              Number: {status.phoneNumber}
            </p>
          )}
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    disconnected: {
      label: 'Disconnected',
      color: 'bg-gray-100 text-gray-700',
      icon: XCircle
    },
    connecting: {
      label: 'Connecting',
      color: 'bg-blue-100 text-blue-700',
      icon: Loader2
    },
    waiting_scan: {
      label: 'Waiting Scan',
      color: 'bg-yellow-100 text-yellow-700',
      icon: Smartphone
    },
    connected: {
      label: 'Connected',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle2
    }
  }

  const { label, color, icon: Icon } = config[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  )
}
