import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/clubs - List all clubs for admin
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
        .from('clubs')
        .select(`
            *,
            owner:users!clubs_owner_id_fkey(id, first_name, last_name, email, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('status', status);
    }

    if (search) {
        const term = `%${search}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
    }

    const { data: clubs, error, count } = await query;

    if (error) {
        console.error('Error fetching clubs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        clubs,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    });
}

// PATCH /api/admin/clubs - Approve/reject/suspend club
export async function PATCH(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();

    const body = await request.json();
    const { club_id, action, reason } = body;

    if (!club_id || !action) {
        return NextResponse.json({ error: 'club_id and action are required' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'suspend', 'activate'];
    if (!validActions.includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    switch (action) {
        case 'approve':
            updates.status = 'active';
            updates.approved_at = new Date().toISOString();
            updates.approved_by = auth.userId;
            updates.rejection_reason = null;
            break;
        case 'reject':
            updates.status = 'rejected';
            updates.rejection_reason = reason || 'Rejected by admin';
            break;
        case 'suspend':
            updates.status = 'suspended';
            updates.rejection_reason = reason || 'Suspended by admin';
            break;
        case 'activate':
            updates.status = 'active';
            updates.rejection_reason = null;
            break;
    }

    const { data: club, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', club_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating club:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ club, message: `Club ${action}d successfully` });
}
