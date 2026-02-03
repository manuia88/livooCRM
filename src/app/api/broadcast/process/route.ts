import { NextResponse, NextRequest } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';
import { textWhatsAppService } from '@/lib/whatsapp/service';
import { withAuth, errorResponse, successResponse } from '@/lib/auth/middleware';
import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * Endpoint para procesar broadcasts pendientes
 * 
 * SEGURIDAD: 
 * - Requiere autenticación
 * - Rate limit: 30 req/min (permite procesar múltiples batches)
 * Usuario solo puede procesar broadcasts de su propia agencia
 */
export const POST = withRateLimit(
  RateLimitPresets.moderate, // 30 req/min
  withAuth(async (request: NextRequest, user) => {
    const supabase = createServerAdminClient();
    
    try {
        const body = await request.json();
        const { broadcast_id } = body;

        if (!broadcast_id) return errorResponse('Missing broadcast_id', 400);

        // 1. Get Broadcast details
        const { data: broadcast } = await supabase
            .from('broadcasts')
            .select('*')
            .eq('id', broadcast_id)
            .single();

        if (!broadcast) {
            return errorResponse('Broadcast not found', 404);
        }

        // VALIDACIÓN CRÍTICA: Solo puede procesar broadcasts de su propia agencia
        if (broadcast.agency_id !== user.agency_id) {
            return errorResponse('You can only process broadcasts from your own agency', 403);
        }

        // 2. Get Pending Recipients
        const { data: recipients } = await supabase
            .from('broadcast_recipients')
            .select(`
                id,
                contact_id,
                contact:contacts(first_name, last_name, full_name, whatsapp)
            `)
            .eq('broadcast_id', broadcast_id)
            .eq('status', 'pending')
            .limit(50); // Batch size

        if (!recipients || recipients.length === 0) {
            // Mark broadcast complete if no pending
            await supabase.from('broadcasts').update({ 
                status: 'completed', 
                completed_at: new Date().toISOString() 
            }).eq('id', broadcast_id);
            return successResponse({ processed: 0 }, 'No pending recipients');
        }

        // 3. Process Batch
        const results = [];
        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of (recipients || [])) {
            // Supabase returns relation as array if not uniquely linked or due to query structure
            const contact: any = Array.isArray(recipient.contact) ? recipient.contact[0] : recipient.contact;
            const phone = contact?.whatsapp;

            if (!phone) {
                await updateRecipientStatus(recipient.id, 'failed', 'No phone number');
                failedCount++;
                continue;
            }

            // Variable Substitution
            let content = broadcast.message_content;
            content = content
                .replace(/{first_name}/g, contact.first_name || '')
                .replace(/{last_name}/g, contact.last_name || '')
                .replace(/{full_name}/g, contact.full_name || '');

            try {
                // Send via Service
                await textWhatsAppService.sendMessage(phone, content);
                await updateRecipientStatus(recipient.id, 'sent');
                sentCount++;
            } catch (error: any) {
                console.error(`Failed to send to ${phone}`, error);
                await updateRecipientStatus(recipient.id, 'failed', error.message);
                failedCount++;
            }

            // Small delay between batch items to prevent immediate blocking if queue is full
            await new Promise(r => setTimeout(r, 500));
        }

        // Update Broadcast Stats
        try {
            const { error: rpcError } = await supabase.rpc('increment_broadcast_stats', {
                b_id: broadcast_id,
                sent: sentCount,
                failed: failedCount
            });
            if (rpcError) throw rpcError;
        } catch (err) {
            // Fallback manual update if RPC missing
            const { data: current } = await supabase.from('broadcasts').select('sent_count, failed_count').eq('id', broadcast_id).single();
            if (current) {
                await supabase.from('broadcasts').update({
                    sent_count: (current.sent_count || 0) + sentCount,
                    failed_count: (current.failed_count || 0) + failedCount
                }).eq('id', broadcast_id);
            }
        }

        // 4. Continue?
        // If we processed a full batch, we might trigger again recursively or wait for next cron
        // For this demo, we stop here (one batch at a time).

        return successResponse(
            {
                processed: recipients.length,
                sent: sentCount,
                failed: failedCount
            },
            `Processed ${recipients.length} recipients (${sentCount} sent, ${failedCount} failed)`
        );

    } catch (error: any) {
        console.error('Error processing broadcast:', error);
        return errorResponse(error.message || 'Failed to process broadcast', 500);
    }
  })
);

async function updateRecipientStatus(id: string, status: string, error?: string) {
    const supabase = createServerAdminClient();
    const update: any = { status, sent_at: new Date().toISOString() };
    if (error) update.error_message = error;
    await supabase.from('broadcast_recipients').update(update).eq('id', id);
}
