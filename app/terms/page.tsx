import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Terms of Service | Peaks & Pixels',
    description: 'Terms and conditions for using Peaks & Pixels services.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-16 bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">
                        Last updated: January 2026
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl prose prose-invert">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Peaks & Pixels services, you accept and agree to be bound
                        by the terms and provisions of this agreement. If you do not agree to these terms,
                        please do not use our services.
                    </p>

                    <h2>2. Description of Services</h2>
                    <p>
                        Peaks & Pixels provides hiking and photography tour services, community clubs,
                        and related outdoor adventure experiences in the Balkans region.
                    </p>

                    <h2>3. Booking and Payment</h2>
                    <h3>3.1 Reservations</h3>
                    <p>
                        All tour bookings are subject to availability. A booking is confirmed only upon
                        receipt of full payment and written confirmation from Peaks & Pixels.
                    </p>
                    <h3>3.2 Pricing</h3>
                    <p>
                        All prices are displayed in Euros (€) and include applicable taxes unless
                        otherwise stated. Prices may change without notice, but confirmed bookings
                        will be honored at the original price.
                    </p>
                    <h3>3.3 Payment Methods</h3>
                    <p>
                        We accept major credit cards, PayPal, and bank transfers for group bookings.
                        Payment must be completed to confirm your reservation.
                    </p>

                    <h2 id="cancellation">4. Cancellation Policy</h2>
                    <ul>
                        <li><strong>14+ days before:</strong> Full refund</li>
                        <li><strong>7-14 days before:</strong> 50% refund</li>
                        <li><strong>Less than 7 days:</strong> No refund (transfer available)</li>
                    </ul>
                    <p>
                        Peaks & Pixels reserves the right to cancel tours due to weather conditions,
                        insufficient participants, or other safety concerns. In such cases, a full
                        refund or alternative date will be offered.
                    </p>

                    <h2>5. Participant Responsibilities</h2>
                    <p>Participants agree to:</p>
                    <ul>
                        <li>Provide accurate personal and health information</li>
                        <li>Follow guide instructions at all times</li>
                        <li>Be physically fit for the chosen tour difficulty level</li>
                        <li>Bring appropriate clothing and equipment as specified</li>
                        <li>Respect fellow participants, guides, and the environment</li>
                    </ul>

                    <h2>6. Liability and Insurance</h2>
                    <p>
                        Participants acknowledge that outdoor activities involve inherent risks.
                        Peaks & Pixels maintains appropriate liability insurance, but participants
                        are strongly encouraged to obtain personal travel and medical insurance.
                    </p>
                    <p>
                        Peaks & Pixels is not liable for personal injury, loss, or damage except
                        where caused by negligence on our part.
                    </p>

                    <h2>7. Clubs and Community</h2>
                    <p>
                        Club creators and administrators are responsible for their club's content
                        and activities. Peaks & Pixels reserves the right to remove clubs or content
                        that violates these terms or community guidelines.
                    </p>

                    <h2>8. Intellectual Property</h2>
                    <p>
                        All content on this website, including images, text, and logos, is the
                        property of Peaks & Pixels or its licensors and is protected by copyright laws.
                    </p>

                    <h2>9. Privacy</h2>
                    <p>
                        Your privacy is important to us. Please review our{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>{' '}
                        for information on how we collect, use, and protect your data.
                    </p>

                    <h2>10. Changes to Terms</h2>
                    <p>
                        Peaks & Pixels reserves the right to modify these terms at any time.
                        Continued use of our services after changes constitutes acceptance of
                        the new terms.
                    </p>

                    <h2>11. Contact</h2>
                    <p>
                        For questions about these terms, please{' '}
                        <Link href="/contact" className="text-primary hover:underline">
                            contact us
                        </Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
