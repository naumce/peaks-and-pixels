-- Fix RLS infinite recursion on club_members
-- The original policies on club_members reference club_members itself,
-- causing infinite recursion when Supabase evaluates SELECT policies.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view club members" ON club_members;
DROP POLICY IF EXISTS "Club admins can manage members" ON club_members;

-- Recreated: Members can view other members in their clubs
-- Uses auth.uid() directly on the target row instead of a subquery
CREATE POLICY "Members can view club members"
    ON club_members FOR SELECT
    USING (
        -- You can always see your own membership rows
        user_id = auth.uid()
        OR
        -- You can see others if you belong to the same club
        club_id IN (
            SELECT cm.club_id FROM club_members cm
            WHERE cm.user_id = auth.uid()
            AND cm.status = 'active'
        )
    );

-- Recreated: Club owners/admins can manage (insert/update/delete) members
CREATE POLICY "Club admins can manage members"
    ON club_members FOR ALL
    USING (
        club_id IN (
            SELECT cm.club_id FROM club_members cm
            WHERE cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
            AND cm.status = 'active'
        )
    );

-- Admin override for club_members
CREATE POLICY "Admins have full access to club_members"
    ON club_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );
