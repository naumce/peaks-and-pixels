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
    role: 'customer' | 'guide' | 'partner' | 'admin' | 'operator';
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
    operator_id: string | null;
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
    cover_image: string | null;
    featured_image_url: string | null;
    featured_images: string[];
    gallery_images: string[];
    status: string;
    is_featured: boolean;
    is_seasonal: boolean;
    seasonal_months: number[];
    elevation_gain: number | null;
    distance_km: number | null;
    terrain_type: string | null;
    photo_opportunities: boolean;
    itinerary: unknown[];
    route_data: unknown | null;
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
    participants: unknown;
    base_price: number;
    discount_code: string | null;
    discount_amount: number;
    add_ons: unknown;
    total_amount: number;
    special_requests: string | null;
    dietary_restrictions: string | null;
    emergency_contact: unknown | null;
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
    witness_statements: unknown;
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

export interface DbClub {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    tagline: string | null;
    cover_image: string | null;
    logo: string | null;
    activity_types: string[];
    location: string | null;
    owner_id: string;
    status: string;
    is_verified: boolean;
    rejection_reason: string | null;
    approved_at: string | null;
    approved_by: string | null;
    is_public: boolean;
    require_approval: boolean;
    member_count: number;
    event_count: number;
    post_count: number;
    created_at: string;
    updated_at: string;
}

export interface DbClubMember {
    id: string;
    club_id: string;
    user_id: string;
    role: string;
    status: string;
    invited_by: string | null;
    joined_at: string;
}

