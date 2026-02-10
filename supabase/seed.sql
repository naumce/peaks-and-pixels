-- =============================================================================
-- PEAKS & PIXELS - SEED DATA
-- Run this in Supabase SQL Editor to add sample data for testing
-- =============================================================================

-- =============================================================================
-- SAMPLE TOURS (5 tours with different difficulties and types)
-- =============================================================================

INSERT INTO public.tours (
    slug, name, tagline, description, type, difficulty, 
    duration_minutes, max_participants, base_price,
    meeting_point, location_area, status,
    whats_included, whats_not_included, what_to_bring, highlights
) VALUES

-- Tour 1: Easy day hike
(
    'lake-bled-sunrise',
    'Lake Bled Sunrise Photography',
    'Capture the magic of Lake Bled at golden hour',
    'Join us for an unforgettable sunrise photography session at Slovenia''s most iconic lake. We''ll hike to the best viewpoints, learn composition techniques, and capture stunning photos of the island church with the Alps as backdrop.',
    'photography',
    'easy',
    180, -- 3 hours
    8,
    89.00,
    'Bled Castle Parking Lot',
    'Lake Bled, Slovenia',
    'active',
    ARRAY['Professional photography guide', 'Tripod rental', 'Hot coffee/tea', 'Digital photo editing tips'],
    ARRAY['Camera equipment', 'Transportation to meeting point', 'Breakfast'],
    ARRAY['Camera with manual mode', 'Warm layers', 'Comfortable walking shoes', 'Water bottle'],
    ARRAY['Golden hour at Lake Bled', 'Island church views', 'Julian Alps backdrop', 'Small group experience']
),

-- Tour 2: Moderate hiking
(
    'triglav-summit-expedition',
    'Triglav Summit Expedition',
    'Conquer Slovenia''s highest peak at 2,864m',
    'A challenging 2-day expedition to the summit of Triglav, Slovenia''s national symbol. Experience Via Ferrata sections, overnight stay in a mountain hut, and witness breathtaking panoramic views from the highest point in the Julian Alps.',
    'hiking',
    'hard',
    2880, -- 2 days (48 hours)
    6,
    349.00,
    'Krma Valley Trailhead',
    'Triglav National Park, Slovenia',
    'active',
    ARRAY['Certified mountain guide', 'Via Ferrata equipment', 'Mountain hut accommodation', 'All meals during expedition', 'Safety briefing'],
    ARRAY['Personal hiking gear', 'Travel insurance', 'Transportation to trailhead'],
    ARRAY['Hiking boots (ankle support required)', 'Layered clothing', 'Rain jacket', 'Headlamp', 'Sunscreen', 'Personal first aid kit'],
    ARRAY['Summit at 2,864m', 'Via Ferrata experience', 'Mountain hut stay', 'Sunrise from the peak', 'Certificate of ascent']
),

-- Tour 3: Cultural tour
(
    'skopje-hidden-gems',
    'Skopje Hidden Gems Walk',
    'Discover the secret corners of North Macedonia''s capital',
    'Explore beyond the main square and discover Skopje''s authentic neighborhoods, hidden courtyards, and local gems. Visit artisan workshops, taste traditional food, and hear stories that guidebooks don''t tell.',
    'cultural',
    'easy',
    240, -- 4 hours
    12,
    45.00,
    'Stone Bridge (Kamen Most)',
    'Skopje, North Macedonia',
    'active',
    ARRAY['Local expert guide', 'Food tastings at 3 locations', 'Entry to artisan workshop', 'Illustrated city map'],
    ARRAY['Meals (beyond tastings)', 'Personal expenses'],
    ARRAY['Comfortable walking shoes', 'Camera', 'Appetite for local food'],
    ARRAY['Old Bazaar exploration', 'Traditional craft workshops', 'Local food tastings', 'Hidden courtyards', 'Street art tour']
),

-- Tour 4: Combined hiking + photography
(
    'sharr-mountains-adventure',
    'Šar Mountains Photography Trek',
    'Hike through wildflower meadows with your camera',
    'A moderate day hike through the stunning Šar Mountains on the border of Kosovo and North Macedonia. Perfect for photographers, this route takes you through alpine meadows, past shepherd huts, and offers incredible views of the mountain range.',
    'combined',
    'moderate',
    480, -- 8 hours
    8,
    125.00,
    'Brezovica Ski Resort Parking',
    'Šar Mountains, Kosovo',
    'active',
    ARRAY['Hiking guide', 'Photography tips throughout', 'Packed lunch', 'Transport from Pristina available (+€20)'],
    ARRAY['Photography equipment', 'Personal snacks'],
    ARRAY['Hiking boots', 'Layers for changing weather', 'Camera', 'Tripod (optional)', 'Sunscreen', '2L water minimum'],
    ARRAY['Alpine meadows in bloom', 'Traditional shepherd huts', 'Panoramic mountain views', 'Wildlife spotting', 'Golden hour photography']
),

-- Tour 5: Multi-day adventure
(
    'albanian-alps-traverse',
    'Albanian Alps 5-Day Traverse',
    'The legendary Peaks of the Balkans route',
    'Experience the most spectacular multi-day trek in the Balkans. This 5-day journey takes you through the Accursed Mountains (Bjeshkët e Namuna), staying in traditional guesthouses, crossing high passes, and experiencing authentic mountain hospitality.',
    'multi-day',
    'hard',
    7200, -- 5 days
    8,
    749.00,
    'Theth Village Center',
    'Albanian Alps, Albania',
    'active',
    ARRAY['Expert mountain guide', 'All guesthouse accommodations', 'All meals', 'Luggage transfers between villages', 'Border crossing assistance'],
    ARRAY['Travel insurance (mandatory)', 'Personal hiking gear', 'Tips for guesthouse hosts'],
    ARRAY['Broken-in hiking boots', 'Trekking poles', 'Rain gear', '30-40L daypack', 'Warm layers', 'Headlamp', 'Personal medication'],
    ARRAY['Theth to Valbona route', 'High mountain passes', 'Traditional guesthouses', 'Albanian hospitality', 'Stunning valley views', 'Blue Eye spring visit']
);

