import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import type { DbBooking } from '@/types/database';

export async function RecentBookings() {
    const supabase = await createClient();

    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5) as { data: DbBooking[] | null };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-400/10 text-green-400 border-green-400/20';
            case 'pending_payment':
                return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'cancelled':
                return 'bg-red-400/10 text-red-400 border-red-400/20';
            case 'completed':
                return 'bg-primary/10 text-primary border-primary/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Recent Bookings</h3>
                        <p className="text-xs text-muted-foreground">Latest customer reservations</p>
                    </div>
                </div>
                <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-apple">
                    View all
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-2">
                {!bookings || bookings.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-medium">No bookings yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Bookings will appear here once customers book tours
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group flex items-center justify-between rounded-xl p-4 hover:bg-secondary/50 transition-apple cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-foreground">
                                        {booking.lead_participant_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {booking.lead_participant_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {booking.reference} • {booking.participant_count} guest{booking.participant_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <Badge className={`${getStatusColor(booking.booking_status)} border`}>
                                            {booking.booking_status.replace('_', ' ')}
                                        </Badge>
                                        <p className="text-sm font-semibold text-foreground mt-1">
                                            €{Number(booking.total_amount).toFixed(0)}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-apple" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
