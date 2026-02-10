-- Add route data and cover image columns to tours table
-- Run this in Supabase SQL Editor

-- Add route fields
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS route_data JSONB,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add waypoints table for detailed route information
CREATE TABLE IF NOT EXISTS public.tour_waypoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    
    -- Location
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    elevation INTEGER,
    
    -- Details
    title TEXT,
    description TEXT,
    type TEXT DEFAULT 'waypoint' CHECK (type IN ('waypoint', 'photo', 'viewpoint', 'rest', 'danger')),
    
    -- Media
    images TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_tour_waypoints_tour_id ON tour_waypoints(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_waypoints_order ON tour_waypoints(tour_id, order_index);

-- Add trigger for updated_at
CREATE TRIGGER update_tour_waypoints_updated_at BEFORE UPDATE ON tour_waypoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for waypoints
ALTER TABLE tour_waypoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view waypoints" ON tour_waypoints
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM tours WHERE id = tour_waypoints.tour_id AND status = 'active')
    );

CREATE POLICY "Admins have full access to waypoints" ON tour_waypoints
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
