/**
 * Database Types
 * Maps to Supabase tables (snake_case for DB, converted to camelCase in app)
 */

// =============================================================================
// DATABASE ROW TYPES (as stored in Supabase)
// =============================================================================

export interface DbUser {
    id: string;
    email: string;
    role: 'customer' | 'guide' | 'partner' | 'admin';
    first_name: string;
    last_name: string;
    phone: string | null;
    avatar_url: string | null;
    preferred_language: string;
    marketing_consent: boolean;
    sms_consent: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbTour {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    short_description: string | null;
    description: string;
    highlights: string[];
    type: string;
    difficulty: string;
    duration_minutes: number;
    duration_days: number;
    duration_display: string | null;
    min_participants: number;
    max_participants: number;
    base_price: number;
    whats_included: string[];
    whats_not_included: string[];
    what_to_bring: string[];
    fitness_requirements: string | null;
    age_requirements: string | null;
    meeting_point: string;
    meeting_point_lat: number | null;
    meeting_point_lng: number | null;
    location_area: string | null;
    featured_images: string[];
    gallery_images: string[];
    status: string;
    is_featured: boolean;
    is_seasonal: boolean;
    seasonal_months: number[];
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbTourInstance {
    id: string;
    tour_id: string;
    start_datetime: string;
    end_datetime: string;
    capacity_max: number;
    capacity_booked: number;
    price_override: number | null;
    status: string;
    cancellation_reason: string | null;
    weather_checked_at: string | null;
    weather_decision: string | null;
    weather_notes: string | null;
    guide_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbBooking {
    id: string;
    reference: string;
    tour_instance_id: string;
    customer_id: string;
    partner_id: string | null;
    lead_participant_name: string;
    lead_participant_email: string;
    lead_participant_phone: string;
    participant_count: number;
    participants: unknown; // JSON
    base_price: number;
    discount_code: string | null;
    discount_amount: number;
    add_ons: unknown; // JSON
    total_amount: number;
    special_requests: string | null;
    dietary_restrictions: string | null;
    emergency_contact: unknown | null; // JSON
    booking_status: string;
    payment_status: string;
    payment_method: string | null;
    payment_intent_id: string | null;
    paid_at: string | null;
    waiver_signed: boolean;
    waiver_signed_at: string | null;
    waiver_ip_address: string | null;
    photo_permission: boolean;
    referral_source: string | null;
    utm_campaign: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    cancelled_by: string | null;
    refund_amount: number | null;
    refunded_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbReview {
    id: string;
    booking_id: string;
    customer_id: string;
    tour_id: string;
    rating: number;
    title: string | null;
    content: string;
    photos: string[];
    status: string;
    is_featured: boolean;
    operator_response: string | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbPartner {
    id: string;
    name: string;
    type: string;
    contact_name: string | null;
    email: string;
    phone: string | null;
    website: string | null;
    referral_code: string;
    commission_rate: number;
    status: string;
    agreement_signed_at: string | null;
    agreement_expires_at: string | null;
    total_referrals: number;
    total_bookings: number;
    total_commission_earned: number;
    created_at: string;
    updated_at: string;
}

export interface DbTransaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    booking_id: string | null;
    partner_id: string | null;
    processor: string;
    processor_transaction_id: string | null;
    processor_fee: number | null;
    net_amount: number | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbIncident {
    id: string;
    tour_instance_id: string | null;
    booking_id: string | null;
    incident_type: string;
    severity: string;
    title: string;
    description: string;
    incident_datetime: string;
    actions_taken: string | null;
    outcome: string | null;
    photos: string[];
    witness_statements: unknown; // JSON
    insurance_claim_filed: boolean;
    insurance_claim_number: string | null;
    pss_notified: boolean;
    status: string;
    resolved_at: string | null;
    corrective_actions: string | null;
    preventive_measures: string | null;
    created_at: string;
    updated_at: string;
}

// =============================================================================
// SUPABASE DATABASE TYPE (for type-safe queries)
// =============================================================================

export interface Database {
    public: {
        Tables: {
            users: {
                Row: DbUser;
                Insert: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbUser, 'id' | 'created_at' | 'updated_at'>>;
            };
            tours: {
                Row: DbTour;
                Insert: Omit<DbTour, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbTour, 'id' | 'created_at' | 'updated_at'>>;
            };
            tour_instances: {
                Row: DbTourInstance;
                Insert: Omit<DbTourInstance, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbTourInstance, 'id' | 'created_at' | 'updated_at'>>;
            };
            bookings: {
                Row: DbBooking;
                Insert: Omit<DbBooking, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbBooking, 'id' | 'created_at' | 'updated_at'>>;
            };
            reviews: {
                Row: DbReview;
                Insert: Omit<DbReview, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbReview, 'id' | 'created_at' | 'updated_at'>>;
            };
            partners: {
                Row: DbPartner;
                Insert: Omit<DbPartner, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbPartner, 'id' | 'created_at' | 'updated_at'>>;
            };
            transactions: {
                Row: DbTransaction;
                Insert: Omit<DbTransaction, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbTransaction, 'id' | 'created_at' | 'updated_at'>>;
            };
            incidents: {
                Row: DbIncident;
                Insert: Omit<DbIncident, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DbIncident, 'id' | 'created_at' | 'updated_at'>>;
            };
        };
    };
}
