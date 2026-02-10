import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Generate unique booking reference using crypto
function generateReference(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    let result = 'PP-';
    for (let i = 0; i < 6; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const body = await request.json();

    const {
        tour_instance_id,
        participant_count,
        lead_participant_name,
        lead_participant_email,
        lead_participant_phone,
        special_requests,
        dietary_restrictions,
    } = body;

    // Validate required fields
    if (!tour_instance_id || !participant_count || !lead_participant_name || !lead_participant_email || !lead_participant_phone) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (participant_count < 1 || participant_count > 50) {
        return NextResponse.json({ error: 'Invalid participant count' }, { status: 400 });
    }

    // Get tour instance with tour info
    const { data: instance, error: instanceError } = await supabase
        .from('tour_instances')
        .select(`
            id,
            capacity_max,
            capacity_booked,
            price_override,
            status,
            tour:tours (
                id,
                name,
                base_price
            )
        `)
        .eq('id', tour_instance_id)
        .single();

    if (instanceError || !instance) {
        return NextResponse.json({ error: 'Tour instance not found' }, { status: 404 });
    }

    if (instance.status !== 'scheduled') {
        return NextResponse.json({ error: 'This tour instance is not available for booking' }, { status: 400 });
    }

    // Check availability
    const availableSpots = instance.capacity_max - instance.capacity_booked;
    if (availableSpots < participant_count) {
        return NextResponse.json({
            error: `Only ${availableSpots} spots available`
        }, { status: 400 });
    }

    // Calculate total
    const tour = instance.tour as { id: string; name: string; base_price: number } | null;
    const pricePerPerson = instance.price_override || tour?.base_price || 0;
    const totalAmount = pricePerPerson * participant_count;

    // Get or create customer
    const { data: { user } } = await supabase.auth.getUser();
    let customerId = user?.id;

    // If not logged in, try to find existing customer or create new one
    if (!customerId) {
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', lead_participant_email)
            .single();

        if (existingUser) {
            customerId = existingUser.id;
        } else {
            // Create auth user (they can claim account later)
            const { data: newAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: lead_participant_email,
                email_confirm: false,
                user_metadata: {
                    first_name: lead_participant_name.split(' ')[0],
                    last_name: lead_participant_name.split(' ').slice(1).join(' '),
                }
            });

            if (authError) {
                console.error('Error creating user:', authError);
                return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
            }

            customerId = newAuth.user.id;

            // Create profile
            const { error: profileError } = await supabaseAdmin.from('users').insert({
                id: customerId,
                email: lead_participant_email,
                first_name: lead_participant_name.split(' ')[0] || 'Guest',
                last_name: lead_participant_name.split(' ').slice(1).join(' ') || '',
                phone: lead_participant_phone,
                role: 'customer',
            });

            if (profileError) {
                console.error('Error creating user profile:', profileError);
                return NextResponse.json({ error: 'Failed to create customer profile' }, { status: 500 });
            }
        }
    }

    // Generate unique reference
    let reference = generateReference();
    let attempts = 0;
    while (attempts < 5) {
        const { data: existing } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('reference', reference)
            .single();

        if (!existing) break;
        reference = generateReference();
        attempts++;
    }

    // Atomic capacity check + update using optimistic concurrency
    // Re-read capacity right before update to minimize race window
    const { data: freshInstance, error: freshError } = await supabaseAdmin
        .from('tour_instances')
        .select('capacity_booked, capacity_max')
        .eq('id', tour_instance_id)
        .single();

    if (freshError || !freshInstance) {
        return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 });
    }

    const freshAvailable = freshInstance.capacity_max - freshInstance.capacity_booked;
    if (freshAvailable < participant_count) {
        return NextResponse.json({
            error: `Only ${freshAvailable} spots available`
        }, { status: 409 });
    }

    // Update capacity with a conditional update (only if capacity hasn't changed)
    const { data: updatedInstance, error: capacityError } = await supabaseAdmin
        .from('tour_instances')
        .update({ capacity_booked: freshInstance.capacity_booked + participant_count })
        .eq('id', tour_instance_id)
        .eq('capacity_booked', freshInstance.capacity_booked) // Optimistic lock
        .select('id')
        .single();

    if (capacityError || !updatedInstance) {
        return NextResponse.json({
            error: 'Could not reserve spots. Another booking may have just been made. Please try again.'
        }, { status: 409 });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
            reference,
            tour_instance_id,
            customer_id: customerId,
            lead_participant_name,
            lead_participant_email,
            lead_participant_phone,
            participant_count,
            base_price: pricePerPerson,
            total_amount: totalAmount,
            special_requests: special_requests || null,
            dietary_restrictions: dietary_restrictions || null,
            booking_status: 'pending_payment',
            payment_status: 'pending',
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
        })
        .select()
        .single();

    if (bookingError) {
        console.error('Error creating booking:', bookingError);
        // Roll back capacity since booking failed
        await supabaseAdmin
            .from('tour_instances')
            .update({ capacity_booked: freshInstance.capacity_booked })
            .eq('id', tour_instance_id);

        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({
        booking: {
            id: booking.id,
            reference: booking.reference,
            total_amount: booking.total_amount,
        },
        message: 'Booking created successfully',
    }, { status: 201 });
}
