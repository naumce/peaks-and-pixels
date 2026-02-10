'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourFiltersProps {
    currentDifficulty?: string;
    currentDuration?: string;
    currentSearch?: string;
}

const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
];

const durations = [
    { value: '', label: 'Any Duration' },
    { value: '1', label: '1 Day' },
    { value: '2-3', label: '2-3 Days' },
    { value: '4+', label: '4+ Days' },
];

export function TourFilters({ currentDifficulty, currentDuration, currentSearch }: TourFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 on filter change
        router.push(`/tours?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/tours');
    };

    const hasActiveFilters = currentDifficulty || currentDuration || currentSearch;

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search tours..."
                    defaultValue={currentSearch}
                    onChange={(e) => {
                        // Debounce in production
                        updateFilter('search', e.target.value);
                    }}
                    className="pl-11 h-12 bg-secondary/50 border-border/50 rounded-xl"
                />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Difficulty filters */}
                <div className="flex flex-wrap gap-2">
                    {difficulties.map((diff) => (
                        <button
                            key={diff.value}
                            onClick={() => updateFilter('difficulty', diff.value)}
                            className={cn(
                                'px-4 py-2.5 rounded-full text-sm font-medium transition-apple min-h-[44px] inline-flex items-center',
                                (currentDifficulty || '') === diff.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {diff.label}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-border/50 hidden sm:block" />

                {/* Duration filters */}
                <div className="flex flex-wrap gap-2">
                    {durations.map((dur) => (
                        <button
                            key={dur.value}
                            onClick={() => updateFilter('duration', dur.value)}
                            className={cn(
                                'px-4 py-2.5 rounded-full text-sm font-medium transition-apple min-h-[44px] inline-flex items-center',
                                (currentDuration || '') === dur.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {dur.label}
                        </button>
                    ))}
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
