import { NextResponse } from 'next/server';
import { textWhatsAppService } from '@/lib/whatsapp/service';

export async function GET() {
    // Ensure connection process is started
    if (textWhatsAppService.getStatus() !== 'connected') {
        await textWhatsAppService.connect();
    }

    // Give it a moment (hacky) if it was just initializing, or just return what we have
    // In a real app we'd use polling or SSE.

    const qr = textWhatsAppService.getQR();
    const status = textWhatsAppService.getStatus();

    return NextResponse.json({ qr, status });
}

export async function POST() {
    // Force reconnect if needed
    await textWhatsAppService.connect();
    return NextResponse.json({ status: 'connecting' });
}
