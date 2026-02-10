import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/operator-applications - Get current user's applications
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: applications, error } = await supabase
        .from('operator_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
}

// POST /api/operator-applications - Submit new application
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a customer
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'customer') {
        return NextResponse.json(
            { error: 'Only customers can apply to become tour operators' },
            { status: 403 }
        );
    }

    // Check for existing pending application
    const { data: existing } = await supabase
        .from('operator_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

    if (existing) {
        return NextResponse.json(
            { error: 'You already have a pending application' },
            { status: 409 }
        );
    }

    try {
        const body = await request.json();
        const { business_name, experience_description, offerings_description,
                certifications, languages } = body;

        if (!business_name || !experience_description || !offerings_description) {
            return NextResponse.json(
                { error: 'Business name, experience, and offerings description are required' },
                { status: 400 }
            );
        }

        const { data: application, error } = await supabase
            .from('operator_applications')
            .insert({
                user_id: user.id,
                business_name,
                experience_description,
                offerings_description,
                certifications: certifications || [],
                languages: languages || [],
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            application,
            message: 'Application submitted successfully. We will review it shortly.'
        }, { status: 201 });

    } catch {
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}
