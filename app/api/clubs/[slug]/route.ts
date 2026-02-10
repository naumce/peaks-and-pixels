import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs/[slug] - Get club details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: club, error } = await supabase
        .from('clubs')
        .select(`
            *,
            owner:users!clubs_owner_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .eq('slug', slug)
        .single();

    if (error || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is a member
    const { data: { user } } = await supabase.auth.getUser();
    let membership = null;

    if (user) {
        const { data: memberData } = await supabase
            .from('club_members')
            .select('role, status')
            .eq('club_id', club.id)
            .eq('user_id', user.id)
            .single();

        membership = memberData;
    }

    // Get upcoming events count
    const { count: upcomingEvents } = await supabase
        .from('club_events')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', club.id)
        .eq('status', 'upcoming')
        .gte('start_datetime', new Date().toISOString());

    return NextResponse.json({
        club,
        membership,
        stats: {
            upcomingEvents: upcomingEvents || 0
        }
    });
}

// PATCH /api/clubs/[slug] - Update club
export async function PATCH(
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

    // Get club and verify ownership
    const { data: club, error: fetchError } = await supabase
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', slug)
        .single();

    if (fetchError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const { data: member } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
        return NextResponse.json({ error: 'Not authorized to update this club' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const allowedFields = ['name', 'description', 'tagline', 'activity_types', 'location', 'cover_image', 'logo', 'is_public', 'require_approval'];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        const { data: updatedClub, error: updateError } = await supabase
            .from('clubs')
            .update(updates)
            .eq('id', club.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating club:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ club: updatedClub });

    } catch (error) {
        console.error('Error updating club:', error);
        return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
    }
}
