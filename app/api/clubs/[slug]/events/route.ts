import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs/[slug]/events - List club events
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient();
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status') || 'upcoming';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get club
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    let query = supabase
        .from('club_events')
        .select(`
            *,
            created_by_user:users!club_events_created_by_fkey(id, first_name, last_name, avatar_url),
            route:tours(id, slug, name)
        `, { count: 'exact' })
        .eq('club_id', club.id);

    if (status === 'upcoming') {
        query = query
            .in('status', ['upcoming', 'ongoing'])
            .gte('start_datetime', new Date().toISOString())
            .order('start_datetime', { ascending: true });
    } else if (status === 'past') {
        query = query
            .eq('status', 'completed')
            .order('start_datetime', { ascending: false });
    } else {
        query = query.eq('status', status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        events,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    });
}

// POST /api/clubs/[slug]/events - Create an event
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient();
    const { slug } = await params;

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get club
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is admin/owner
    const { data: member } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
        return NextResponse.json({ error: 'Only club admins can create events' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title,
            description,
            cover_image,
            start_datetime,
            end_datetime,
            location,
            location_lat,
            location_lng,
            meeting_point,
            route_id,
            max_participants,
            is_paid,
            price,
            is_public
        } = body;

        if (!title || !start_datetime) {
            return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
        }

        const { data: event, error: eventError } = await supabase
            .from('club_events')
            .insert({
                club_id: club.id,
                created_by: user.id,
                title,
                description,
                cover_image,
                start_datetime,
                end_datetime,
                location,
                location_lat,
                location_lng,
                meeting_point,
                route_id,
                max_participants,
                is_paid: is_paid ?? false,
                price: is_paid ? price : null,
                is_public: is_public ?? true,
                status: 'upcoming'
            })
            .select(`
                *,
                created_by_user:users!club_events_created_by_fkey(id, first_name, last_name, avatar_url)
            `)
            .single();

        if (eventError) {
            console.error('Error creating event:', eventError);
            return NextResponse.json({ error: eventError.message }, { status: 500 });
        }

        // Increment event count
        const { data: currentClub } = await supabase
            .from('clubs')
            .select('event_count')
            .eq('id', club.id)
            .single();

        if (currentClub) {
            await supabase
                .from('clubs')
                .update({ event_count: (currentClub.event_count || 0) + 1 })
                .eq('id', club.id);
        }

        return NextResponse.json({ event }, { status: 201 });

    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
