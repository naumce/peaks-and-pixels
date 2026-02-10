-- ============================================================================
-- FIX: RLS infinite recursion on club_members (and all tables that reference it)
--
-- ROOT CAUSE: Policies on club_members query club_members in subqueries,
-- triggering the same SELECT policy → infinite recursion.
-- Policies on clubs, club_posts, club_events also reference club_members,
-- which triggers the club_members SELECT policy → same recursion.
--
-- FIX: Use SECURITY DEFINER functions to check membership.
-- These functions bypass RLS, so the inner query doesn't re-trigger policies.
-- ============================================================================

-- =============================================================================
-- STEP 1: Create SECURITY DEFINER helper functions
-- =============================================================================

-- Returns all club IDs where the current user is an active member
CREATE OR REPLACE FUNCTION get_my_club_ids()
RETURNS SETOF UUID AS $$
    SELECT club_id FROM club_members
    WHERE user_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns all club IDs where the current user is an owner or admin
CREATE OR REPLACE FUNCTION get_my_admin_club_ids()
RETURNS SETOF UUID AS $$
    SELECT club_id FROM club_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks if the current user is a site-wide admin
CREATE OR REPLACE FUNCTION is_site_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =============================================================================
-- STEP 2: Drop ALL existing policies on club-related tables
-- =============================================================================

-- clubs
DROP POLICY IF EXISTS "Public can view active clubs" ON clubs;
DROP POLICY IF EXISTS "Members can view their clubs" ON clubs;
DROP POLICY IF EXISTS "Users can create clubs" ON clubs;
DROP POLICY IF EXISTS "Owners can update their clubs" ON clubs;
DROP POLICY IF EXISTS "Admins have full access to clubs" ON clubs;

-- club_members (including the broken ones from migration 006)
DROP POLICY IF EXISTS "Members can view club members" ON club_members;
DROP POLICY IF EXISTS "Club admins can manage members" ON club_members;
DROP POLICY IF EXISTS "Users can join clubs" ON club_members;
DROP POLICY IF EXISTS "Admins have full access to club_members" ON club_members;

-- club_posts
DROP POLICY IF EXISTS "Public can view public posts" ON club_posts;
DROP POLICY IF EXISTS "Members can view club posts" ON club_posts;
DROP POLICY IF EXISTS "Members can create posts" ON club_posts;
DROP POLICY IF EXISTS "Authors can update their posts" ON club_posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON club_posts;

-- club_events
DROP POLICY IF EXISTS "Public can view public events" ON club_events;
DROP POLICY IF EXISTS "Members can view club events" ON club_events;
DROP POLICY IF EXISTS "Club admins can manage events" ON club_events;

-- club_event_rsvps
DROP POLICY IF EXISTS "Event organizers can view RSVPs" ON club_event_rsvps;


-- =============================================================================
-- STEP 3: Recreate ALL policies using the safe helper functions
-- =============================================================================

-- ---- CLUBS ----

CREATE POLICY "Public can view active clubs"
    ON clubs FOR SELECT
    USING (status = 'active' AND is_public = TRUE);

CREATE POLICY "Members can view their clubs"
    ON clubs FOR SELECT
    USING (id IN (SELECT get_my_club_ids()));

CREATE POLICY "Users can create clubs"
    ON clubs FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their clubs"
    ON clubs FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Admins have full access to clubs"
    ON clubs FOR ALL
    USING (is_site_admin());


-- ---- CLUB MEMBERS ----

-- Anyone can see their own membership rows
CREATE POLICY "Users can view own memberships"
    ON club_members FOR SELECT
    USING (user_id = auth.uid());

-- Members can see other members in clubs they belong to
CREATE POLICY "Members can view club members"
    ON club_members FOR SELECT
    USING (club_id IN (SELECT get_my_club_ids()));

-- Users can request to join clubs
CREATE POLICY "Users can join clubs"
    ON club_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Club admins/owners can manage members
CREATE POLICY "Club admins can manage members"
    ON club_members FOR ALL
    USING (club_id IN (SELECT get_my_admin_club_ids()));

-- Site admins have full access
CREATE POLICY "Admins have full access to club_members"
    ON club_members FOR ALL
    USING (is_site_admin());


-- ---- CLUB POSTS ----

CREATE POLICY "Public can view public posts"
    ON club_posts FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Members can view club posts"
    ON club_posts FOR SELECT
    USING (club_id IN (SELECT get_my_club_ids()));

CREATE POLICY "Members can create posts"
    ON club_posts FOR INSERT
    WITH CHECK (club_id IN (SELECT get_my_club_ids()));

CREATE POLICY "Authors can update their posts"
    ON club_posts FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete posts"
    ON club_posts FOR DELETE
    USING (
        author_id = auth.uid()
        OR club_id IN (SELECT get_my_admin_club_ids())
    );


-- ---- CLUB EVENTS ----

CREATE POLICY "Public can view public events"
    ON club_events FOR SELECT
    USING (
        is_public = TRUE
        AND EXISTS (
            SELECT 1 FROM clubs
            WHERE clubs.id = club_events.club_id
            AND clubs.status = 'active'
        )
    );

CREATE POLICY "Members can view club events"
    ON club_events FOR SELECT
    USING (club_id IN (SELECT get_my_club_ids()));

CREATE POLICY "Club admins can manage events"
    ON club_events FOR ALL
    USING (club_id IN (SELECT get_my_admin_club_ids()));


-- ---- CLUB EVENT RSVPs ----

CREATE POLICY "Event organizers can view RSVPs"
    ON club_event_rsvps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM club_events ce
            WHERE ce.id = club_event_rsvps.event_id
            AND ce.club_id IN (SELECT get_my_admin_club_ids())
        )
    );
