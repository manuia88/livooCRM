import { NextResponse } from 'next/server';
import { textWhatsAppService } from '@/lib/whatsapp/service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json(
                { error: 'Missing "to" or "message" fields' },
                { status: 400 }
            );
        }

        // Ensure connection is active
        if (textWhatsAppService.getStatus() !== 'connected') {
            return NextResponse.json(
                { error: 'WhatsApp is not connected' },
                { status: 503 }
            );
        }

        const result = await textWhatsAppService.sendMessage(to, message);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Error in /api/whatsapp/send:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
