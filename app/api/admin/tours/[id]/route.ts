import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Explicit allow-list of fields that can be updated
const ALLOWED_TOUR_FIELDS = [
    'name', 'slug', 'tagline', 'description', 'type', 'difficulty',
    'duration_minutes', 'duration_display', 'min_participants', 'max_participants',
    'base_price', 'whats_included', 'whats_not_included', 'what_to_bring',
    'meeting_point', 'meeting_point_lat', 'meeting_point_lng', 'location_area',
    'cover_image', 'featured_images', 'gallery_images', 'highlights',
    'status', 'is_featured', 'is_seasonal', 'seasonal_months',
    'route_data', 'distance_km', 'itinerary', 'photo_opportunities',
    'fitness_requirements', 'age_requirements', 'seo_title', 'seo_description',
] as const;

function sanitizeTourUpdate(body: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    // Map aliased field names to canonical DB names
    if (body.price_base !== undefined) {
        sanitized.base_price = body.price_base;
    }
    if (body.short_description !== undefined) {
        sanitized.tagline = body.short_description;
    }

    for (const field of ALLOWED_TOUR_FIELDS) {
        if (body[field] !== undefined) {
            sanitized[field] = body[field];
        }
    }

    // Auto-generate slug from name
    if (sanitized.name && typeof sanitized.name === 'string') {
        sanitized.slug = sanitized.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    return sanitized;
}

// GET /api/admin/tours/[id] - Get single tour
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: tour, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(tour);
}

// PATCH /api/admin/tours/[id] - Update tour
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const updates = sanitizeTourUpdate(body);

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: tour, error } = await supabase
        .from('tours')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour);
}

// DELETE /api/admin/tours/[id] - Delete tour
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
