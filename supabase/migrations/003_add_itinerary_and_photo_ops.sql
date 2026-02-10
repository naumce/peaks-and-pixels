-- Add itinerary and photo_opportunities columns to tours table
-- Run this in Supabase SQL Editor

-- Add itinerary (array of objects with time, title, description)
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;

-- Add photo_opportunities boolean flag
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS photo_opportunities BOOLEAN DEFAULT TRUE;

-- Comment for documentation
COMMENT ON COLUMN tours.itinerary IS 'Array of objects with time, title, description for tour schedule';
COMMENT ON COLUMN tours.photo_opportunities IS 'Whether the tour includes dedicated photo opportunities';
