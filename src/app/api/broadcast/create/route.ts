import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Service Role)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agency_id, name, message_content, recipient_ids } = body;

        if (!agency_id || !name || !message_content || !recipient_ids || recipient_ids.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Broadcast Record
        const { data: broadcast, error: bError } = await supabase
            .from('broadcasts')
            .insert({
                agency_id,
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

        return NextResponse.json({ success: true, broadcast_id: broadcast.id });

    } catch (error: any) {
        console.error('Error creating broadcast:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
