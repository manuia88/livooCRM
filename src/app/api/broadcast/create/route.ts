import { NextResponse, NextRequest } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';
import { withAuth, errorResponse, successResponse } from '@/lib/auth/middleware';
import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic'

/**
 * Endpoint para crear campañas de broadcast
 * 
 * SEGURIDAD: 
 * - Requiere autenticación
 * - Rate limit: 5 broadcasts por minuto (previene spam)
 * Usuario solo puede crear broadcasts para su propia agencia
 */
export const POST = withRateLimit(
  RateLimitPresets.strict, // 5 req/min
  withAuth(async (request: NextRequest, user) => {
    const supabase = createServerAdminClient();
    
    try {
        const body = await request.json();
        const { agency_id, name, message_content, recipient_ids } = body;

        if (!name || !message_content || !recipient_ids || recipient_ids.length === 0) {
            return errorResponse('Missing required fields: name, message_content, recipient_ids', 400);
        }

        // VALIDACIÓN CRÍTICA: Solo puede crear broadcasts para su propia agencia
        if (agency_id && agency_id !== user.agency_id) {
            return errorResponse('You can only create broadcasts for your own agency', 403);
        }

        // Usar el agency_id del usuario autenticado (no confiar en el body)
        const validatedAgencyId = user.agency_id;

        // 1. Create Broadcast Record (usando agency_id validado)
        const { data: broadcast, error: bError } = await supabase
            .from('broadcasts')
            .insert({
                agency_id: validatedAgencyId,
                name,
                message_content,
                status: 'processing', // Auto-start
                total_recipients: recipient_ids.length,
                scheduled_at: new Date().toISOString(), // Immediate
            })
            .select('id')
            .single();

        if (bError) throw bError;

        // 2. Create Recipients
        const recipientsData = recipient_ids.map((id: string) => ({
            broadcast_id: broadcast.id,
            contact_id: id,
            status: 'pending'
        }));

        const { error: rError } = await supabase
            .from('broadcast_recipients')
            .insert(recipientsData);

        if (rError) throw rError;

        // 3. Trigger Processing (Fire and Forget or async)
        // In Vercel, we can fetch another endpoint without awaiting, 
        // OR just rely on the client to poll/dashboard to update.
        // For MVP, we'll try to kick off the process immediately properly.

        // We'll call the PROCESS endpoint internally or just let the separate cron/worker handle it.
        // But since we want immediate effect, we'll trigger it.

        // Note: In production Next.js, use background jobs or Vercel waitUntil.
        // Here we just return success and let a separate trigger handle actual sending if possible,
        // or simplisticly, we assume the user will have a way to "Start".
        // BUT we set status to 'processing', so we should probably start it.

        // We will invoke the process endpoint
        const processUrl = `${new URL(request.url).origin}/api/broadcast/process`;
        fetch(processUrl, {
            method: 'POST',
            body: JSON.stringify({ broadcast_id: broadcast.id }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error("Failed to trigger process", err));

        return successResponse(
            { broadcast_id: broadcast.id },
            "Broadcast created and processing initiated"
        );

    } catch (error: any) {
        console.error('Error creating broadcast:', error);
        return errorResponse(error.message || 'Failed to create broadcast', 500);
    }
  })
);
