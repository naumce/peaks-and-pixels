'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calendar, User, Mail, Phone, Users, CreditCard, Check, Loader2 } from 'lucide-react';

interface BookingFormProps {
    tour: {
        id: string;
        slug: string;
        name: string;
        base_price: number;
        max_participants: number;
    };
    availableDates: {
        id: string;
        date: string;
        spots_left: number;
    }[];
}

export function BookingForm({ tour, availableDates }: BookingFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [participants, setParticipants] = useState(2);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: '',
    });

    const selectedDateInfo = availableDates.find(d => d.id === selectedDate);
    const totalPrice = tour.base_price * participants;
    const maxParticipants = selectedDateInfo
        ? Math.min(selectedDateInfo.spots_left, tour.max_participants)
        : tour.max_participants;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleSubmit = async () => {
        if (!selectedDate) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tour_instance_id: selectedDate,
                    participant_count: participants,
                    lead_participant_name: `${formData.firstName} ${formData.lastName}`,
                    lead_participant_email: formData.email,
                    lead_participant_phone: formData.phone,
                    special_requests: formData.specialRequests,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create booking');
            }

            router.push(`/booking/success?ref=${data.booking.reference}`);
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.message || 'Failed to create booking');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Progress steps */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-apple',
                            step >= s
                                ? 'gradient-primary text-white'
                                : 'bg-secondary text-muted-foreground'
                        )}>
                            {step > s ? <Check className="h-4 w-4" /> : s}
                        </div>
                        <span className={cn(
                            'text-xs sm:text-sm font-medium',
                            step >= s ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                            {s === 1 ? 'Date' : s === 2 ? 'Info' : 'Pay'}
                        </span>
                        {s < 3 && <div className="h-px w-4 sm:w-8 bg-border" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Date Selection */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">Select Your Date</h2>
                        <p className="text-muted-foreground">Choose from available tour dates below.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableDates.map((date) => (
                            <button
                                key={date.id}
                                onClick={() => setSelectedDate(date.id)}
                                disabled={date.spots_left === 0}
                                className={cn(
                                    'p-4 rounded-xl border text-left transition-apple',
                                    selectedDate === date.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border/50 bg-card hover:border-primary/50',
                                    date.spots_left === 0 && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium text-foreground">{formatDate(date.date)}</p>
                                        <p className={cn(
                                            'text-sm',
                                            date.spots_left <= 3 ? 'text-amber-400' : 'text-muted-foreground'
                                        )}>
                                            {date.spots_left === 0 ? 'Sold out' : `${date.spots_left} spots left`}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Participants */}
                    {selectedDate && (
                        <div className="p-4 rounded-xl bg-card border border-border/50">
                            <Label className="text-foreground mb-3 block">Number of Participants</Label>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                                    disabled={participants <= 1}
                                >
                                    -
                                </Button>
                                <span className="text-xl font-semibold text-foreground w-8 text-center">
                                    {participants}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={() => setParticipants(Math.min(maxParticipants, participants + 1))}
                                    disabled={participants >= maxParticipants}
                                >
                                    +
                                </Button>
                                <Users className="h-5 w-5 text-muted-foreground ml-2" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Total: <span className="font-semibold text-foreground">€{totalPrice}</span>
                            </p>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full h-14 gradient-primary text-white rounded-xl"
                        disabled={!selectedDate}
                        onClick={() => setStep(2)}
                    >
                        Continue to Details
                    </Button>
                </div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">Your Details</h2>
                        <p className="text-muted-foreground">Enter lead participant information.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+389 70 123 456"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                        <textarea
                            id="specialRequests"
                            placeholder="Dietary requirements, accessibility needs, etc."
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 rounded-xl"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-14 gradient-primary text-white rounded-xl"
                            disabled={!formData.firstName || !formData.lastName || !formData.email}
                            onClick={() => setStep(3)}
                        >
                            Continue to Payment
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">Payment</h2>
                        <p className="text-muted-foreground">Review your booking and complete payment.</p>
                    </div>

                    {/* Booking summary */}
                    <div className="p-6 rounded-xl bg-card border border-border/50 space-y-4">
                        <h3 className="font-semibold text-foreground">Booking Summary</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tour</span>
                                <span className="text-foreground">{tour.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="text-foreground">
                                    {selectedDateInfo && formatDate(selectedDateInfo.date)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Participants</span>
                                <span className="text-foreground">{participants} people</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lead Participant</span>
                                <span className="text-foreground">{formData.firstName} {formData.lastName}</span>
                            </div>
                        </div>

                        <div className="border-t border-border/50 pt-4">
                            <div className="flex justify-between text-lg font-semibold">
                                <span className="text-foreground">Total</span>
                                <span className="text-foreground">€{totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment placeholder */}
                    <div className="p-6 rounded-xl bg-secondary/50 border border-dashed border-border text-center">
                        <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            Payment integration (Stripe) would go here
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 rounded-xl"
                            onClick={() => setStep(2)}
                            disabled={isSubmitting}
                        >
                            Back
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-14 gradient-primary text-white rounded-xl glow-hover"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Complete Booking - €{totalPrice}</>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        By completing this booking you agree to our{' '}
                        <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/terms#cancellation" className="text-primary hover:underline">Cancellation Policy</a>.
                    </p>
                </div>
            )}
        </div>
    );
}
