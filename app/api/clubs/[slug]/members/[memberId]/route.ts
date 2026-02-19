import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/clubs/[slug]/members/[memberId] - Manage a club member
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; memberId: string }> }
) {
    const { slug, memberId } = await params;
    const supabase = await createClient();

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

    // Verify the requesting user is an owner or admin of the club
    const { data: requesterMembership } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    const isOwner = club.owner_id === user.id;
    const isAdmin = requesterMembership?.role === 'admin' || requesterMembership?.role === 'owner';

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Not authorized to manage members' }, { status: 403 });
    }

    // Parse the action from the request body
    let body: { action: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { action } = body;
    if (!['approve', 'reject', 'promote', 'demote', 'remove'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the target member
    const { data: targetMember, error: memberError } = await supabase
        .from('club_members')
        .select('id, user_id, role, status')
        .eq('id', memberId)
        .eq('club_id', club.id)
        .single();

    if (memberError || !targetMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent actions on the club owner
    if (targetMember.role === 'owner') {
        return NextResponse.json({ error: 'Cannot modify the club owner' }, { status: 403 });
    }

    // Prevent non-owners from modifying admins
    if (targetMember.role === 'admin' && !isOwner) {
        return NextResponse.json({ error: 'Only the club owner can modify admins' }, { status: 403 });
    }

    try {
        switch (action) {
            case 'approve': {
                if (targetMember.status !== 'pending') {
                    return NextResponse.json({ error: 'Member is not pending approval' }, { status: 400 });
                }

                const { error } = await supabase
                    .from('club_members')
                    .update({ status: 'active' })
                    .eq('id', memberId);

                if (error) throw error;

                // Increment member count since member is now active
                await supabase.rpc('increment_club_member_count', { club_id: club.id });

                return NextResponse.json({ message: 'Member approved successfully' });
            }

            case 'reject': {
                const wasPending = targetMember.status === 'pending';

                const { error } = await supabase
                    .from('club_members')
                    .delete()
                    .eq('id', memberId);

                if (error) throw error;

                // Only decrement if member was active (pending members aren't counted)
                if (!wasPending) {
                    await supabase.rpc('decrement_club_member_count', { club_id: club.id });
                }

                return NextResponse.json({ message: 'Member rejected and removed' });
            }

            case 'remove': {
                const wasActive = targetMember.status === 'active';

                const { error } = await supabase
                    .from('club_members')
                    .delete()
                    .eq('id', memberId);

                if (error) throw error;

                // Decrement count if member was active
                if (wasActive) {
                    await supabase.rpc('decrement_club_member_count', { club_id: club.id });
                }

                return NextResponse.json({ message: 'Member removed successfully' });
            }

            case 'promote': {
                if (targetMember.status !== 'active') {
                    return NextResponse.json({ error: 'Can only promote active members' }, { status: 400 });
                }

                // Promote member -> admin (only owners can promote to admin)
                const newRole = targetMember.role === 'member' ? 'admin' : targetMember.role;

                if (newRole === targetMember.role) {
                    return NextResponse.json({ error: 'Member is already at the highest promotable role' }, { status: 400 });
                }

                const { error } = await supabase
                    .from('club_members')
                    .update({ role: newRole })
                    .eq('id', memberId);

                if (error) throw error;

                return NextResponse.json({ message: `Member promoted to ${newRole}` });
            }

            case 'demote': {
                if (targetMember.role === 'member') {
                    return NextResponse.json({ error: 'Member is already at the lowest role' }, { status: 400 });
                }

                const { error } = await supabase
                    .from('club_members')
                    .update({ role: 'member' })
                    .eq('id', memberId);

                if (error) throw error;

                return NextResponse.json({ message: 'Member demoted to member' });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error managing member:', error);
        return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
    }
}
