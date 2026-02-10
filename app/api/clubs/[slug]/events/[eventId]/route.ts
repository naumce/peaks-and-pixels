import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs/[slug]/events/[eventId] - Get event details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
    const { slug, eventId } = await params;
    const supabase = await createClient();

    // Get user for registration check
    const { data: { user } } = await supabase.auth.getUser();

    // Get club first
    const { data: club } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Get event details
    const { data: event, error } = await supabase
        .from('club_events')
        .select(`
            *,
            organizer:users!club_events_organizer_id_fkey(
                id, first_name, last_name, avatar_url
            )
        `)
        .eq('id', eventId)
        .eq('club_id', club.id)
        .single();

    if (error || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is registered
    let isRegistered = false;
    if (user) {
        const { data: registration } = await supabase
            .from('club_event_registrations')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

        isRegistered = !!registration;
    }

    return NextResponse.json({ event, isRegistered });
}

// PATCH /api/clubs/[slug]/events/[eventId] - Update event
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
    const { slug, eventId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get club and verify ownership/admin
    const { data: club } = await supabase
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', slug)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    const canManage = club.owner_id === user.id ||
        membership?.role === 'admin' ||
        membership?.role === 'owner';

    if (!canManage) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title, description, event_date, start_time, end_time,
            location, max_participants, is_paid, price, cover_image
        } = body;

        const { data: event, error } = await supabase
            .from('club_events')
            .update({
                title,
                description,
                event_date,
                start_time,
                end_time,
                location,
                max_participants,
                is_paid,
                price,
                cover_image,
            })
            .eq('id', eventId)
            .eq('club_id', club.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

// DELETE /api/clubs/[slug]/events/[eventId] - Delete event
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
    const { slug, eventId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get club and verify ownership/admin
    const { data: club } = await supabase
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', slug)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    const canManage = club.owner_id === user.id ||
        membership?.role === 'admin' ||
        membership?.role === 'owner';

    if (!canManage) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await supabase
        .from('club_events')
        .delete()
        .eq('id', eventId)
        .eq('club_id', club.id);

    if (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
