import { Suspense } from 'react';
import { TourFilters } from '@/components/public/tour-filters';
import { TourGrid } from '@/components/public/tour-grid';
import { TourCardSkeleton } from '@/components/ui/skeleton';

interface ToursPageProps {
    searchParams: Promise<{
        difficulty?: string;
        duration?: string;
        search?: string;
        page?: string;
    }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
    const params = await searchParams;

    return (
        <>
            {/* Hero / Header */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
                <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-10 right-[20%] w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 fade-in">
                        Explore Our Tours
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto fade-in stagger-1">
                        From easy day hikes to challenging multi-day expeditions.
                        Find your perfect Balkan adventure.
                    </p>
                </div>
            </section>

            {/* Filters + Grid */}
            <section className="pb-20 lg:pb-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <TourFilters
                        currentDifficulty={params.difficulty}
                        currentDuration={params.duration}
                        currentSearch={params.search}
                    />

                    <Suspense fallback={<TourGridSkeleton />}>
                        <TourGrid
                            difficulty={params.difficulty}
                            duration={params.duration}
                            search={params.search}
                            page={params.page ? parseInt(params.page) : 1}
                        />
                    </Suspense>
                </div>
            </section>
        </>
    );
}

function TourGridSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`slide-up stagger-${Math.min(i + 1, 6)}`}>
                    <TourCardSkeleton />
                </div>
            ))}
        </div>
    );
}

