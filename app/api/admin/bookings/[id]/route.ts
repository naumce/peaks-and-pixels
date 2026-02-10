import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/bookings/[id] - Get single booking
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            *,
            tour_instance:tour_instances (
                id,
                start_datetime,
                end_datetime,
                capacity_max,
                capacity_booked,
                tour:tours (
                    id,
                    name,
                    slug,
                    cover_image,
                    location_area,
                    meeting_point
                )
            ),
            customer:users (
                id,
                first_name,
                last_name,
                email,
                phone
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(booking);
}

// PATCH /api/admin/bookings/[id] - Update booking
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    // If marking as cancelled, update instance capacity atomically
    if (body.booking_status === 'cancelled') {
        const { data: currentBooking } = await supabase
            .from('bookings')
            .select('participant_count, tour_instance_id, booking_status')
            .eq('id', id)
            .single();

        if (currentBooking && currentBooking.booking_status !== 'cancelled') {
            const { data: instance } = await supabase
                .from('tour_instances')
                .select('capacity_booked')
                .eq('id', currentBooking.tour_instance_id)
                .single();

            if (instance) {
                const newCapacity = Math.max(0, instance.capacity_booked - currentBooking.participant_count);
                const { error: capError } = await supabase
                    .from('tour_instances')
                    .update({ capacity_booked: newCapacity })
                    .eq('id', currentBooking.tour_instance_id);

                if (capError) {
                    console.error('Failed to update capacity:', capError);
                    return NextResponse.json(
                        { error: 'Failed to release tour capacity. Cancellation aborted.' },
                        { status: 500 }
                    );
                }
            }
        }

        body.cancelled_at = new Date().toISOString();
        body.cancelled_by = 'admin';
    }

    // Only allow specific booking fields
    const ALLOWED_FIELDS = [
        'booking_status', 'payment_status', 'cancelled_at', 'cancelled_by',
        'cancellation_reason', 'refund_amount', 'refunded_at', 'special_requests',
    ];
    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    const { data: booking, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(booking);
}