export interface DbClubPost {
    id: string;
    club_id: string;
    author_id: string;
    content: string;
    images: string[];
    is_public: boolean;
    is_pinned: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

export interface DbClubEvent {
    id: string;
    club_id: string;
    created_by: string;
    title: string;
    description: string | null;
    cover_image: string | null;
    start_datetime: string;
    end_datetime: string | null;
    location: string | null;
    location_lat: number | null;
    location_lng: number | null;
    meeting_point: string | null;
    route_id: string | null;
    max_participants: number | null;
    current_participants: number;
    is_paid: boolean;
    price: number | null;
    currency: string;
    status: string;
    cancellation_reason: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbClubEventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface DbNotification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbOperatorApplication {
    id: string;
    user_id: string;
    business_name: string;
    experience_description: string;
    offerings_description: string;
    certifications: string[];
    languages: string[];
    status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbTourWaypoint {
    id: string;
    tour_id: string;
    order_index: number;
    lat: number;
    lng: number;
    elevation: number | null;
    title: string | null;
    description: string | null;
    type: string;
    images: string[];
    created_at: string;
    updated_at: string;
}

export interface DbTourImage {
    id: string;
    tour_id: string;
    url: string;
    alt: string | null;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DbUserSettings {
    user_id: string;
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
    tour_reminders: boolean;
    club_updates: boolean;
    preferred_language: string;
    theme: string;
    updated_at: string;
}

// =============================================================================
// SUPABASE DATABASE TYPE (for type-safe queries)
// =============================================================================

// Helper: wraps interface in a type alias so it satisfies Record<string, unknown>
type AsRecord<T> = { [K in keyof T]: T[K] };

export type Database = {
    public: {
        Tables: {
            users: {
                Row: AsRecord<DbUser>;
                Insert: AsRecord<Partial<DbUser>>;
                Update: AsRecord<Partial<DbUser>>;
                Relationships: [];
            };
            tours: {
                Row: AsRecord<DbTour>;
                Insert: AsRecord<Partial<DbTour>>;
                Update: AsRecord<Partial<DbTour>>;
                Relationships: [];
            };
            tour_instances: {
                Row: AsRecord<DbTourInstance>;
                Insert: AsRecord<Partial<DbTourInstance>>;
                Update: AsRecord<Partial<DbTourInstance>>;
                Relationships: [{
                    foreignKeyName: "tour_instances_tour_id_fkey";
                    columns: ["tour_id"];
                    isOneToOne: false;
                    referencedRelation: "tours";
                    referencedColumns: ["id"];
                }];
            };
            tour_images: {
                Row: AsRecord<DbTourImage>;
                Insert: AsRecord<Partial<DbTourImage>>;
                Update: AsRecord<Partial<DbTourImage>>;
                Relationships: [];
            };
            tour_waypoints: {
                Row: AsRecord<DbTourWaypoint>;
                Insert: AsRecord<Partial<DbTourWaypoint>>;
                Update: AsRecord<Partial<DbTourWaypoint>>;
                Relationships: [];
            };
            bookings: {
                Row: AsRecord<DbBooking>;
                Insert: AsRecord<Partial<DbBooking>>;
                Update: AsRecord<Partial<DbBooking>>;
                Relationships: [{
                    foreignKeyName: "bookings_tour_instance_id_fkey";
                    columns: ["tour_instance_id"];
                    isOneToOne: false;
                    referencedRelation: "tour_instances";
                    referencedColumns: ["id"];
                }, {
                    foreignKeyName: "bookings_customer_id_fkey";
                    columns: ["customer_id"];
                    isOneToOne: false;
                    referencedRelation: "users";
                    referencedColumns: ["id"];
                }];
            };
            reviews: {
                Row: AsRecord<DbReview>;
                Insert: AsRecord<Partial<DbReview>>;
                Update: AsRecord<Partial<DbReview>>;
                Relationships: [{
                    foreignKeyName: "reviews_customer_id_fkey";
                    columns: ["customer_id"];
                    isOneToOne: false;
                    referencedRelation: "users";
                    referencedColumns: ["id"];
                }, {
                    foreignKeyName: "reviews_tour_id_fkey";
                    columns: ["tour_id"];
                    isOneToOne: false;
                    referencedRelation: "tours";
                    referencedColumns: ["id"];
                }];
            };
            partners: {
                Row: AsRecord<DbPartner>;
                Insert: AsRecord<Partial<DbPartner>>;
                Update: AsRecord<Partial<DbPartner>>;
                Relationships: [];
            };
            transactions: {
                Row: AsRecord<DbTransaction>;
                Insert: AsRecord<Partial<DbTransaction>>;
                Update: AsRecord<Partial<DbTransaction>>;
                Relationships: [];
            };
            incidents: {
                Row: AsRecord<DbIncident>;
                Insert: AsRecord<Partial<DbIncident>>;
                Update: AsRecord<Partial<DbIncident>>;
                Relationships: [];
            };
            clubs: {
                Row: AsRecord<DbClub>;
                Insert: AsRecord<Partial<DbClub>>;
                Update: AsRecord<Partial<DbClub>>;
                Relationships: [];
            };
            club_members: {
                Row: AsRecord<DbClubMember>;
                Insert: AsRecord<Partial<DbClubMember>>;
                Update: AsRecord<Partial<DbClubMember>>;
                Relationships: [];
            };
            club_posts: {
                Row: AsRecord<DbClubPost>;
                Insert: AsRecord<Partial<DbClubPost>>;
                Update: AsRecord<Partial<DbClubPost>>;
                Relationships: [];
            };
            club_events: {
                Row: AsRecord<DbClubEvent>;
                Insert: AsRecord<Partial<DbClubEvent>>;
                Update: AsRecord<Partial<DbClubEvent>>;
                Relationships: [];
            };
            club_event_rsvps: {
                Row: AsRecord<DbClubEventRegistration>;
                Insert: AsRecord<Partial<DbClubEventRegistration>>;
                Update: AsRecord<Partial<DbClubEventRegistration>>;
                Relationships: [];
            };
            notifications: {
                Row: AsRecord<DbNotification>;
                Insert: AsRecord<Partial<DbNotification>>;
                Update: AsRecord<Partial<DbNotification>>;
                Relationships: [];
            };
            operator_applications: {
                Row: AsRecord<DbOperatorApplication>;
                Insert: AsRecord<Partial<DbOperatorApplication>>;
                Update: AsRecord<Partial<DbOperatorApplication>>;
                Relationships: [];
            };
            user_settings: {
                Row: AsRecord<DbUserSettings>;
                Insert: AsRecord<Partial<DbUserSettings>>;
                Update: AsRecord<Partial<DbUserSettings>>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            increment_club_member_count: {
                Args: { club_id: string };
                Returns: void;
            };
            decrement_club_member_count: {
                Args: { club_id: string };
                Returns: void;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
