import { NextResponse, NextRequest } from 'next/server';
import { textWhatsAppService } from '@/lib/whatsapp/service';
import { withAuth, errorResponse, successResponse } from '@/lib/auth/middleware';
import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * Endpoint para enviar mensajes de WhatsApp
 * 
 * SEGURIDAD: 
 * - Requiere autenticación
 * - Rate limit: 10 mensajes por minuto
 * Solo usuarios autenticados de la agencia pueden enviar mensajes
 */
export const POST = withRateLimit(
  RateLimitPresets.standard, // 10 req/min
  withAuth(async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return errorResponse('Missing "to" or "message" fields', 400);
        }

        // Ensure connection is active
        if (textWhatsAppService.getStatus() !== 'connected') {
            return errorResponse('WhatsApp is not connected', 503);
        }

        const result = await textWhatsAppService.sendMessage(to, message);

        return successResponse({ result }, 'Message sent successfully');
    } catch (error: any) {
        console.error('Error in /api/whatsapp/send:', error);
        return errorResponse(error.message || 'Failed to send message', 500);
    }
  })
);
