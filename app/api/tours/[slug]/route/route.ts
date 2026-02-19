import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/tours/[slug]/route - Get route data for a tour
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { slug } = await params;
    const supabase = await createClient();

    // Get the tour with route data
    const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('id, route_data, distance_km, meeting_point_lat, meeting_point_lng')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (tourError || !tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    interface Waypoint {
        lat: number;
        lng: number;
        type: string;
        title: string;
        description?: string;
        images?: string[];
        order: number;
    }

    let waypoints: Waypoint[] = [];

    // First try to parse waypoints from route_data if it's a FeatureCollection (from tour editor)
    const routeData = tour.route_data as any;
    if (routeData?.features && Array.isArray(routeData.features)) {
        waypoints = routeData.features.map((f: any, i: number) => ({
            lat: f.geometry?.coordinates?.[1] || 0,
            lng: f.geometry?.coordinates?.[0] || 0,
            type: f.properties?.type || 'waypoint',
            title: f.properties?.title || `Waypoint ${i + 1}`,
            description: f.properties?.description,
            images: f.properties?.images || [],
            order: f.properties?.index || i,
        }));
    }

    // If no inline waypoints, try the waypoints table
    if (waypoints.length === 0) {
        try {
            const { data: waypointData } = await supabase
                .from('tour_waypoints')
                .select('*')
                .eq('tour_id', tour.id)
                .order('order_index');

            if (waypointData && waypointData.length > 0) {
                waypoints = waypointData.map((wp: any) => ({
                    lat: wp.lat || 0,
                    lng: wp.lng || 0,
                    type: wp.type || 'waypoint',
                    title: wp.title || 'Waypoint',
                    description: wp.description,
                    images: wp.images || (wp.photo_url ? [wp.photo_url] : []),
                    order: wp.order_index || 0,
                }));
            }
        } catch {
            // Table might not exist
        }
    }

    return NextResponse.json({
        route_data: routeData?.route || routeData, // Support both formats
        distance_km: tour.distance_km || 0,
        meeting_point_lat: tour.meeting_point_lat,
        meeting_point_lng: tour.meeting_point_lng,
        waypoints,
    });
}

