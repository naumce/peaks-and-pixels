import Link from 'next/link';
import { Mountain, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
    explore: [
        { href: '/tours', label: 'All Tours' },
        { href: '/clubs', label: 'Clubs' },
        { href: '/feed', label: 'Community Feed' },
    ],
    company: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/careers', label: 'Careers' },
    ],
    support: [
        { href: '/faq', label: 'FAQ' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
    ],
};

const socialLinks = [
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Youtube, label: 'YouTube' },
];

export function SiteFooter() {
    return (
        <footer className="bg-card border-t border-border">
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                                <span className="text-lg">🏔️</span>
                            </div>
                            <span className="font-bold text-lg">Peaks & Pixels</span>
                        </Link>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Premium hiking and photography tours in the Balkans.
                            Discover breathtaking landscapes and create lasting memories.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="font-semibold mb-4">Explore</h4>
                        <ul className="space-y-3">
                            {footerLinks.explore.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Peaks & Pixels. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        Made with ❤️ in the Balkans
                    </div>
                </div>
            </div>
        </footer>
    );
}
