import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

// GET /api/operator/profile - Get my operator profile
export async function GET() {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, avatar_url, bio, specialties, languages, certifications, is_available')
        .eq('id', auth.userId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
}

// PATCH /api/operator/profile - Update my operator profile
export async function PATCH(request: NextRequest) {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const supabase = await createClient();
    const body = await request.json();

    const ALLOWED_FIELDS = [
        'first_name', 'last_name', 'phone', 'avatar_url',
        'bio', 'specialties', 'languages', 'certifications', 'is_available',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', auth.userId)
        .select('id, first_name, last_name, email, phone, avatar_url, bio, specialties, languages, certifications, is_available')
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
}
