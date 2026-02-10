-- Peaks & Pixels V2 - Database Schema
-- Run this in Supabase SQL Editor to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS (extends Supabase auth.users)
-- =============================================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'guide', 'partner', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT FALSE,
    sms_consent BOOLEAN DEFAULT FALSE,
    
    -- CRM fields (for customers)
    country TEXT,
    segment TEXT CHECK (segment IN ('new', 'regular', 'vip')),
    lifetime_bookings INTEGER DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    last_booking_at TIMESTAMPTZ,
    
    -- Guide-specific fields
    bio TEXT,
    specialties TEXT[],
    languages TEXT[],
    certifications TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TOURS
-- =============================================================================
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    
    -- Classification
    type TEXT NOT NULL CHECK (type IN ('hiking', 'photography', 'combined', 'multi-day', 'cultural')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
    duration_minutes INTEGER NOT NULL,
    duration_display TEXT,
    
    -- Capacity & Pricing
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    
    -- Details
    whats_included TEXT[] DEFAULT '{}',
    whats_not_included TEXT[] DEFAULT '{}',
    what_to_bring TEXT[] DEFAULT '{}',
    fitness_requirements TEXT,
    age_requirements TEXT,
    
    -- Location
    meeting_point TEXT NOT NULL,
    meeting_point_lat DECIMAL(10,7),
    meeting_point_lng DECIMAL(10,7),
    location_area TEXT,
    
    -- Media
    featured_images TEXT[] DEFAULT '{}',
    gallery_images TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    is_seasonal BOOLEAN DEFAULT FALSE,
    seasonal_months INTEGER[] DEFAULT '{}',
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TOUR INSTANCES (Scheduled occurrences)
-- =============================================================================
CREATE TABLE public.tour_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    
    -- Schedule
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    
    -- Capacity
    capacity_max INTEGER NOT NULL,
    capacity_booked INTEGER DEFAULT 0,
    
    -- Pricing override
    price_override DECIMAL(10,2),
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'full', 'cancelled', 'completed')),
    cancellation_reason TEXT,
    
    -- Weather
    weather_checked_at TIMESTAMPTZ,
    weather_decision TEXT CHECK (weather_decision IN ('go', 'monitor', 'cancel')),
    weather_notes TEXT,
    
    -- Guide
    guide_id UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PARTNERS
-- =============================================================================
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'agency', 'influencer', 'other')),
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    
    -- Referral
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    agreement_signed_at TIMESTAMPTZ,
    agreement_expires_at TIMESTAMPTZ,
    
    -- Stats
    total_referrals INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BOOKINGS
-- =============================================================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    
    -- Relationships
    tour_instance_id UUID NOT NULL REFERENCES tour_instances(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID REFERENCES partners(id),
    
    -- Lead participant
    lead_participant_name TEXT NOT NULL,
    lead_participant_email TEXT NOT NULL,
    lead_participant_phone TEXT NOT NULL,
    
    -- Participants
    participant_count INTEGER NOT NULL,
    participants JSONB DEFAULT '[]',
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    discount_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    add_ons JSONB DEFAULT '[]',
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Details
    special_requests TEXT,
    dietary_restrictions TEXT,
    emergency_contact JSONB,
    
    -- Status
    booking_status TEXT DEFAULT 'pending_payment' CHECK (booking_status IN ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
    
    -- Payment
    payment_method TEXT CHECK (payment_method IN ('card', 'bank_transfer', 'partner_invoice')),
    payment_intent_id TEXT,
    paid_at TIMESTAMPTZ,
    
    -- Waiver
    waiver_signed BOOLEAN DEFAULT FALSE,
    waiver_signed_at TIMESTAMPTZ,
    waiver_ip_address TEXT,
    photo_permission BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    referral_source TEXT,
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by TEXT CHECK (cancelled_by IN ('customer', 'admin', 'system')),
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- REVIEWS
-- =============================================================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    tour_id UUID NOT NULL REFERENCES tours(id),
    
    -- Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Response
    operator_response TEXT,
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRANSACTIONS
-- =============================================================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('booking_payment', 'refund', 'commission_payout')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    -- Relationships
    booking_id UUID REFERENCES bookings(id),
    partner_id UUID REFERENCES partners(id),
    
    -- Processor
    processor TEXT NOT NULL CHECK (processor IN ('stripe', 'bank', 'manual')),
    processor_transaction_id TEXT,
    processor_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INCIDENTS
-- =============================================================================
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_instance_id UUID REFERENCES tour_instances(id),
    booking_id UUID REFERENCES bookings(id),
    
    -- Details
    incident_type TEXT NOT NULL CHECK (incident_type IN ('injury', 'medical', 'equipment', 'weather', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_datetime TIMESTAMPTZ NOT NULL,
    
    -- Response
    actions_taken TEXT,
    outcome TEXT,
    
    -- Evidence
    photos TEXT[] DEFAULT '{}',
    witness_statements JSONB DEFAULT '[]',
    
    -- Insurance
    insurance_claim_filed BOOLEAN DEFAULT FALSE,
    insurance_claim_number TEXT,
    pss_notified BOOLEAN DEFAULT FALSE,
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolved_at TIMESTAMPTZ,
    
    -- Prevention
    corrective_actions TEXT,
    preventive_measures TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tour_instances_tour_id ON tour_instances(tour_id);
CREATE INDEX idx_tour_instances_start_datetime ON tour_instances(start_datetime);
CREATE INDEX idx_bookings_reference ON bookings(reference);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_tour_instance_id ON bookings(tour_instance_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_partners_referral_code ON partners(referral_code);
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Public can view active tours
CREATE POLICY "Anyone can view active tours" ON tours
    FOR SELECT USING (status = 'active');

-- Admins can do anything with tours
CREATE POLICY "Admins have full access to tours" ON tours
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Public can view scheduled tour instances
CREATE POLICY "Anyone can view scheduled instances" ON tour_instances
    FOR SELECT USING (status IN ('scheduled', 'full'));

-- Users can view own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid());

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Admins have full access to bookings
CREATE POLICY "Admins have full access to bookings" ON bookings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Public can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_tour_instances_updated_at BEFORE UPDATE ON tour_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference = 'PX-' || LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_booking_ref BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Auto-create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- SEED DATA (Optional - for testing)
-- =============================================================================

-- Uncomment to add sample data:
-- INSERT INTO tours (slug, name, description, type, difficulty, duration_minutes, max_participants, base_price, meeting_point, status) VALUES
-- ('sunrise-photography', 'Sunrise Photography Tour', 'Capture stunning sunrise photos...', 'photography', 'easy', 180, 8, 89.00, 'Main Square, Ohrid', 'active'),
-- ('mountain-adventure', 'Mountain Adventure Hike', 'Challenging mountain hiking...', 'hiking', 'hard', 360, 6, 129.00, 'Mountain Base Camp', 'active');
