-- ============================================================================
-- Add missing RLS policies for tables that have RLS enabled but no/incomplete policies
--
-- Tables fixed:
--   partners      - had ZERO policies (completely locked)
--   transactions   - had ZERO policies (completely locked)
--   incidents      - had ZERO policies (completely locked)
--   users          - missing admin access
--   tour_instances - missing admin access
--   reviews        - missing admin access, user edit/delete
-- ============================================================================

-- Uses is_site_admin() from migration 008

-- =============================================================================
-- USERS - add admin full access
-- =============================================================================
CREATE POLICY "Admins have full access to users"
    ON users FOR ALL
    USING (is_site_admin());

-- =============================================================================
-- TOUR INSTANCES - add admin full access
-- =============================================================================
CREATE POLICY "Admins have full access to tour_instances"
    ON tour_instances FOR ALL
    USING (is_site_admin());

-- =============================================================================
-- REVIEWS - add admin access + user can update/delete own
-- =============================================================================
CREATE POLICY "Admins have full access to reviews"
    ON reviews FOR ALL
    USING (is_site_admin());

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (customer_id = auth.uid());

-- =============================================================================
-- PARTNERS - was completely locked (RLS enabled, zero policies)
-- =============================================================================

-- Public can see active partners (for referral pages, etc.)
CREATE POLICY "Anyone can view active partners"
    ON partners FOR SELECT
    USING (status = 'active');

-- Admins have full access
CREATE POLICY "Admins have full access to partners"
    ON partners FOR ALL
    USING (is_site_admin());

-- =============================================================================
-- TRANSACTIONS - was completely locked (RLS enabled, zero policies)
-- =============================================================================

-- Users can see transactions linked to their bookings
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (
        booking_id IN (
            SELECT id FROM bookings WHERE customer_id = auth.uid()
        )
    );

-- Admins have full access
CREATE POLICY "Admins have full access to transactions"
    ON transactions FOR ALL
    USING (is_site_admin());

-- =============================================================================
-- INCIDENTS - was completely locked (RLS enabled, zero policies)
-- =============================================================================

-- Admins have full access (incidents are admin/guide only)
CREATE POLICY "Admins have full access to incidents"
    ON incidents FOR ALL
    USING (is_site_admin());

-- Guides can view and create incidents for their tour instances
-- (guides are assigned to tour_instances, which links to incidents)
CREATE POLICY "Guides can view incidents"
    ON incidents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'guide'
        )
    );

CREATE POLICY "Guides can create incidents"
    ON incidents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'guide'
        )
    );
