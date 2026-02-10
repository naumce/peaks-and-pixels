import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, ArrowRight, Users, Mountain, Heart } from 'lucide-react';

export const metadata = {
    title: 'Careers | Peaks & Pixels',
    description: 'Join the Peaks & Pixels team - work where adventure meets creativity.',
};

const openPositions = [
    {
        id: 1,
        title: 'Senior Mountain Guide',
        department: 'Operations',
        location: 'Ljubljana, Slovenia',
        type: 'Full-time',
        description: 'Lead photography and hiking tours across the Julian Alps and beyond.',
    },
    {
        id: 2,
        title: 'Photography Workshop Instructor',
        department: 'Content',
        location: 'Remote / On-location',
        type: 'Contract',
        description: 'Teach landscape and wildlife photography during our specialty tours.',
    },
    {
        id: 3,
        title: 'Community Manager',
        department: 'Marketing',
        location: 'Ljubljana, Slovenia',
        type: 'Full-time',
        description: 'Grow and engage our community of outdoor enthusiasts across platforms.',
    },
];

const benefits = [
    {
        icon: Mountain,
        title: 'Adventure Time',
        description: 'Free access to all Peaks & Pixels tours annually',
    },
    {
        icon: Heart,
        title: 'Health & Wellness',
        description: 'Comprehensive health insurance and gym membership',
    },
    {
        icon: Users,
        title: 'Great Team',
        description: 'Work with passionate outdoor and creative professionals',
    },
    {
        icon: Clock,
        title: 'Flexible Hours',
        description: 'Remote-friendly culture with flexible working hours',
    },
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-6">We're Hiring</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Work Where <span className="text-primary">Adventure</span> Meets Creativity
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join our team of passionate adventurers and help others discover
                        the beauty of the Balkans.
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 bg-card border-y border-border">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-12">Why Work With Us</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Find your next adventure with Peaks & Pixels. We're always looking
                            for talented people to join our team.
                        </p>
                    </div>

                    {openPositions.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-border/50 max-w-2xl mx-auto">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                            <p className="text-muted-foreground mb-6">
                                We don't have any open positions right now, but we're always
                                interested in hearing from talented people.
                            </p>
                            <Link href="/contact">
                                <Button variant="outline">Get in Touch</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {openPositions.map((position) => (
                                <div
                                    key={position.id}
                                    className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/50 transition-colors group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                                {position.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {position.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-4 w-4" />
                                                    {position.department}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {position.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {position.type}
                                                </span>
                                            </div>
                                        </div>
                                        <Link href={`/contact?subject=Application: ${position.title}`}>
                                            <Button className="gap-2 shrink-0">
                                                Apply Now
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Don't See the Right Role?</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        We're always interested in meeting talented people. Send us your CV
                        and tell us how you could contribute to our team.
                    </p>
                    <Link href="/contact">
                        <Button size="lg" variant="outline" className="rounded-full px-8">
                            Send Us Your CV
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
