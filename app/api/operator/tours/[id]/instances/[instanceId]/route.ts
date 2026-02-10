import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

const ALLOWED_INSTANCE_FIELDS = [
    'start_datetime', 'end_datetime', 'capacity_max',
    'price_override', 'status', 'cancellation_reason',
    'weather_checked_at', 'weather_decision', 'weather_notes',
] as const;

// PATCH /api/operator/tours/[id]/instances/[instanceId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id, instanceId } = await params;
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

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_INSTANCE_FIELDS) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: instance, error } = await supabase
        .from('tour_instances')
        .update(updates)
        .eq('id', instanceId)
        .eq('tour_id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(instance);
}

// DELETE /api/operator/tours/[id]/instances/[instanceId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id, instanceId } = await params;
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

    // Check for active bookings
    const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('tour_instance_id', instanceId)
        .neq('booking_status', 'cancelled');

    if (count && count > 0) {
        return NextResponse.json(
            { error: `Cannot delete: ${count} active booking(s) exist for this instance` },
            { status: 409 }
        );
    }

    const { error } = await supabase
        .from('tour_instances')
        .delete()
        .eq('id', instanceId)
        .eq('tour_id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
