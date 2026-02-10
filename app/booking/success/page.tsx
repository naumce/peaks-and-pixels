import Link from 'next/link';
import { Suspense } from 'react';
import { Check, Calendar, Mail, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SuccessContent({ reference }: { reference: string }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Success Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
                        <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </div>
                </div>

                {/* Main Message */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-foreground">Booking Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Your adventure is booked. We've sent the details to your email.
                    </p>
                </div>

                {/* Booking Reference */}
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Your Booking Reference</p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                        {reference}
                    </p>
                </div>

                {/* What's Next */}
                <div className="p-6 rounded-2xl bg-secondary/30 text-left space-y-4">
                    <h3 className="font-semibold text-foreground">What happens next?</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                                Check your email for the confirmation and tour details
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                                Add the tour date to your calendar
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button className="flex-1 h-12 gradient-primary text-white rounded-xl" asChild>
                        <Link href="/account/bookings">
                            View My Bookings
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ ref?: string }>;
}) {
    const params = await searchParams;
    const reference = params.ref || 'UNKNOWN';

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessContent reference={reference} />
        </Suspense>
    );
}
