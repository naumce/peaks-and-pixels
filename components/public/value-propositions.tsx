import { Users, Shield, Camera, Mountain } from 'lucide-react';

const values = [
    {
        icon: Users,
        title: 'Small Groups',
        description: 'Maximum 12 people per tour ensures personalized attention and minimal environmental impact.',
    },
    {
        icon: Shield,
        title: 'Safety First',
        description: 'All guides are certified with first aid training. We carry satellite communication on every trek.',
    },
    {
        icon: Camera,
        title: 'Photo Focused',
        description: 'Designed for photographers with extended stops at scenic viewpoints and golden hour timing.',
    },
    {
        icon: Mountain,
        title: 'Local Experts',
        description: 'Our guides are locals who know every hidden trail, secret viewpoint, and mountain story.',
    },
];

export function ValuePropositions() {
    return (
        <section className="py-20 lg:py-32 bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Why Choose Us
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We&apos;re not just another tour company. Here&apos;s what makes us different.
                    </p>
                </div>

                {/* Values grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="group p-6 rounded-2xl bg-card border border-border/50 card-hover"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-apple">
                                <value.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {value.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
