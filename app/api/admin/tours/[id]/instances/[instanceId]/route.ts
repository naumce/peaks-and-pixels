import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

const ALLOWED_INSTANCE_FIELDS = [
    'start_datetime', 'end_datetime', 'capacity_max',
    'price_override', 'guide_id', 'status', 'cancellation_reason',
    'weather_checked_at', 'weather_decision', 'weather_notes',
] as const;

// PATCH /api/admin/tours/[id]/instances/[instanceId] - Update instance
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { instanceId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    // Only allow whitelisted fields
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
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(instance);
}

// DELETE /api/admin/tours/[id]/instances/[instanceId] - Delete instance
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { instanceId } = await params;
    const supabase = createAdminClient();

    // Check for existing bookings before deleting
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
        .eq('id', instanceId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
