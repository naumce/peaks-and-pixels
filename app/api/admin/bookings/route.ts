import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/bookings - List all bookings
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let query = supabase
        .from('bookings')
        .select(`
            id,
            reference,
            participant_count,
            total_amount,
            booking_status,
            payment_status,
            lead_participant_name,
            lead_participant_email,
            created_at,
            tour_instance:tour_instances (
                id,
                start_datetime,
                tour:tours (
                    id,
                    name,
                    slug
                )
            ),
            customer:users (
                id,
                first_name,
                last_name,
                email
            )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (status && status !== 'all') {
        query = query.eq('booking_status', status);
    }

    // Use proper Supabase filtering instead of raw string interpolation
    if (search) {
        const term = `%${search}%`;
        query = query.or(`reference.ilike.${term},lead_participant_name.ilike.${term},lead_participant_email.ilike.${term}`);
    }

    const { data: bookings, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(bookings || []);
}
