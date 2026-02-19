import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        // Get clubs user is a member of
        const { data: memberships } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (!memberships || memberships.length === 0) {
            return NextResponse.json({
                posts: [],
                hasMore: false,
                message: 'Join clubs to see posts in your feed'
            });
        }

        const clubIds = memberships.map(m => m.club_id);

        // Fetch posts from clubs user is member of (or public posts)
        const { data: posts, error } = await supabase
            .from('club_posts')
            .select(`
                *,
                author:users!club_posts_author_id_fkey(
                    id, first_name, last_name, avatar_url
                ),
                club:clubs!club_posts_club_id_fkey(
                    id, name, slug, logo
                )
            `)
            .or(`club_id.in.(${clubIds.join(',')}),is_public.eq.true`)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Feed fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
        }

        // Check if there are more posts
        const { count } = await supabase
            .from('club_posts')
            .select('*', { count: 'exact', head: true })
            .or(`club_id.in.(${clubIds.join(',')}),is_public.eq.true`);

        return NextResponse.json({
            posts: posts || [],
            hasMore: (offset + limit) < (count || 0),
            total: count,
        });
    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
