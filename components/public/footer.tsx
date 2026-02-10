import Link from 'next/link';
import { Mountain, Mail, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';

const footerLinks = {
    explore: [
        { name: 'All Tours', href: '/tours' },
        { name: 'Hiking Tours', href: '/tours?category=hiking' },
        { name: 'Photo Tours', href: '/tours?category=photo' },
        { name: 'Custom Tours', href: '/tours/custom' },
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Guides', href: '/guides' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Blog', href: '/blog' },
    ],
    support: [
        { name: 'Contact', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Booking Policy', href: '/policies/booking' },
        { name: 'Cancellation', href: '/policies/cancellation' },
    ],
};

const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export function Footer() {
    return (
        <footer className="bg-card border-t border-border/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main footer content */}
                <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                                <span className="text-xl">🏔️</span>
                            </div>
                            <span className="text-lg font-bold text-foreground">Peaks & Pixels</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-sm mb-6">
                            Premium hiking and photography tours in the Balkans.
                            Discover breathtaking landscapes with expert guides.
                        </p>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Skopje, North Macedonia</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary" />
                                <a href="mailto:hello@peaksandpixels.com" className="hover:text-foreground transition-apple">
                                    hello@peaksandpixels.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary" />
                                <a href="tel:+38970123456" className="hover:text-foreground transition-apple">
                                    +389 70 123 456
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Links columns */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Explore</h3>
                        <ul className="space-y-3">
                            {footerLinks.explore.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-apple"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-apple"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-apple"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Peaks & Pixels. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-apple"
                            >
                                <social.icon className="h-5 w-5" />
                                <span className="sr-only">{social.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
