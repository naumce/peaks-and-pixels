import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// POST /api/admin/routes - Save route for a tour
export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();
    const body = await request.json();

    const { tourId, routeData, distanceKm, meetingPoint, waypoints } = body;

    if (!tourId || !routeData) {
        return NextResponse.json({ error: 'tourId and routeData are required' }, { status: 400 });
    }

    // Update tour with route data
    const { error: tourError } = await supabase
        .from('tours')
        .update({
            route_data: routeData,
            distance_km: distanceKm || 0,
            meeting_point_lat: meetingPoint?.lat || null,
            meeting_point_lng: meetingPoint?.lng || null,
        })
        .eq('id', tourId);

    if (tourError) {
        console.error('Tour update error:', tourError);
        return NextResponse.json({ error: 'Failed to save route data' }, { status: 500 });
    }

    // Store waypoints if provided
    if (waypoints && waypoints.length > 0) {
        const { error: deleteError } = await supabase
            .from('tour_waypoints')
            .delete()
            .eq('tour_id', tourId);

        if (deleteError) {
            console.error('Waypoints delete error:', deleteError);
        }

        const waypointRecords = waypoints.map((wp: { position: { lat: number; lng: number }; type: string; title: string; description?: string; images?: string[] }, index: number) => ({
            tour_id: tourId,
            position: wp.position,
            waypoint_type: wp.type,
            title: wp.title,
            description: wp.description || null,
            photo_url: wp.images?.[0] || null,
            order_index: index,
        }));

        const { error: insertError } = await supabase
            .from('tour_waypoints')
            .insert(waypointRecords);

        if (insertError) {
            console.error('Waypoints insert error:', insertError);
            return NextResponse.json({
                success: true,
                warning: 'Route saved but waypoints failed: ' + insertError.message
            });
        }
    }

    return NextResponse.json({ success: true });
}
