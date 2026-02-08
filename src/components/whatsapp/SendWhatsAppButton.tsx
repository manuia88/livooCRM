'use client'

import { useState } from 'react'
import { MessageSquare, Loader2, Send, ExternalLink, X } from 'lucide-react'
import { Button as AppleButton } from '@/components/backoffice/PageContainer'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

interface SendWhatsAppButtonProps {
    phoneNumber: string
    contactId?: string
    message?: string
}

export default function SendWhatsAppButton({
    phoneNumber,
    contactId,
    message = ''
}: SendWhatsAppButtonProps) {
    const [isSending, setIsSending] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [customMessage, setCustomMessage] = useState(message)

    async function handleSend() {
        if (!customMessage.trim()) {
            toast.error('Please enter a message')
            return
        }

        setIsSending(true)

        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    message: customMessage,
                    contactId
                })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error)
            }

            toast.success('Message sent successfully')
            setShowModal(false)

        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        } finally {
            setIsSending(false)
        }
    }

    // Fallback link
    const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMessage)}`

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <AppleButton variant="secondary" className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    WhatsApp
                </AppleButton>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Send WhatsApp Message</DialogTitle>
                    <DialogDescription>
                        Destination: <span className="font-medium text-gray-900">{phoneNumber}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[120px] rounded-xl border-gray-200 focus:ring-[#B8975A] focus:border-[#B8975A]"
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-green-600 hover:text-green-700 font-medium hover:underline py-2"
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open in WhatsApp Web (Fallback)
                        </a>
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isSending}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
