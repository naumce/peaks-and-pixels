-- Clubs Feature Schema
-- Community layer for organizing groups, events, and activities

-- =============================================================================
-- CLUBS
-- =============================================================================
CREATE TABLE public.clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tagline TEXT,
    
    -- Media
    cover_image TEXT,
    logo TEXT,
    
    -- Classification
    activity_type TEXT, -- hiking, cycling, photography, running, etc.
    location TEXT,      -- city/region
    
    -- Owner
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,          -- visible in discovery
    require_approval BOOLEAN DEFAULT FALSE,  -- require approval to join
    
    -- Stats (denormalized for performance)
    member_count INTEGER DEFAULT 1,
    event_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CLUB MEMBERS
-- =============================================================================
CREATE TABLE public.club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'banned')),
    
    -- Tracking
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (club_id, user_id)
);

-- =============================================================================
-- CLUB POSTS (Feed/Wall)
-- =============================================================================
CREATE TABLE public.club_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE, -- show in global/public feed
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Engagement (denormalized)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CLUB EVENTS
-- =============================================================================
CREATE TABLE public.club_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    
    -- Schedule
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    
    -- Location
    location TEXT,
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    meeting_point TEXT,
    
    -- Route integration (optional - links to existing tour/route)
    route_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    
    -- Capacity
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Pricing
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    
    -- Status
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE, -- show to non-members
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CLUB EVENT RSVPs
-- =============================================================================
CREATE TABLE public.club_event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES club_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Response
    status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    
    -- Payment (for paid events)
    paid_at TIMESTAMPTZ,
    payment_reference TEXT,
    amount_paid DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (event_id, user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_clubs_status ON clubs(status);
CREATE INDEX idx_clubs_owner ON clubs(owner_id);
CREATE INDEX idx_clubs_activity_type ON clubs(activity_type);
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_posts_club ON club_posts(club_id);
CREATE INDEX idx_club_posts_public ON club_posts(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_club_events_club ON club_events(club_id);
CREATE INDEX idx_club_events_start ON club_events(start_datetime);
CREATE INDEX idx_club_event_rsvps_event ON club_event_rsvps(event_id);
CREATE INDEX idx_club_event_rsvps_user ON club_event_rsvps(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_event_rsvps ENABLE ROW LEVEL SECURITY;

-- CLUBS policies
CREATE POLICY "Public can view active clubs"
    ON clubs FOR SELECT
    USING (status = 'active' AND is_public = TRUE);

CREATE POLICY "Members can view their clubs"
    ON clubs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = clubs.id
            AND club_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create clubs"
    ON clubs FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their clubs"
    ON clubs FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Admins have full access to clubs"
    ON clubs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- CLUB MEMBERS policies
CREATE POLICY "Members can view club members"
    ON club_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM club_members cm
            WHERE cm.club_id = club_members.club_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Club admins can manage members"
    ON club_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM club_members cm
            WHERE cm.club_id = club_members.club_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can join clubs"
    ON club_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- CLUB POSTS policies
CREATE POLICY "Public can view public posts"
    ON club_posts FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Members can view club posts"
    ON club_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = club_posts.club_id
            AND club_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can create posts"
    ON club_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = club_posts.club_id
            AND club_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Authors can update their posts"
    ON club_posts FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete posts"
    ON club_posts FOR DELETE
    USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = club_posts.club_id
            AND club_members.user_id = auth.uid()
            AND club_members.role IN ('owner', 'admin')
        )
    );

-- CLUB EVENTS policies
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
    USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = club_events.club_id
            AND club_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Club admins can manage events"
    ON club_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = club_events.club_id
            AND club_members.user_id = auth.uid()
            AND club_members.role IN ('owner', 'admin')
        )
    );

-- CLUB EVENT RSVPs policies
CREATE POLICY "Users can view their RSVPs"
    ON club_event_rsvps FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Event organizers can view RSVPs"
    ON club_event_rsvps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM club_events ce
            JOIN club_members cm ON cm.club_id = ce.club_id
            WHERE ce.id = club_event_rsvps.event_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can create their RSVPs"
    ON club_event_rsvps FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their RSVPs"
    ON club_event_rsvps FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their RSVPs"
    ON club_event_rsvps FOR DELETE
    USING (user_id = auth.uid());

-- =============================================================================
-- TRIGGERS for updated_at
-- =============================================================================
CREATE TRIGGER update_clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_posts_updated_at
    BEFORE UPDATE ON club_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_events_updated_at
    BEFORE UPDATE ON club_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_event_rsvps_updated_at
    BEFORE UPDATE ON club_event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
