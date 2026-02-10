'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Mail, Phone, MapPin, Clock, Send,
    MessageSquare, HelpCircle, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'hello@peaksandpixels.com',
        href: 'mailto:hello@peaksandpixels.com',
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '+386 1 234 5678',
        href: 'tel:+38612345678',
    },
    {
        icon: MapPin,
        label: 'Location',
        value: 'Ljubljana, Slovenia',
        href: null,
    },
    {
        icon: Clock,
        label: 'Hours',
        value: 'Mon-Fri: 9am - 6pm CET',
        href: null,
    },
];

const faqItems = [
    {
        question: 'How do I book a tour?',
        answer: 'Browse our tours, select your preferred date, and complete the booking online. You\'ll receive a confirmation email with all the details.',
    },
    {
        question: 'What\'s your cancellation policy?',
        answer: 'Full refund up to 14 days before the tour. 50% refund 7-14 days before. No refund within 7 days, but you can transfer your booking.',
    },
    {
        question: 'What should I bring on a tour?',
        answer: 'Each tour has specific requirements listed on its page. Generally: sturdy hiking boots, weather-appropriate clothing, camera, water, and snacks.',
    },
    {
        question: 'Are tours suitable for beginners?',
        answer: 'We offer tours for all skill levels. Each tour clearly indicates the difficulty level and required fitness.',
    },
];

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLoading(false);
        setSubmitted(true);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Get in <span className="text-primary">Touch</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Have questions about our tours or want to plan a custom adventure?
                        We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    {contactInfo.map((item) => (
                                        <div key={item.label} className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                                                <item.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        className="font-medium hover:text-primary transition-colors"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="font-medium">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-card rounded-xl p-6 border border-border/50">
                                <h3 className="font-semibold mb-4">Quick Links</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/tours"
                                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Building className="h-4 w-4" />
                                        Browse Tours
                                    </Link>
                                    <Link
                                        href="/clubs"
                                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Join a Club
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        About Us
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-card rounded-2xl p-8 border border-border/50">
                                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Send className="h-8 w-8 text-green-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Thanks for reaching out. We'll get back to you within 24 hours.
                                        </p>
                                        <Button onClick={() => setSubmitted(false)} variant="outline">
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Your name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject *</Label>
                                            <Input
                                                id="subject"
                                                placeholder="What's this about?"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message *</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Tell us more..."
                                                rows={6}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full gap-2"
                                            disabled={loading}
                                        >
                                            <Send className="h-4 w-4" />
                                            {loading ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-card">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Quick answers to common questions about our tours and services.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {faqItems.map((item, index) => (
                            <div
                                key={index}
                                className="bg-background rounded-xl p-6 border border-border/50"
                            >
                                <h3 className="font-semibold mb-3 flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    {item.question}
                                </h3>
                                <p className="text-muted-foreground text-sm pl-8">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
