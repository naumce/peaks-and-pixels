import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs/[slug]/members - List club members
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient();
    const { slug } = await params;

    // Get club
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('slug', slug)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Get members
    const { data: members, error } = await supabase
        .from('club_members')
        .select(`
            *,
            user:users(id, first_name, last_name, avatar_url)
        `)
        .eq('club_id', club.id)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

    if (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members });
}

// POST /api/clubs/[slug]/members - Join club or request membership
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
        .select('id, require_approval, status')
        .eq('slug', slug)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (club.status !== 'active') {
        return NextResponse.json({ error: 'This club is not accepting members' }, { status: 400 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
        .from('club_members')
        .select('id, status')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    if (existingMember) {
        if (existingMember.status === 'pending') {
            return NextResponse.json({ error: 'Your membership request is pending approval' }, { status: 400 });
        }
        if (existingMember.status === 'banned') {
            return NextResponse.json({ error: 'You are not allowed to join this club' }, { status: 403 });
        }
        return NextResponse.json({ error: 'You are already a member of this club' }, { status: 400 });
    }

    // Add member
    const memberStatus = club.require_approval ? 'pending' : 'active';

    const { data: member, error: memberError } = await supabase
        .from('club_members')
        .insert({
            club_id: club.id,
            user_id: user.id,
            role: 'member',
            status: memberStatus
        })
        .select()
        .single();

    if (memberError) {
        console.error('Error joining club:', memberError);
        return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Update member count if immediately active
    if (memberStatus === 'active') {
        const { error: rpcError } = await supabase.rpc('increment_club_member_count', { club_id: club.id });
        if (rpcError) {
            console.error('Failed to increment member count:', rpcError);
        }
    }

    return NextResponse.json({
        member,
        message: memberStatus === 'pending'
            ? 'Your membership request has been submitted'
            : 'You have joined the club!'
    }, { status: 201 });
}

// DELETE /api/clubs/[slug]/members - Leave club
export async function DELETE(
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
        .select('id, owner_id')
        .eq('slug', slug)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Can't leave if you're the owner
    if (club.owner_id === user.id) {
        return NextResponse.json({ error: 'Club owners cannot leave. Transfer ownership first.' }, { status: 400 });
    }

    // Remove membership
    const { error: deleteError } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', club.id)
        .eq('user_id', user.id);

    if (deleteError) {
        console.error('Error leaving club:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Decrement member count
    const { error: rpcError } = await supabase.rpc('decrement_club_member_count', { club_id: club.id });
    if (rpcError) {
        console.error('Failed to decrement member count:', rpcError);
    }

    return NextResponse.json({ message: 'You have left the club' });
}
