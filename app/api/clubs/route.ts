import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/clubs - List clubs with filters
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get('search') || '';
    const activityType = searchParams.get('activity_type');
    const status = searchParams.get('status') || 'active';
    const memberOnly = searchParams.get('member') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // If member filter, need to get user's clubs
    if (memberOnly) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ clubs: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } });
        }

        // Get clubs user is a member of
        const { data: memberships } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (!memberships || memberships.length === 0) {
            return NextResponse.json({ clubs: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } });
        }

        const clubIds = memberships.map(m => m.club_id);

        const { data: clubs, error } = await supabase
            .from('clubs')
            .select(`
                *,
                owner:users!clubs_owner_id_fkey(id, first_name, last_name, avatar_url)
            `)
            .in('id', clubIds)
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            clubs,
            pagination: { page, limit, total: clubIds.length, totalPages: Math.ceil(clubIds.length / limit) }
        });
    }

    let query = supabase
        .from('clubs')
        .select(`
            *,
            owner:users!clubs_owner_id_fkey(id, first_name, last_name, avatar_url)
        `, { count: 'exact' })
        .eq('status', status)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (activityType) {
        query = query.contains('activity_types', [activityType]);
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

// POST /api/clubs - Create a new club
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description, tagline, activity_types, location, cover_image, logo, is_public, require_approval } = body;

        if (!name) {
            return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
        }

        // Generate slug
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check for existing slug and make unique
        const { data: existing } = await supabase
            .from('clubs')
            .select('slug')
            .ilike('slug', `${baseSlug}%`);

        let slug = baseSlug;
        if (existing && existing.length > 0) {
            slug = `${baseSlug}-${existing.length + 1}`;
        }

        // Create the club
        const { data: club, error: clubError } = await supabase
            .from('clubs')
            .insert({
                slug,
                name,
                description,
                tagline,
                activity_types: activity_types || [],
                location,
                cover_image,
                logo,
                owner_id: user.id,
                status: 'pending', // Requires admin approval
                is_public: is_public ?? true,
                require_approval: require_approval ?? false,
                member_count: 1
            })
            .select()
            .single();

        if (clubError) {
            console.error('Error creating club:', clubError);
            return NextResponse.json({ error: clubError.message }, { status: 500 });
        }

        // Add owner as first member
        const { error: memberError } = await supabase
            .from('club_members')
            .insert({
                club_id: club.id,
                user_id: user.id,
                role: 'owner',
                status: 'active'
            });

        if (memberError) {
            console.error('Error adding owner as member:', memberError);
            // Club was created, so still return success
        }

        return NextResponse.json({
            club,
            message: 'Club created successfully! Awaiting admin approval.'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating club:', error);
        return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
    }
}
