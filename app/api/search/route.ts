import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/search - Global search for tours and clubs
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    if (!query.trim()) {
        return NextResponse.json({ tours: [], clubs: [] });
    }

    const supabase = await createClient();
    const searchTerm = `%${query}%`;

    let tours: any[] = [];
    let clubs: any[] = [];

    // Search tours
    if (type === 'all' || type === 'tours') {
        const { data: tourResults } = await supabase
            .from('tours')
            .select(`
                id, name, slug, tagline, cover_image,
                location_area, difficulty, duration_minutes, base_price
            `)
            .eq('status', 'active')
            .or(`name.ilike.${searchTerm},tagline.ilike.${searchTerm},location_area.ilike.${searchTerm}`)
            .limit(12);

        tours = tourResults || [];
    }

    // Search clubs
    if (type === 'all' || type === 'clubs') {
        const { data: clubResults } = await supabase
            .from('clubs')
            .select(`
                id, name, slug, description, logo,
                activity_types, member_count
            `)
            .eq('status', 'active')
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(12);

        clubs = clubResults || [];
    }

    return NextResponse.json({ tours, clubs });
}
