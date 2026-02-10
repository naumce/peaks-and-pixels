import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Mountain, ArrowRight, MapPin, Users } from 'lucide-react';
import type { DbTourInstance, DbTour } from '@/types/database';

interface TourInstanceWithTour extends DbTourInstance {
    tours: Pick<DbTour, 'name' | 'difficulty' | 'location_area'>;
}

export async function UpcomingTours() {
    const supabase = await createClient();

    const { data: instances } = await supabase
        .from('tour_instances')
        .select(`
            *,
            tours:tour_id (name, difficulty, location_area)
        `)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(5) as { data: TourInstanceWithTour[] | null };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-400/10 text-green-400 border-green-400/20';
            case 'moderate':
                return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'hard':
                return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
            case 'expert':
                return 'bg-red-400/10 text-red-400 border-red-400/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                        <Mountain className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Upcoming Tours</h3>
                        <p className="text-xs text-muted-foreground">Scheduled tour instances</p>
                    </div>
                </div>
                <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-apple">
                    View all
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-2">
                {!instances || instances.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Mountain className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-medium">No upcoming tours</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Schedule tour instances to see them here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {instances.map((instance) => {
                            const { day, date, month, time } = formatDate(instance.start_datetime);
                            const slotsLeft = instance.capacity_max - instance.capacity_booked;
                            const isFull = slotsLeft <= 0;

                            return (
                                <div
                                    key={instance.id}
                                    className="group flex items-center gap-4 rounded-xl p-4 hover:bg-secondary/50 transition-apple cursor-pointer"
                                >
                                    {/* Date block */}
                                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-secondary text-center">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">{day}</span>
                                        <span className="text-lg font-bold text-foreground">{date}</span>
                                        <span className="text-xs text-muted-foreground">{month}</span>
                                    </div>

                                    {/* Tour info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {instance.tours?.name || 'Unknown Tour'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {instance.tours?.location_area || 'TBD'}
                                            </span>
                                            <span>•</span>
                                            <span>{time}</span>
                                        </div>
                                    </div>

                                    {/* Right side */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <Badge className={`${getDifficultyColor(instance.tours?.difficulty || '')} border`}>
                                                {instance.tours?.difficulty || 'N/A'}
                                            </Badge>
                                            <div className="flex items-center justify-end gap-1 mt-1 text-sm">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className={isFull ? 'text-red-400' : 'text-muted-foreground'}>
                                                    {instance.capacity_booked}/{instance.capacity_max}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-apple" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
