import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    return NextResponse.json({
        notifications: notifications || [],
        unreadCount: unreadCount || 0
    });
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { user_id, type, title, message, link } = body;

        // Only allow creating notifications for own user (or admin)
        const { data: currentUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (user_id !== user.id && currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user_id || user.id,
                type,
                title,
                message,
                link,
                is_read: false,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
