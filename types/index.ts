/**
 * Peaks & Pixels v2 - Type Definitions
 * Core domain types for the tour booking platform
 */

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 'customer' | 'guide' | 'partner' | 'admin';

export type TourDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export type TourType =
    | 'hiking'
    | 'photography'
    | 'combined'
    | 'multi-day'
    | 'cultural';

export type TourStatus = 'draft' | 'active' | 'archived';

export type TourInstanceStatus =
    | 'scheduled'
    | 'full'
    | 'cancelled'
    | 'completed';

export type BookingStatus =
    | 'pending_payment'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'no_show';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'refunded'
    | 'partially_refunded'
    | 'failed';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type TransactionType =
    | 'booking_payment'
    | 'refund'
    | 'commission_payout';

// =============================================================================
// BASE TYPES (Shared across entities)
// =============================================================================

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface TimeRange {
    start: Date;
    end: Date;
}

// =============================================================================
// USER & AUTH
// =============================================================================

export interface User extends BaseEntity {
    email: string;
    role: UserRole;

    // Profile
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;

    // Preferences
    preferredLanguage: string;
    marketingConsent: boolean;
    smsConsent: boolean;

    // Auth metadata (from Supabase)
    emailVerified: boolean;
    lastSignInAt?: Date;
}

export interface Customer extends User {
    role: 'customer';

    // CRM fields
    country?: string;
    segment?: 'new' | 'regular' | 'vip';
    lifetimeBookings: number;
    lifetimeValue: number;
    lastBookingAt?: Date;
}

export interface Guide extends User {
    role: 'guide';

    // Guide-specific
    bio?: string;
    specialties: string[];
    languages: string[];
    certifications: string[];
    isAvailable: boolean;
}

export interface Partner extends BaseEntity {
    // Partner info
    name: string;
    type: 'hotel' | 'agency' | 'influencer' | 'other';
    contactName?: string;
    email: string;
    phone?: string;
    website?: string;

    // Referral
    referralCode: string;
    commissionRate: number; // Percentage (0-100)

    // Status
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    agreementSignedAt?: Date;
    agreementExpiresAt?: Date;

    // Stats (calculated)
    totalReferrals: number;
    totalBookings: number;
    totalCommissionEarned: number;
}

// =============================================================================
// TOUR
// =============================================================================

export interface Tour extends BaseEntity {
    slug: string;
    name: string;
    tagline?: string;
    description: string;
    highlights: string[];

    // Classification
    type: TourType;
    difficulty: TourDifficulty;
    durationMinutes: number;
    durationDisplay?: string; // "4 hours" or "2 days"

    // Capacity & Pricing
    minParticipants: number;
    maxParticipants: number;
    basePrice: number;

    // Details
    whatsIncluded: string[];
    whatsNotIncluded: string[];
    whatToBring: string[];
    fitnessRequirements?: string;
    ageRequirements?: string;

    // Location
    meetingPoint: string;
    meetingPointLocation?: GeoLocation;
    locationArea?: string;

    // Media
    featuredImages: string[];
    galleryImages: string[];

    // Status
    status: TourStatus;
    isSeasonal: boolean;
    seasonalMonths: number[]; // 1-12

    // SEO
    seoTitle?: string;
    seoDescription?: string;
}

export interface TourRoute {
    tourId: string;
    geojson: {
        type: 'FeatureCollection';
        features: Array<{
            type: 'Feature';
            geometry: {
                type: 'LineString' | 'Point';
                coordinates: number[][];
            };
            properties: Record<string, unknown>;
        }>;
    };
    waypoints: TourWaypoint[];
    totalDistance: number; // meters
    totalElevationGain: number; // meters
}

export interface TourWaypoint {
    id: string;
    order: number;
    title: string;
    description?: string;
    location: GeoLocation;
    imageUrl?: string;
    estimatedTimeFromStart: number; // minutes
}

// =============================================================================
// TOUR INSTANCE (Scheduled occurrence)
// =============================================================================

export interface TourInstance extends BaseEntity {
    tourId: string;

    // Schedule
    startDatetime: Date;
    endDatetime: Date;

    // Capacity
    capacityMax: number;
    capacityBooked: number;

    // Pricing override
    priceOverride?: number;