-- =============================================================================
-- TOUR INSTANCES (Scheduled dates for next 2 months)
-- Creates instances for each tour at various dates
-- =============================================================================

-- Get tour IDs and create instances
DO $$
DECLARE
    tour_bled UUID;
    tour_triglav UUID;
    tour_skopje UUID;
    tour_sharr UUID;
    tour_albania UUID;
    base_date DATE := CURRENT_DATE + INTERVAL '3 days';
BEGIN
    -- Get tour IDs
    SELECT id INTO tour_bled FROM tours WHERE slug = 'lake-bled-sunrise';
    SELECT id INTO tour_triglav FROM tours WHERE slug = 'triglav-summit-expedition';
    SELECT id INTO tour_skopje FROM tours WHERE slug = 'skopje-hidden-gems';
    SELECT id INTO tour_sharr FROM tours WHERE slug = 'sharr-mountains-adventure';
    SELECT id INTO tour_albania FROM tours WHERE slug = 'albanian-alps-traverse';

    -- Lake Bled Sunrise - Every Saturday and Sunday for 8 weeks
    FOR i IN 0..7 LOOP
        -- Saturday
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_bled,
            (base_date + (i * 7) * INTERVAL '1 day' + INTERVAL '5 hours')::TIMESTAMPTZ,
            (base_date + (i * 7) * INTERVAL '1 day' + INTERVAL '8 hours')::TIMESTAMPTZ,
            8,
            'scheduled'
        );
        -- Sunday
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_bled,
            (base_date + (i * 7 + 1) * INTERVAL '1 day' + INTERVAL '5 hours')::TIMESTAMPTZ,
            (base_date + (i * 7 + 1) * INTERVAL '1 day' + INTERVAL '8 hours')::TIMESTAMPTZ,
            8,
            'scheduled'
        );
    END LOOP;

    -- Triglav Summit - Selected weekends (2-day tour)
    FOR i IN 0..3 LOOP
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_triglav,
            (base_date + (i * 14 + 7) * INTERVAL '1 day' + INTERVAL '6 hours')::TIMESTAMPTZ,
            (base_date + (i * 14 + 9) * INTERVAL '1 day' + INTERVAL '18 hours')::TIMESTAMPTZ,
            6,
            'scheduled'
        );
    END LOOP;

    -- Skopje Hidden Gems - Every day except Monday for 4 weeks
    FOR i IN 0..27 LOOP
        IF EXTRACT(DOW FROM base_date + i * INTERVAL '1 day') != 1 THEN -- Skip Mondays
            INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
            VALUES (
                tour_skopje,
                (base_date + i * INTERVAL '1 day' + INTERVAL '10 hours')::TIMESTAMPTZ,
                (base_date + i * INTERVAL '1 day' + INTERVAL '14 hours')::TIMESTAMPTZ,
                12,
                'scheduled'
            );
        END IF;
    END LOOP;

    -- Šar Mountains - Every Wednesday and Saturday for 6 weeks
    FOR i IN 0..5 LOOP
        -- Wednesday
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_sharr,
            (base_date + (i * 7 + 2) * INTERVAL '1 day' + INTERVAL '7 hours')::TIMESTAMPTZ,
            (base_date + (i * 7 + 2) * INTERVAL '1 day' + INTERVAL '15 hours')::TIMESTAMPTZ,
            8,
            'scheduled'
        );
        -- Saturday
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_sharr,
            (base_date + (i * 7 + 5) * INTERVAL '1 day' + INTERVAL '7 hours')::TIMESTAMPTZ,
            (base_date + (i * 7 + 5) * INTERVAL '1 day' + INTERVAL '15 hours')::TIMESTAMPTZ,
            8,
            'scheduled'
        );
    END LOOP;

    -- Albanian Alps Traverse - Monthly departures (5-day tour)
    FOR i IN 0..2 LOOP
        INSERT INTO tour_instances (tour_id, start_datetime, end_datetime, capacity_max, status)
        VALUES (
            tour_albania,
            (base_date + (i * 30 + 10) * INTERVAL '1 day' + INTERVAL '8 hours')::TIMESTAMPTZ,
            (base_date + (i * 30 + 15) * INTERVAL '1 day' + INTERVAL '16 hours')::TIMESTAMPTZ,
            8,
            'scheduled'
        );
    END LOOP;

END $$;

-- =============================================================================
-- CLUBS
-- =============================================================================
-- NOTE: Clubs require an owner_id (user must exist first)
-- To create clubs:
-- 1. Sign up at /auth/signup
-- 2. Go to /clubs and click "Create Club"
-- OR run this after signing up:
--
-- INSERT INTO public.clubs (slug, name, tagline, description, activity_type, location, status, owner_id)
-- VALUES ('my-club', 'My Hiking Club', 'Adventure together', 'Description...', 'hiking', 'Location', 'active', 'YOUR_USER_UUID');

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Created:
-- • 5 tours (easy to hard, various types)
-- • 50+ tour instances over next 2 months
--
-- Next steps:
-- 1. Sign up at /auth/signup
-- 2. Browse tours at /tours
-- 3. Book a tour!
-- 4. Create a club at /clubs/create
-- =============================================================================
