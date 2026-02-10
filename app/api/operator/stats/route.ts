import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOperator } from '@/lib/auth/operator';

// GET /api/operator/stats - Dashboard stats for operator
export async function GET() {
    const auth = await requireOperator();
    if (!auth.authorized) return auth.response;

    const supabase = await createClient();

    // Get my tours
    const { data: myTours } = await supabase
        .from('tours')
        .select('id, status')
        .eq('operator_id', auth.userId);

    const totalTours = myTours?.length || 0;
    const activeTours = myTours?.filter(t => t.status === 'active').length || 0;
    const draftTours = myTours?.filter(t => t.status === 'draft').length || 0;

    if (!myTours || myTours.length === 0) {
        return NextResponse.json({
            tours: { total: 0, active: 0, draft: 0 },
            upcomingInstances: 0,
            bookings: { thisMonth: 0, pending: 0, confirmed: 0 },
            revenue: { thisMonth: 0, total: 0 },
        });
    }

    const myTourIds = myTours.map(t => t.id);

    // Get upcoming instances
    const now = new Date().toISOString();
    const { count: upcomingInstances } = await supabase
        .from('tour_instances')
        .select('id', { count: 'exact', head: true })
        .in('tour_id', myTourIds)
        .gte('start_datetime', now)
        .eq('status', 'scheduled');

    // Get my instance IDs for booking queries
    const { data: myInstances } = await supabase
        .from('tour_instances')
        .select('id')
        .in('tour_id', myTourIds);

    const myInstanceIds = myInstances?.map(i => i.id) || [];

    let bookingsThisMonth = 0;
    let pendingBookings = 0;
    let confirmedBookings = 0;
    let revenueThisMonth = 0;
    let revenueTotal = 0;

    if (myInstanceIds.length > 0) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // This month's bookings
        const { count: monthCount } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .in('tour_instance_id', myInstanceIds)
            .gte('created_at', startOfMonth.toISOString());

        bookingsThisMonth = monthCount || 0;

        // Pending bookings
        const { count: pendCount } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .in('tour_instance_id', myInstanceIds)
            .eq('booking_status', 'pending_payment');

        pendingBookings = pendCount || 0;

        // Confirmed bookings
        const { count: confCount } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .in('tour_instance_id', myInstanceIds)
            .eq('booking_status', 'confirmed');

        confirmedBookings = confCount || 0;

        // Revenue this month
        const { data: monthRevenue } = await supabase
            .from('bookings')
            .select('total_amount')
            .in('tour_instance_id', myInstanceIds)
            .in('payment_status', ['paid', 'completed'])
            .gte('created_at', startOfMonth.toISOString());

        revenueThisMonth = monthRevenue?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

        // Total revenue
        const { data: totalRev } = await supabase
            .from('bookings')
            .select('total_amount')
            .in('tour_instance_id', myInstanceIds)
            .in('payment_status', ['paid', 'completed']);

        revenueTotal = totalRev?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
    }

    return NextResponse.json({
        tours: { total: totalTours, active: activeTours, draft: draftTours },
        upcomingInstances: upcomingInstances || 0,
        bookings: {
            thisMonth: bookingsThisMonth,
            pending: pendingBookings,
            confirmed: confirmedBookings,
        },
        revenue: {
            thisMonth: revenueThisMonth,
            total: revenueTotal,
        },
    });
}
