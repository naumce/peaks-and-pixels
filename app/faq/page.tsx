import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const metadata = {
    title: 'FAQ | Peaks & Pixels',
    description: 'Frequently asked questions about Peaks & Pixels tours and services.',
};

const faqCategories = [
    {
        title: 'Booking & Payments',
        questions: [
            {
                q: 'How do I book a tour?',
                a: 'Browse our tours, select your preferred date and number of participants, then complete the checkout process. You\'ll receive a confirmation email with all the details.',
            },
            {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for group bookings.',
            },
            {
                q: 'What is your cancellation policy?',
                a: 'Full refund up to 14 days before the tour. 50% refund between 7-14 days. No refund within 7 days, but you can transfer your booking to another date or person.',
            },
            {
                q: 'Can I modify my booking?',
                a: 'Yes, you can modify your booking up to 7 days before the tour date. Contact us or use your account dashboard to make changes.',
            },
        ],
    },
    {
        title: 'Tour Information',
        questions: [
            {
                q: 'What should I bring on a tour?',
                a: 'Each tour has specific requirements listed on its page. Generally: sturdy hiking boots, weather-appropriate layers, camera equipment, water (at least 2L), snacks, sunscreen, and a rain jacket.',
            },
            {
                q: 'Are tours suitable for beginners?',
                a: 'We offer tours for all skill levels. Each tour clearly indicates the difficulty level and required fitness. If you\'re unsure, contact us and we\'ll help you choose the right tour.',
            },
            {
                q: 'What happens if weather is bad?',
                a: 'Safety is our priority. We monitor weather closely and may reschedule tours in dangerous conditions. You\'ll receive a full refund or free rescheduling if we cancel.',
            },
            {
                q: 'Is photography equipment provided?',
                a: 'Bring your own camera equipment. Our guides can provide photography tips and help you find the best shots. Some photography-focused tours may have equipment available for rent.',
            },
        ],
    },
    {
        title: 'Clubs & Community',
        questions: [
            {
                q: 'How do I join a club?',
                a: 'Browse clubs on our platform, find one that matches your interests, and click "Join". Some clubs require approval from administrators.',
            },
            {
                q: 'Can I create my own club?',
                a: 'Yes! Any registered user can create a club. Submit your club for review, and once approved by our team, you can start inviting members.',
            },
            {
                q: 'What are club events?',
                a: 'Club events are activities organized by club members for their community. They can be hikes, photo walks, workshops, or social gatherings.',
            },
        ],
    },
    {
        title: 'Safety & Insurance',
        questions: [
            {
                q: 'Are guides certified?',
                a: 'All our guides are certified mountain guides with first aid training. Many also have photography backgrounds and local expertise.',
            },
            {
                q: 'Do I need travel insurance?',
                a: 'We strongly recommend travel insurance that covers hiking and outdoor activities. Our tours don\'t include personal insurance.',
            },
            {
                q: 'What safety measures are in place?',
                a: 'Guides carry first aid kits, emergency communication devices, and are trained in mountain rescue. We maintain small group sizes and have strict safety protocols.',
            },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about our tours, bookings, and services.
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {faqCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <HelpCircle className="h-6 w-6 text-primary" />
                                {category.title}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((item, index) => (
                                    <details
                                        key={index}
                                        className="group bg-card rounded-xl border border-border/50 overflow-hidden"
                                    >
                                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-muted/50 transition-colors">
                                            <span className="font-medium pr-4">{item.q}</span>
                                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="px-5 pb-5 text-muted-foreground">
                                            {item.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Still Have Questions */}
            <section className="py-16 bg-card border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Can't find what you're looking for? Our team is here to help.
                    </p>
                    <Link href="/contact">
                        <Button size="lg" className="rounded-full px-8">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
