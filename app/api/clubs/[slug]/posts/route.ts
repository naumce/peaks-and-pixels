import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs/[slug]/posts - Get club feed
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient();
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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

    // Get posts
    const { data: posts, error, count } = await supabase
        .from('club_posts')
        .select(`
            *,
            author:users(id, first_name, last_name, avatar_url)
        `, { count: 'exact' })
        .eq('club_id', club.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        posts,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    });
}

// POST /api/clubs/[slug]/posts - Create a post
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

    // Check if user is a member
    const { data: member } = await supabase
        .from('club_members')
        .select('role, status')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

    if (!member || member.status !== 'active') {
        return NextResponse.json({ error: 'You must be a member to post' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { content, images, is_public } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
        }

        const { data: post, error: postError } = await supabase
            .from('club_posts')
            .insert({
                club_id: club.id,
                author_id: user.id,
                content: content.trim(),
                images: images || [],
                is_public: is_public ?? false
            })
            .select(`
                *,
                author:users(id, first_name, last_name, avatar_url)
            `)
            .single();

        if (postError) {
            console.error('Error creating post:', postError);
            return NextResponse.json({ error: postError.message }, { status: 500 });
        }

        // Increment post count
        const { data: currentClub } = await supabase
            .from('clubs')
            .select('post_count')
            .eq('id', club.id)
            .single();

        if (currentClub) {
            await supabase
                .from('clubs')
                .update({ post_count: (currentClub.post_count || 0) + 1 })
                .eq('id', club.id);
        }

        return NextResponse.json({ post }, { status: 201 });

    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
