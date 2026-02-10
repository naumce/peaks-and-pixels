-- Notifications table for user alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('booking', 'club', 'event', 'social', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Only system/triggers can insert (via service role) or user can insert for themselves
CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on booking confirmation
CREATE OR REPLACE FUNCTION notify_booking_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_status = 'confirmed' AND (OLD.booking_status IS NULL OR OLD.booking_status != 'confirmed') THEN
        PERFORM create_notification(
            NEW.customer_id,
            'booking',
            'Booking Confirmed',
            'Your booking has been confirmed. Reference: ' || NEW.reference,
            '/account/bookings/' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to bookings table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        DROP TRIGGER IF EXISTS trigger_booking_confirmation ON bookings;
        CREATE TRIGGER trigger_booking_confirmation
            AFTER INSERT OR UPDATE ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION notify_booking_confirmation();
    END IF;
END $$;

-- Trigger to notify on club join request approval
CREATE OR REPLACE FUNCTION notify_club_join_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_club_name TEXT;
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        SELECT name INTO v_club_name FROM clubs WHERE id = NEW.club_id;
        
        PERFORM create_notification(
            NEW.user_id,
            'club',
            'Welcome to the Club!',
            'Your request to join "' || v_club_name || '" has been approved.',
            '/clubs/' || (SELECT slug FROM clubs WHERE id = NEW.club_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to club_members table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'club_members') THEN
        DROP TRIGGER IF EXISTS trigger_club_join_approval ON club_members;
        CREATE TRIGGER trigger_club_join_approval
            AFTER INSERT OR UPDATE ON club_members
            FOR EACH ROW
            EXECUTE FUNCTION notify_club_join_approval();
    END IF;
END $$;
