import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const body = await request.json();

        // Auth check (Supabase client handles token automatically)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('properties')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating property:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    // Soft delete
    const { error } = await supabase
        .from('properties')
        .update({ deleted_at: new Date().toISOString(), status: 'archived' })
        .eq('id', id);

    if (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
