import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    location: string;
    avatar: string | null;
    rating: number;
    text: string;
}

export async function Testimonials() {
    const supabase = await createClient();

    // Fetch featured reviews from the database
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            title,
            content,
            customer:users!reviews_customer_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

    // Map database reviews to testimonial format
    const testimonials: Testimonial[] = (reviews || []).map((review) => {
        const customer = review.customer as { first_name: string; last_name: string; avatar_url: string | null } | null;
        return {
            id: review.id,
            name: customer ? `${customer.first_name} ${customer.last_name}` : 'Guest',
            location: '',
            avatar: customer?.avatar_url || null,
            rating: review.rating,
            text: review.content,
        };
    });

    // Don't render the section if there are no reviews
    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-20 lg:py-32 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        What Adventurers Say
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Don&apos;t just take our word for it. Here&apos;s what our guests have to say.
                    </p>
                </div>

                {/* Testimonials grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="p-6 rounded-2xl bg-card border border-border/50"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-foreground mb-6">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={testimonial.avatar || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                                    {testimonial.location && (
                                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
