import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mountain, Camera, Award, Star, MapPin, Calendar } from 'lucide-react';

export const metadata = {
    title: 'Our Guides | Peaks & Pixels',
    description: 'Meet our expert mountain guides and photography specialists.',
};

export default async function GuidesPage() {
    const supabase = await createClient();

    // Get guides from admin users with guide role
    const { data: guides } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'guide')
        .order('first_name');

    // Fallback guides if none in database
    const displayGuides = guides?.length ? guides : [
        {
            id: '1',
            first_name: 'Marko',
            last_name: 'Petrović',
            bio: 'With 15 years of guiding experience across the Balkans, Marko brings unparalleled knowledge of local trails and hidden gems. His passion for connecting adventurers with nature is infectious.',
            avatar_url: null,
            specialties: ['Alpine Hiking', 'Winter Tours', 'Photography'],
            certifications: ['UIAGM Mountain Guide', 'Wilderness First Responder'],
            tours_led: 250,
            rating: 4.9,
        },
        {
            id: '2',
            first_name: 'Ana',
            last_name: 'Horvat',
            bio: 'Award-winning landscape photographer and mountain enthusiast. Ana combines technical photography expertise with deep knowledge of golden hour spots throughout the region.',
            avatar_url: null,
            specialties: ['Photography Tours', 'Sunrise Expeditions', 'Landscape'],
            certifications: ['Professional Photographer', 'Hiking Guide License'],
            tours_led: 180,
            rating: 4.95,
        },
        {
            id: '3',
            first_name: 'Luka',
            last_name: 'Novak',
            bio: 'Born and raised in the Julian Alps, Luka knows every secret trail and viewpoint. He specializes in multi-day expeditions and wilderness camping.',
            avatar_url: null,
            specialties: ['Multi-day Treks', 'Camping', 'Navigation'],
            certifications: ['Mountain Rescue Team', 'First Aid Instructor'],
            tours_led: 200,
            rating: 4.85,
        },
        {
            id: '4',
            first_name: 'Elena',
            last_name: 'Dimitrova',
            bio: 'Former competitive trail runner turned guide, Elena brings energy and expertise to every tour. Her routes are designed to maximize scenic impact while maintaining accessible difficulty levels.',
            avatar_url: null,
            specialties: ['Trail Running', 'Day Hikes', 'Fitness Tours'],
            certifications: ['Sports Science Degree', 'Trail Running Coach'],
            tours_led: 120,
            rating: 4.88,
        },
    ];

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
                        Meet Our <span className="text-primary">Expert Guides</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Passionate adventurers and certified professionals dedicated to making
                        your mountain experience safe, memorable, and extraordinary.
                    </p>
                </div>
            </section>

            {/* Guides Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        {displayGuides.map((guide: any) => (
                            <div
                                key={guide.id}
                                className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all"
                            >
                                <div className="p-8">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Avatar */}
                                        <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                                            {guide.avatar_url ? (
                                                <Image
                                                    src={guide.avatar_url}
                                                    alt={`${guide.first_name} ${guide.last_name}`}
                                                    width={96}
                                                    height={96}
                                                    className="rounded-2xl object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl font-bold text-muted-foreground">
                                                    {guide.first_name?.[0]}{guide.last_name?.[0]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <h3 className="text-xl font-semibold">
                                                        {guide.first_name} {guide.last_name}
                                                    </h3>
                                                    {guide.rating && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                            <span className="text-sm font-medium">{guide.rating}</span>
                                                            {guide.tours_led && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    • {guide.tours_led} tours led
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-muted-foreground text-sm mb-4">
                                                {guide.bio}
                                            </p>

                                            {/* Specialties */}
                                            {guide.specialties && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {guide.specialties.map((spec: string) => (
                                                        <Badge key={spec} variant="secondary" className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Certifications */}
                                            {guide.certifications && (
                                                <div className="flex flex-wrap gap-2">
                                                    {guide.certifications.map((cert: string) => (
                                                        <span
                                                            key={cert}
                                                            className="text-xs text-muted-foreground flex items-center gap-1"
                                                        >
                                                            <Award className="h-3 w-3 text-primary" />
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-card border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Join an Adventure?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Our guides are ready to take you on an unforgettable journey through the Balkans.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/tours">
                            <Button size="lg" className="rounded-full px-8">
                                Browse Tours
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="rounded-full px-8">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
