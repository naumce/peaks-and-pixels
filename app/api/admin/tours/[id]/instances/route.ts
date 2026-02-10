import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/tours/[id]/instances - List tour instances
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: instances, error } = await supabase
        .from('tour_instances')
        .select('*')
        .eq('tour_id', id)
        .order('start_datetime', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(instances || []);
}

// POST /api/admin/tours/[id]/instances - Create tour instance
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.start_datetime || !body.end_datetime) {
        return NextResponse.json({ error: 'start_datetime and end_datetime are required' }, { status: 400 });
    }

    const instanceData = {
        tour_id: id,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
        capacity_max: body.capacity_max || 12,
        capacity_booked: 0,
        price_override: body.price_override || null,
        guide_id: body.guide_id || null,
        status: 'scheduled',
    };

    const { data: instance, error } = await supabase
        .from('tour_instances')
        .insert(instanceData)
        .select()
        .single();

    if (error) {
        console.error('Error creating instance:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(instance, { status: 201 });
}
