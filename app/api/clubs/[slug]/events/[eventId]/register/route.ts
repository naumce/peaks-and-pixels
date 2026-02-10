import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/clubs/[slug]/events/[eventId]/register - Register for event
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
    const { slug, eventId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get club
    const { data: club } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Get event and check availability
    const { data: event } = await supabase
        .from('club_events')
        .select('id, max_participants, current_participants, event_date')
        .eq('id', eventId)
        .eq('club_id', club.id)
        .single();

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event is in the past
    if (new Date(event.event_date) < new Date()) {
        return NextResponse.json({ error: 'Event has already passed' }, { status: 400 });
    }

    // Check if event is full
    if (event.max_participants && event.current_participants >= event.max_participants) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
        .from('club_event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }

    // Register user
    const { error: regError } = await supabase
        .from('club_event_registrations')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed',
        });

    if (regError) {
        console.error('Registration error:', regError);
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    // Update participant count
    await supabase
        .from('club_events')
        .update({
            current_participants: (event.current_participants || 0) + 1
        })
        .eq('id', eventId);

    return NextResponse.json({
        success: true,
        message: 'Successfully registered for event'
    });
}

// DELETE /api/clubs/[slug]/events/[eventId]/register - Cancel registration
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

    // Get club
    const { data: club } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Get event
    const { data: event } = await supabase
        .from('club_events')
        .select('id, current_participants')
        .eq('id', eventId)
        .eq('club_id', club.id)
        .single();

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete registration
    const { error } = await supabase
        .from('club_event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
    }

    // Update participant count
    if (event.current_participants > 0) {
        await supabase
            .from('club_events')
            .update({
                current_participants: event.current_participants - 1
            })
            .eq('id', eventId);
    }

    return NextResponse.json({
        success: true,
        message: 'Registration cancelled'
    });
}
