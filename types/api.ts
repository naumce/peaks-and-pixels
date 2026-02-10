/**
 * API Request/Response Types
 * Standard patterns for API communication
 */

import type {
    Tour,
    TourInstance,
    Booking,
    Customer,
    Review,
    TourDifficulty,
    BookingStatus,
    PaymentStatus
} from './index';

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

export interface ApiResponse<T> {
    data: T;
    success: true;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// =============================================================================
// PAGINATION
// =============================================================================

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

// =============================================================================
// TOUR API
// =============================================================================

export interface TourListParams extends PaginationParams {
    difficulty?: TourDifficulty;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: 'active' | 'draft' | 'archived';
}

export interface TourListResponse extends PaginatedResponse<Tour> { }

export interface TourDetailResponse {
    tour: Tour;
    instances: TourInstance[];
    reviews: {
        items: Review[];
        averageRating: number;
        totalCount: number;
    };
}

export interface CreateTourRequest {
    name: string;
    slug?: string; // Auto-generated if not provided
    tagline?: string;
    description: string;
    type: string;
    difficulty: TourDifficulty;
    durationMinutes: number;
    basePrice: number;
    maxParticipants: number;
    minParticipants?: number;
    meetingPoint: string;
    whatsIncluded?: string[];
    whatToBring?: string[];
}

export interface UpdateTourRequest extends Partial<CreateTourRequest> {
    status?: 'draft' | 'active' | 'archived';
}

// =============================================================================
// TOUR INSTANCE API
// =============================================================================

export interface TourInstanceListParams extends PaginationParams {
    tourId?: string;
    dateFrom?: string; // ISO date
    dateTo?: string;   // ISO date
    status?: string;
    guideId?: string;
}

export interface CreateTourInstanceRequest {
    tourId: string;
    startDatetime: string; // ISO datetime
    endDatetime: string;
    capacityMax?: number; // Defaults to tour.maxParticipants
    priceOverride?: number;
    guideId?: string;
}

export interface AvailabilityResponse {
    month: string; // YYYY-MM
    instances: {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        availableSlots: number;
        status: 'available' | 'limited' | 'full' | 'cancelled';
        price: number;
    }[];
}

// =============================================================================
// BOOKING API
// =============================================================================

export interface BookingListParams extends PaginationParams {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    tourId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string; // Search by reference or customer name
}

export interface BookingCalculateRequest {
    tourInstanceId: string;
    participantCount: number;
    promoCode?: string;
    addOns?: { id: string; quantity: number }[];
}

export interface BookingCalculateResponse {
    basePrice: number;
    participantCount: number;
    subtotal: number;
    discount: {
        code?: string;
        amount: number;
        type?: 'percent' | 'fixed';
    };
    addOns: {
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }[];
    total: number;
    expiresIn: number; // seconds until this price expires
}

export interface CreateBookingRequest {
    tourInstanceId: string;

    // Lead participant (required)
    leadParticipant: {
        name: string;
        email: string;
        phone: string;
    };

    // Additional participants
    participants: {
        name: string;
        age?: number;
        dietaryRestrictions?: string;
    }[];

    // Optional
    specialRequests?: string;
    dietaryRestrictions?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };

    // Pricing
    promoCode?: string;
    addOns?: { id: string; quantity: number }[];

    // Tracking
    referralSource?: string;
}

export interface CreateBookingResponse {
    booking: Booking;
    paymentIntent?: {
        clientSecret: string;
        amount: number;
        currency: string;
    };
    expiresAt: string; // ISO datetime
}

export interface CancelBookingRequest {
    reason: string;
    refundAmount?: number; // Admin can override
}

// =============================================================================
// CUSTOMER API
// =============================================================================

export interface CustomerListParams extends PaginationParams {
    segment?: 'new' | 'regular' | 'vip';
    search?: string;
    hasBookings?: boolean;
}

export interface CustomerDetailResponse {
    customer: Customer;
    bookings: Booking[];
    reviews: Review[];
    stats: {
        totalBookings: number;
        lifetimeValue: number;
        averageRating: number;
        firstBookingDate?: string;
        lastBookingDate?: string;
    };
}

// =============================================================================
// AUTH API
// =============================================================================

export interface SignUpRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    marketingConsent?: boolean;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
    session: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    };
}

export interface ResetPasswordRequest {
    email: string;
}

export interface UpdatePasswordRequest {
    token: string;
    newPassword: string;
}

// =============================================================================
// ADMIN STATS API
// =============================================================================

export interface DashboardStatsResponse {
    revenue: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        lastMonth: number;
        trend: number; // Percentage change
    };
    bookings: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        totalThisMonth: number;
    };
    tours: {
        active: number;
        upcomingThisWeek: number;
        capacityUtilization: number; // Percentage
    };
    customers: {
        total: number;
        newThisMonth: number;
    };
}

export interface RevenueChartData {
    period: 'day' | 'week' | 'month';
    data: {
        date: string;
        revenue: number;
        bookings: number;
    }[];
}
