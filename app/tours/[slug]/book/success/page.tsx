import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Mail, Download, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
    searchParams: Promise<{ ref?: string }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const bookingRef = params.ref || 'UNKNOWN';

    return (
        <>

            <section className="pt-32 pb-20 lg:pb-32">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
                    {/* Success icon */}
                    <div className="mx-auto h-20 w-20 rounded-full gradient-primary flex items-center justify-center mb-8 glow">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Booking Confirmed!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Thank you for booking with Peaks & Pixels. Your adventure awaits!
                    </p>

                    {/* Booking reference */}
                    <div className="p-6 rounded-2xl bg-card border border-border/50 mb-8">
                        <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                        <p className="text-2xl font-mono font-bold text-foreground">{bookingRef}</p>
                    </div>

                    {/* What's next */}
                    <div className="text-left p-6 rounded-2xl bg-secondary/30 border border-border/50 mb-8">
                        <h2 className="font-semibold text-foreground mb-4">What happens next?</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Confirmation Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent booking details to your email address.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Pre-Tour Information</p>
                                    <p className="text-sm text-muted-foreground">
                                        You'll receive packing list and meeting details 3 days before your tour.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Download className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Digital Voucher</p>
                                    <p className="text-sm text-muted-foreground">
                                        Show your voucher on the day of the tour (print or mobile).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 rounded-xl" asChild>
                            <Link href="/tours">
                                Explore More Tours
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 rounded-xl" asChild>
                            <Link href="/">
                                Return Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
