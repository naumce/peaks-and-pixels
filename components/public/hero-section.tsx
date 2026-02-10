import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />

                {/* Floating orbs */}
                <div className="absolute top-20 left-[10%] w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 fade-in">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-primary">Now booking 2026 adventures</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
                        Adventure Awaits in the{' '}
                        <span className="gradient-text">Balkans</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 fade-in" style={{ animationDelay: '0.2s' }}>
                        Premium hiking and photography tours through stunning mountain landscapes.
                        Small groups, expert guides, unforgettable memories.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in" style={{ animationDelay: '0.3s' }}>
                        <Button
                            size="lg"
                            className="h-14 px-8 gradient-primary text-white rounded-xl text-base font-medium glow-hover"
                            asChild
                        >
                            <Link href="/tours">
                                Explore Tours
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 rounded-xl text-base font-medium border-border/50 hover:bg-secondary"
                            asChild
                        >
                            <Link href="/about">
                                <Play className="mr-2 h-5 w-5" />
                                Watch Video
                            </Link>
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-16 pt-8 border-t border-border/30 fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 text-center">
                            <div>
                                <p className="text-3xl font-bold text-foreground">500+</p>
                                <p className="text-sm text-muted-foreground">Happy Adventurers</p>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-border/50" />
                            <div>
                                <p className="text-3xl font-bold text-foreground">50+</p>
                                <p className="text-sm text-muted-foreground">Unique Tours</p>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-border/50" />
                            <div>
                                <p className="text-3xl font-bold text-foreground">4.9★</p>
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-xs font-medium">Scroll to explore</span>
                <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
                    <div className="h-2 w-1 rounded-full bg-muted-foreground animate-bounce" />
                </div>
            </div>
        </section>
    );
}
