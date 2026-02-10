import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

// GET /api/operator/tours/[id]/instances - List instances for my tour
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();

    // Verify tour ownership
    const { data: tour } = await supabase
        .from('tours')
        .select('id')
        .eq('id', id)
        .eq('operator_id', auth.userId)
        .single();

    if (!tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

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

// POST /api/operator/tours/[id]/instances - Create instance for my tour
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // Verify tour ownership
    const { data: tour } = await supabase
        .from('tours')
        .select('id')
        .eq('id', id)
        .eq('operator_id', auth.userId)
        .single();

    if (!tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

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
        guide_id: auth.userId,
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
