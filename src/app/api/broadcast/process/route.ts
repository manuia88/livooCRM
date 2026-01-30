import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { textWhatsAppService } from '@/lib/whatsapp/service';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This endpoint processes a specific broadcast's pending messages
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { broadcast_id } = body;

        if (!broadcast_id) return NextResponse.json({ error: 'Missing broadcast_id' }, { status: 400 });

        // 1. Get Broadcast details
        const { data: broadcast } = await supabase
            .from('broadcasts')
            .select('*')
            .eq('id', broadcast_id)
            .single();

        if (!broadcast) return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });

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
            // Mark broadcast complete if no pending? 
            // We should check count first. For now, assume done.
            await supabase.from('broadcasts').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', broadcast_id);
            return NextResponse.json({ message: 'No pending recipients' });
        }

        // 3. Process Batch
        const results = [];
        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of recipients) {
            const contact = recipient.contact; // flattened by Supabase usually? OR nested object
            // Typescript check needed if using types, here using 'any' implicit
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
        await supabase.rpc('increment_broadcast_stats', {
            b_id: broadcast_id,
            sent: sentCount,
            failed: failedCount
        }).catch(async () => {
            // Fallback manual update if RPC missing
            // In real app, create the RPC function. 
            // Here we just increment simply manually, might have race conditions but okay for MVP
            const { data: current } = await supabase.from('broadcasts').select('sent_count, failed_count').eq('id', broadcast_id).single();
            if (current) {
                await supabase.from('broadcasts').update({
                    sent_count: (current.sent_count || 0) + sentCount,
                    failed_count: (current.failed_count || 0) + failedCount
                }).eq('id', broadcast_id);
            }
        });

        // 4. Continue?
        // If we processed a full batch, we might trigger again recursively or wait for next cron
        // For this demo, we stop here (one batch at a time).

        return NextResponse.json({
            success: true,
            processed: recipients.length,
            sent: sentCount,
            failed: failedCount
        });

    } catch (error: any) {
        console.error('Error processing broadcast:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function updateRecipientStatus(id: string, status: string, error?: string) {
    const update: any = { status, sent_at: new Date().toISOString() };
    if (error) update.error_message = error;
    await supabase.from('broadcast_recipients').update(update).eq('id', id);
}
