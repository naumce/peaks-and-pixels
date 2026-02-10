/**
 * Admin authorization helper
 * Use in all /api/admin/* routes to verify the caller is an admin
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type AdminAuthResult =
    | { authorized: true; userId: string }
    | { authorized: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminAuthResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ),
        };
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return { authorized: true, userId: user.id };
}
