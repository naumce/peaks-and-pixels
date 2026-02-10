-- Change activity_type from single TEXT to TEXT[] array
-- so clubs can have multiple activity types

ALTER TABLE clubs
    ADD COLUMN activity_types TEXT[] DEFAULT '{}';

-- Migrate existing data
UPDATE clubs
    SET activity_types = ARRAY[activity_type]
    WHERE activity_type IS NOT NULL AND activity_type != '';

-- Drop old column
ALTER TABLE clubs
    DROP COLUMN activity_type;
