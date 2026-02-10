import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Peaks & Pixels',
    description: 'Privacy policy for Peaks & Pixels - how we handle your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-16 bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">
                        Last updated: January 2026
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl prose prose-invert">
                    <h2>1. Information We Collect</h2>
                    <h3>Personal Information</h3>
                    <p>We collect information you provide directly:</p>
                    <ul>
                        <li>Name, email address, and phone number</li>
                        <li>Billing and payment information</li>
                        <li>Emergency contact details</li>
                        <li>Health information relevant to tours</li>
                        <li>Profile information and preferences</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <p>When you use our services, we may collect:</p>
                    <ul>
                        <li>Device and browser information</li>
                        <li>IP address and location data</li>
                        <li>Usage patterns and preferences</li>
                        <li>Cookies and similar technologies</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Process bookings and payments</li>
                        <li>Communicate about your tours and account</li>
                        <li>Provide customer support</li>
                        <li>Improve our services and website</li>
                        <li>Send marketing communications (with consent)</li>
                        <li>Ensure safety during tours</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2>3. Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul>
                        <li><strong>Tour guides:</strong> Essential information for tour operation</li>
                        <li><strong>Payment processors:</strong> For secure payment handling</li>
                        <li><strong>Emergency services:</strong> When necessary for safety</li>
                        <li><strong>Legal authorities:</strong> When required by law</li>
                    </ul>
                    <p>We do not sell your personal information to third parties.</p>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect
                        your personal information against unauthorized access, alteration, disclosure,
                        or destruction.
                    </p>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing</li>
                        <li>Data portability</li>
                        <li>Withdraw consent</li>
                    </ul>
                    <p>
                        To exercise these rights, please{' '}
                        <Link href="/contact" className="text-primary hover:underline">
                            contact us
                        </Link>.
                    </p>

                    <h2>6. Cookies</h2>
                    <p>
                        We use cookies and similar technologies to enhance your experience,
                        analyze usage, and assist with marketing. You can manage cookie
                        preferences through your browser settings.
                    </p>

                    <h2>7. Data Retention</h2>
                    <p>
                        We retain personal information for as long as necessary to provide
                        our services and comply with legal obligations. Booking records are
                        kept for 7 years for accounting purposes.
                    </p>

                    <h2>8. International Transfers</h2>
                    <p>
                        Your data may be processed in countries outside your residence.
                        We ensure appropriate safeguards are in place for such transfers
                        in compliance with applicable data protection laws.
                    </p>

                    <h2>9. Children's Privacy</h2>
                    <p>
                        Our services are not intended for children under 16. We do not
                        knowingly collect personal information from children without
                        parental consent.
                    </p>

                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We may update this policy periodically. Significant changes will
                        be communicated via email or website notice.
                    </p>

                    <h2>11. Contact Us</h2>
                    <p>
                        For privacy-related questions or concerns, please{' '}
                        <Link href="/contact" className="text-primary hover:underline">
                            contact us
                        </Link>{' '}
                        or email privacy@peaksandpixels.com.
                    </p>
                </div>
            </section>
        </div>
    );
}
