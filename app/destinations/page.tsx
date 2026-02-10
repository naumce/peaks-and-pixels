import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mountain, Camera, Trees, Waves, Sun } from 'lucide-react';

export const metadata = {
    title: 'Destinations | Peaks & Pixels',
    description: 'Explore stunning destinations across the Balkans for hiking and photography adventures.',
};

const destinations = [
    {
        id: 'slovenia',
        name: 'Slovenia',
        tagline: 'Where Alps Meet Mediterranean',
        description: 'Home to the Julian Alps, emerald rivers, and pristine lakes. Slovenia offers dramatic peaks and world-class hiking just hours from Ljubljana.',
        highlights: ['Julian Alps', 'Lake Bled', 'Triglav National Park', 'Soča Valley'],
        icon: Mountain,
        image: '/destinations/slovenia.jpg',
        tourCount: 15,
        featured: true,
    },
    {
        id: 'montenegro',
        name: 'Montenegro',
        tagline: 'Wild Beauty of the Black Mountain',
        description: 'From the dramatic fjords of Kotor to the untamed peaks of Durmitor, Montenegro packs incredible diversity into a compact country.',
        highlights: ['Durmitor National Park', 'Bay of Kotor', 'Prokletije', 'Lovćen'],
        icon: Waves,
        image: '/destinations/montenegro.jpg',
        tourCount: 12,
        featured: true,
    },
    {
        id: 'croatia',
        name: 'Croatia',
        tagline: 'Beyond the Coast',
        description: 'While famous for its coastline, Croatia\'s interior holds hidden gems including dramatic canyons, waterfalls, and forested peaks.',
        highlights: ['Plitvice Lakes', 'Paklenica', 'Velebit', 'Northern Velebit NP'],
        icon: Trees,
        image: '/destinations/croatia.jpg',
        tourCount: 8,
        featured: false,
    },
    {
        id: 'albania',
        name: 'Albania',
        tagline: 'Europe\'s Last Secret',
        description: 'The Albanian Alps (Prokletije) remain one of Europe\'s most unspoiled mountain regions, offering authentic village experiences and dramatic scenery.',
        highlights: ['Valbona Valley', 'Theth', 'Blue Eye', 'Accursed Mountains'],
        icon: Sun,
        image: '/destinations/albania.jpg',
        tourCount: 6,
        featured: true,
    },
    {
        id: 'north-macedonia',
        name: 'North Macedonia',
        tagline: 'Land of Lakes and Peaks',
        description: 'Ancient forests, glacial lakes, and the beautiful Šar Mountains await in this underrated gem of the Balkans.',
        highlights: ['Lake Ohrid', 'Mavrovo', 'Šar Mountains', 'Pelister'],
        icon: Camera,
        image: '/destinations/macedonia.jpg',
        tourCount: 5,
        featured: false,
    },
    {
        id: 'bosnia',
        name: 'Bosnia & Herzegovina',
        tagline: 'Where History Meets Nature',
        description: 'Wild rivers carving through limestone mountains, dense forests, and authentic mountain villages make Bosnia a hidden treasure.',
        highlights: ['Sutjeska National Park', 'Bjelašnica', 'Lukomir Village', 'Una River'],
        icon: Trees,
        image: '/destinations/bosnia.jpg',
        tourCount: 4,
        featured: false,
    },
];

export default async function DestinationsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Explore the <span className="text-primary">Balkans</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From the Julian Alps to the Albanian peaks, discover six countries of
                        stunning mountain landscapes and incredible photography opportunities.
                    </p>
                </div>
            </section>

            {/* Map Overview */}
            <section className="py-16 bg-card border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        {destinations.map((dest) => (
                            <Link
                                key={dest.id}
                                href={`#${dest.id}`}
                                className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                            >
                                {dest.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destinations */}
            <section className="py-20">
                <div className="container mx-auto px-4 space-y-24">
                    {destinations.map((dest, index) => (
                        <div
                            key={dest.id}
                            id={dest.id}
                            className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                        >
                            {/* Image */}
                            <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                    <dest.icon className="h-24 w-24 text-muted-foreground/30" />
                                </div>
                                {dest.featured && (
                                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            {/* Content */}
                            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <dest.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold">{dest.name}</h2>
                                        <p className="text-primary text-sm">{dest.tagline}</p>
                                    </div>
                                </div>

                                <p className="text-muted-foreground mb-6">
                                    {dest.description}
                                </p>

                                {/* Highlights */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                        Key Highlights
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {dest.highlights.map((highlight) => (
                                            <span
                                                key={highlight}
                                                className="px-3 py-1 rounded-full bg-muted text-sm"
                                            >
                                                <MapPin className="h-3 w-3 inline mr-1 text-primary" />
                                                {highlight}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link href={`/tours?destination=${dest.id}`}>
                                        <Button className="rounded-full">
                                            View {dest.tourCount} Tours
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Not Sure Where to Start?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Our team can help you choose the perfect destination based on your experience level and interests.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact">
                            <Button size="lg" className="rounded-full px-8">
                                Get Personalized Recommendations
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
