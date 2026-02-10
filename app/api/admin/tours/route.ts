import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/tours - List all tours
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();

    const { data: tours, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tours);
}

// POST /api/admin/tours - Create new tour
export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.name) {
        return NextResponse.json({ error: 'Tour name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Map incoming fields to database columns with explicit allow-list
    const tourData = {
        slug,
        name: body.name,
        tagline: body.tagline || body.short_description || null,
        description: body.description || '',
        type: body.type || 'hiking',
        difficulty: body.difficulty || 'moderate',
        duration_minutes: body.duration_minutes || (body.duration_days || 1) * 480,
        duration_display: body.duration_display || `${body.duration_days || 1} day${(body.duration_days || 1) > 1 ? 's' : ''}`,
        min_participants: body.min_participants || 1,
        max_participants: body.max_participants || 12,
        base_price: body.base_price || body.price_base || 89,
        whats_included: body.whats_included || [],
        whats_not_included: body.whats_not_included || [],
        what_to_bring: body.what_to_bring || [],
        meeting_point: body.meeting_point || body.location_area || 'TBD',
        meeting_point_lat: body.meeting_point_lat || null,
        meeting_point_lng: body.meeting_point_lng || null,
        location_area: body.location_area || null,
        cover_image: body.cover_image || null,
        route_data: body.route_data || null,
        distance_km: body.distance_km || 0,
        is_featured: body.is_featured || false,
        status: body.status || 'draft',
        featured_images: body.cover_image ? [body.cover_image] : [],
        gallery_images: body.gallery_images || [],
        highlights: body.highlights || [],
        is_seasonal: false,
        seasonal_months: [],
        itinerary: body.itinerary || [],
        photo_opportunities: body.photo_opportunities !== false,
    };

    const { data: tour, error } = await supabase
        .from('tours')
        .insert(tourData)
        .select()
        .single();

    if (error) {
        console.error('Tour creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour, { status: 201 });
}
