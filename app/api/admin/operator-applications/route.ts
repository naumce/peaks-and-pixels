import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/operator-applications - List all applications
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
        .from('operator_applications')
        .select(`
            *,
            user:users!operator_applications_user_id_fkey(id, first_name, last_name, email, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('status', status);
    }

    if (search) {
        query = query.or(`business_name.ilike.%${search}%`);
    }

    const { data: applications, error, count } = await query;

    if (error) {
        console.error('Error fetching operator applications:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        applications,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    });
}

// PATCH /api/admin/operator-applications - Approve/reject application
export async function PATCH(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = createAdminClient();
    const body = await request.json();
    const { application_id, action, reason } = body;

    if (!application_id || !action) {
        return NextResponse.json(
            { error: 'application_id and action are required' },
            { status: 400 }
        );
    }

    if (!['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get application
    const { data: application, error: fetchErr } = await supabase
        .from('operator_applications')
        .select('*')
        .eq('id', application_id)
        .eq('status', 'pending')
        .single();

    if (fetchErr || !application) {
        return NextResponse.json(
            { error: 'Application not found or already processed' },
            { status: 404 }
        );
    }

    const updates: Record<string, unknown> = {
        reviewed_by: auth.userId,
        reviewed_at: new Date().toISOString(),
    };

    if (action === 'approve') {
        updates.status = 'approved';
        updates.rejection_reason = null;

        // Promote user: customer -> guide and populate guide fields
        const { error: userErr } = await supabase
            .from('users')
            .update({
                role: 'guide',
                certifications: application.certifications,
                languages: application.languages,
                bio: application.experience_description,
            })
            .eq('id', application.user_id);

        if (userErr) {
            console.error('Error promoting user:', userErr);
            return NextResponse.json(
                { error: 'Failed to update user role: ' + userErr.message },
                { status: 500 }
            );
        }
    } else {
        updates.status = 'rejected';
        updates.rejection_reason = reason || 'Rejected by admin';
    }

    // Update application status
    const { data: updated, error: updateErr } = await supabase
        .from('operator_applications')
        .update(updates)
        .eq('id', application_id)
        .select()
        .single();

    if (updateErr) {
        console.error('Error updating application:', updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
        application: updated,
        message: `Application ${action}d successfully`
    });
}
