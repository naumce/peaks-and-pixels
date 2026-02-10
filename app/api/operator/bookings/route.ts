import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

// GET /api/operator/bookings - List bookings for my tour instances
export async function GET(request: NextRequest) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // First get my tour IDs
    const { data: myTours } = await supabase
        .from('tours')
        .select('id')
        .eq('operator_id', auth.userId);

    if (!myTours || myTours.length === 0) {
        return NextResponse.json([]);
    }

    const myTourIds = myTours.map(t => t.id);

    // Get instances for my tours
    const { data: myInstances } = await supabase
        .from('tour_instances')
        .select('id')
        .in('tour_id', myTourIds);

    if (!myInstances || myInstances.length === 0) {
        return NextResponse.json([]);
    }

    const myInstanceIds = myInstances.map(i => i.id);

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
        .in('tour_instance_id', myInstanceIds)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (status && status !== 'all') {
        query = query.eq('booking_status', status);
    }

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