    // Status
    status: TourInstanceStatus;
    cancellationReason?: string;

    // Weather
    weatherCheckedAt?: Date;
    weatherDecision?: 'go' | 'monitor' | 'cancel';
    weatherNotes?: string;

    // Guide assignment
    guideId?: string;

    // Derived
    availableSlots: number; // capacityMax - capacityBooked
}

// =============================================================================
// BOOKING
// =============================================================================

export interface Booking extends BaseEntity {
    reference: string; // PX-1234

    // Relationships
    tourInstanceId: string;
    customerId: string;
    partnerId?: string;

    // Lead participant
    leadParticipant: {
        name: string;
        email: string;
        phone: string;
    };

    // All participants
    participantCount: number;
    participants: BookingParticipant[];

    // Pricing
    basePrice: number;
    discountCode?: string;
    discountAmount: number;
    addOns: BookingAddOn[];
    totalAmount: number;

    // Details
    specialRequests?: string;
    dietaryRestrictions?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };

    // Status
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;

    // Payment
    paymentMethod?: 'card' | 'bank_transfer' | 'partner_invoice';
    paymentIntentId?: string;
    paidAt?: Date;

    // Waiver
    waiverSigned: boolean;
    waiverSignedAt?: Date;
    waiverIpAddress?: string;
    photoPermission: boolean;

    // Tracking
    referralSource?: string;
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;

    // Cancellation
    cancelledAt?: Date;
    cancellationReason?: string;
    cancelledBy?: 'customer' | 'admin' | 'system';
    refundAmount?: number;
    refundedAt?: Date;

    // Expiry (for pending payments)
    expiresAt?: Date;
}

export interface BookingParticipant {
    name: string;
    age?: number;
    dietaryRestrictions?: string;
}

export interface BookingAddOn {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// =============================================================================
// REVIEW
// =============================================================================

export interface Review extends BaseEntity {
    bookingId: string;
    customerId: string;
    tourId: string;

    // Content
    rating: number; // 1-5
    title?: string;
    content: string;
    photos: string[];

    // Status
    status: ReviewStatus;
    isFeatured: boolean;

    // Response
    operatorResponse?: string;
    respondedAt?: Date;
}

// =============================================================================
// FINANCIAL
// =============================================================================

export interface Transaction extends BaseEntity {
    type: TransactionType;
    amount: number;
    currency: string;

    // Relationships
    bookingId?: string;
    partnerId?: string;

    // Processor
    processor: 'stripe' | 'bank' | 'manual';
    processorTransactionId?: string;
    processorFee?: number;
    netAmount?: number;

    // Status
    status: 'pending' | 'completed' | 'failed';
    notes?: string;
}

// =============================================================================
// INCIDENT (Safety)
// =============================================================================

export interface Incident extends BaseEntity {
    tourInstanceId?: string;
    bookingId?: string;

    // Details
    incidentType: 'injury' | 'medical' | 'equipment' | 'weather' | 'other';
    severity: IncidentSeverity;
    title: string;
    description: string;
    incidentDatetime: Date;

    // Response
    actionsTaken?: string;
    outcome?: string;

    // Evidence
    photos: string[];
    witnessStatements: {
        name: string;
        statement: string;
    }[];

    // Insurance
    insuranceClaimFiled: boolean;
    insuranceClaimNumber?: string;

    // Status
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    resolvedAt?: Date;

    // Prevention
    correctiveActions?: string;
    preventiveMeasures?: string;
}

// =============================================================================
// EQUIPMENT
// =============================================================================

export interface Equipment extends BaseEntity {
    name: string;
    category: 'camera' | 'hiking' | 'safety' | 'transport' | 'other';
    serialNumber?: string;

    // Purchase
    purchaseDate?: Date;
    purchasePrice?: number;

    // Status
    condition: 'new' | 'good' | 'fair' | 'poor' | 'retired';
    status: 'available' | 'in_use' | 'maintenance' | 'lost';

    // Maintenance
    lastInspectionDate?: Date;
    nextInspectionDue?: Date;
    maintenanceLog: MaintenanceEntry[];
}

export interface MaintenanceEntry {
    date: Date;
    type: 'inspection' | 'repair' | 'cleaning';
    notes: string;
    performedBy: string;
}
