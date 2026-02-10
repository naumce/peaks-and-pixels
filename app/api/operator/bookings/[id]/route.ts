import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

// GET /api/operator/bookings/[id] - Get single booking detail (read-only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();

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
                status,
                tour:tours (
                    id,
                    name,
                    slug,
                    cover_image,
                    location_area,
                    operator_id
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

    if (error || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify this booking belongs to operator's tour
    const tour = (booking.tour_instance as any)?.tour;
    if (!tour || tour.operator_id !== auth.userId) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
}
