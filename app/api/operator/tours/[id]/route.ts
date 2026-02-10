import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const ALLOWED_TOUR_FIELDS = [
    'name', 'slug', 'tagline', 'description', 'type', 'difficulty',
    'duration_minutes', 'duration_display', 'min_participants', 'max_participants',
    'base_price', 'whats_included', 'whats_not_included', 'what_to_bring',
    'meeting_point', 'meeting_point_lat', 'meeting_point_lng', 'location_area',
    'cover_image', 'featured_images', 'gallery_images', 'highlights',
    'status', 'is_seasonal', 'seasonal_months',
    'route_data', 'distance_km', 'itinerary', 'photo_opportunities',
    'fitness_requirements', 'age_requirements',
] as const;

function sanitizeTourUpdate(body: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    if (body.price_base !== undefined) sanitized.base_price = body.price_base;
    if (body.short_description !== undefined) sanitized.tagline = body.short_description;

    for (const field of ALLOWED_TOUR_FIELDS) {
        if (body[field] !== undefined) {
            sanitized[field] = body[field];
        }
    }

    // Operators cannot set is_featured
    delete sanitized.is_featured;

    if (sanitized.name && typeof sanitized.name === 'string') {
        sanitized.slug = sanitized.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    return sanitized;
}

// GET /api/operator/tours/[id] - Get my tour
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();

    const { data: tour, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .eq('operator_id', auth.userId)
        .single();

    if (error) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json(tour);
}

// PATCH /api/operator/tours/[id] - Update my tour
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const updates = sanitizeTourUpdate(body);

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: tour, error } = await supabase
        .from('tours')
        .update(updates)
        .eq('id', id)
        .eq('operator_id', auth.userId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour);
}

// DELETE /api/operator/tours/[id] - Delete my draft tour
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createClient();

    // Only allow deleting drafts
    const { data: tour } = await supabase
        .from('tours')
        .select('status')
        .eq('id', id)
        .eq('operator_id', auth.userId)
        .single();

    if (!tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (tour.status !== 'draft') {
        return NextResponse.json({ error: 'Only draft tours can be deleted' }, { status: 409 });
    }

    const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id)
        .eq('operator_id', auth.userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
