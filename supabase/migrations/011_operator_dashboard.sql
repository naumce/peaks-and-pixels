-- ============================================================================
-- Operator Dashboard: Add operator_id to tours + RLS for guides
-- ============================================================================

-- =============================================================================
-- STEP 1: Add operator_id to tours table
-- =============================================================================

ALTER TABLE public.tours
    ADD COLUMN operator_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX idx_tours_operator_id ON tours(operator_id);


-- =============================================================================
-- STEP 2: SECURITY DEFINER helper functions
-- =============================================================================

-- Check if current user is a guide or admin
CREATE OR REPLACE FUNCTION is_guide()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role IN ('guide', 'admin')
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get tour IDs owned by current user
CREATE OR REPLACE FUNCTION get_my_tour_ids()
RETURNS SETOF UUID AS $$
    SELECT id FROM tours
    WHERE operator_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get tour instance IDs for tours owned by current user
CREATE OR REPLACE FUNCTION get_my_tour_instance_ids()
RETURNS SETOF UUID AS $$
    SELECT ti.id FROM tour_instances ti
    INNER JOIN tours t ON t.id = ti.tour_id
    WHERE t.operator_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =============================================================================
-- STEP 3: RLS policies for operators on TOURS
-- =============================================================================

-- Operators can view their own tours (including drafts)
CREATE POLICY "Operators can view own tours"
    ON tours FOR SELECT
    USING (operator_id = auth.uid() AND is_guide());

-- Operators can create tours (operator_id must be self)
CREATE POLICY "Operators can create own tours"
    ON tours FOR INSERT
    WITH CHECK (operator_id = auth.uid() AND is_guide());

-- Operators can update their own tours
CREATE POLICY "Operators can update own tours"
    ON tours FOR UPDATE
    USING (operator_id = auth.uid() AND is_guide());

-- Operators can delete their own DRAFT tours only
CREATE POLICY "Operators can delete own draft tours"
    ON tours FOR DELETE
    USING (operator_id = auth.uid() AND is_guide() AND status = 'draft');


-- =============================================================================
-- STEP 4: RLS policies for operators on TOUR_INSTANCES
-- =============================================================================

-- Operators can view instances for their tours
CREATE POLICY "Operators can view own tour instances"
    ON tour_instances FOR SELECT
    USING (tour_id IN (SELECT get_my_tour_ids()));

-- Operators can create instances for their tours
CREATE POLICY "Operators can create own tour instances"
    ON tour_instances FOR INSERT
    WITH CHECK (tour_id IN (SELECT get_my_tour_ids()));

-- Operators can update instances for their tours
CREATE POLICY "Operators can update own tour instances"
    ON tour_instances FOR UPDATE
    USING (tour_id IN (SELECT get_my_tour_ids()));

-- Operators can delete instances for their tours
CREATE POLICY "Operators can delete own tour instances"
    ON tour_instances FOR DELETE
    USING (tour_id IN (SELECT get_my_tour_ids()));


-- =============================================================================
-- STEP 5: RLS policies for operators on BOOKINGS (read-only)
-- =============================================================================

-- Operators can view bookings for their tour instances
CREATE POLICY "Operators can view bookings for own instances"
    ON bookings FOR SELECT
    USING (tour_instance_id IN (SELECT get_my_tour_instance_ids()));


-- =============================================================================
-- STEP 6: RLS policies for operators on REVIEWS
-- =============================================================================

-- Operators can view reviews for their tours
CREATE POLICY "Operators can view reviews for own tours"
    ON reviews FOR SELECT
    USING (tour_id IN (SELECT get_my_tour_ids()));


-- =============================================================================
-- STEP 7: RLS policies for operators on TRANSACTIONS (read-only)
-- =============================================================================

-- Operators can view transactions for bookings on their instances
CREATE POLICY "Operators can view transactions for own bookings"
    ON transactions FOR SELECT
    USING (
        booking_id IN (
            SELECT b.id FROM bookings b
            WHERE b.tour_instance_id IN (SELECT get_my_tour_instance_ids())
        )
    );
