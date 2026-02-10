/**
 * Operator authorization helper
 * Use in all /api/operator/* routes to verify the caller is a guide or admin
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type OperatorAuthResult =
    | { authorized: true; userId: string; role: 'guide' | 'admin' }
    | { authorized: false; response: NextResponse };

export async function requireOperator(): Promise<OperatorAuthResult> {
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

    if (!profile || !['guide', 'admin'].includes(profile.role)) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Operator access required' },
                { status: 403 }
            ),
        };
    }

    return { authorized: true, userId: user.id, role: profile.role as 'guide' | 'admin' };
}
