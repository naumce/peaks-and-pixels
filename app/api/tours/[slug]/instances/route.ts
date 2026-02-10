import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tours/[slug]/instances - Get available instances for a tour
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = await createClient();

    // Get tour by slug
    const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('id, name, base_price, max_participants')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (tourError || !tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Get upcoming instances with available capacity
    const { data: instances, error } = await supabase
        .from('tour_instances')
        .select('id, start_datetime, end_datetime, capacity_max, capacity_booked, price_override, status')
        .eq('tour_id', tour.id)
        .eq('status', 'scheduled')
        .gt('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only instances with available spots
    const availableInstances = (instances || []).map(inst => ({
        ...inst,
        available_spots: inst.capacity_max - inst.capacity_booked,
        price: inst.price_override || tour.base_price,
    })).filter(inst => inst.available_spots > 0);

    return NextResponse.json({
        tour: {
            id: tour.id,
            name: tour.name,
            base_price: tour.base_price,
        },
        instances: availableInstances,
    });
}
