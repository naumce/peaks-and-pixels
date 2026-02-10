import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Floating orbs */}
            <div className="absolute top-10 left-[20%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-[20%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                    Ready for Your Next Adventure?
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
                    Join hundreds of satisfied adventurers who have discovered the magic of the Balkans.
                    Book your tour today and create memories that last a lifetime.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        size="lg"
                        className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-xl text-base font-medium shadow-lg"
                        asChild
                    >
                        <Link href="/tours">
                            Browse All Tours
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 rounded-xl text-base font-medium border-white/30 text-white hover:bg-white/10"
                        asChild
                    >
                        <Link href="/contact">
                            Contact Us
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
