import Link from 'next/link';
import Image from 'next/image';
import { Mountain, Camera, Users, Heart, MapPin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'About Us | Peaks & Pixels',
    description: 'Learn about Peaks & Pixels - premium hiking and photography tours in the Balkans.',
};

const stats = [
    { value: '500+', label: 'Tours Completed' },
    { value: '5,000+', label: 'Happy Adventurers' },
    { value: '50+', label: 'Unique Routes' },
    { value: '10+', label: 'Expert Guides' },
];

const values = [
    {
        icon: Mountain,
        title: 'Adventure First',
        description: 'We believe in authentic experiences that push boundaries while keeping safety paramount.',
    },
    {
        icon: Camera,
        title: 'Capture the Moment',
        description: 'Every tour is designed with photographers in mind - we find the best light and angles.',
    },
    {
        icon: Users,
        title: 'Community Driven',
        description: 'Our clubs bring together like-minded adventurers to share experiences and stories.',
    },
    {
        icon: Heart,
        title: 'Sustainable Travel',
        description: 'We practice and promote responsible tourism to protect the natural beauty we explore.',
    },
];

const team = [
    {
        name: 'Marko Petrović',
        role: 'Founder & Lead Guide',
        bio: '15 years of mountain guiding experience across the Balkans.',
        image: '/team/marko.jpg',
    },
    {
        name: 'Ana Horvat',
        role: 'Photography Director',
        bio: 'Award-winning landscape photographer with a passion for alpine scenes.',
        image: '/team/ana.jpg',
    },
    {
        name: 'Luka Novak',
        role: 'Operations Manager',
        bio: 'Ensures every tour runs smoothly from booking to summit.',
        image: '/team/luka.jpg',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Bringing Mountains & <span className="text-primary">Memories</span> Together
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Peaks & Pixels was born from a simple idea: combine the thrill of mountain
                        exploration with the art of photography to create unforgettable experiences.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-card border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                                <p className="text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Founded in 2018 in the Julian Alps of Slovenia, Peaks & Pixels started
                                    as a small group of friends who shared two passions: hiking and photography.
                                </p>
                                <p>
                                    What began as weekend adventures quickly grew into something more.
                                    Friends brought friends, and soon we were organizing tours for groups
                                    of adventurers from around the world.
                                </p>
                                <p>
                                    Today, we've expanded across the Balkans - from the dramatic peaks of
                                    Montenegro to the ancient forests of North Macedonia. Our mission remains
                                    the same: to help you discover the raw beauty of these mountains while
                                    capturing moments that last a lifetime.
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mountain className="h-24 w-24 text-muted-foreground/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-card">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">What We Stand For</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our values guide every decision we make, from route selection to guide training.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value) => (
                            <div key={value.title} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                                    <value.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Passionate adventurers dedicated to making your experience extraordinary.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {team.map((member) => (
                            <div key={member.name} className="text-center">
                                <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                                    <Users className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                <p className="text-primary text-sm mb-3">{member.role}</p>
                                <p className="text-muted-foreground text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join thousands of adventurers who have discovered the magic of the Balkans with us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/tours">
                            <Button size="lg" className="rounded-full px-8">
                                Explore Tours
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="rounded-full px-8">
                                Get in Touch
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
