-- ============================================================================
-- Tour Operator Applications
-- Allows customers to apply to become tour operators (guides)
-- ============================================================================

CREATE TABLE public.operator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Application fields
    business_name TEXT NOT NULL,
    experience_description TEXT NOT NULL,
    offerings_description TEXT NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',

    -- Review workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operator_applications_user_id ON operator_applications(user_id);
CREATE INDEX idx_operator_applications_status ON operator_applications(status);
CREATE INDEX idx_operator_applications_created_at ON operator_applications(created_at DESC);

-- RLS
ALTER TABLE operator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
    ON operator_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
    ON operator_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to operator_applications"
    ON operator_applications FOR ALL
    USING (is_site_admin());

-- Updated_at trigger
CREATE TRIGGER update_operator_applications_updated_at
    BEFORE UPDATE ON operator_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification trigger on approval/rejection
CREATE OR REPLACE FUNCTION notify_operator_application_decision()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        PERFORM create_notification(
            NEW.user_id,
            'system',
            'Application Approved!',
            'Your tour operator application has been approved. You can now create and manage tours.',
            '/account'
        );
    ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        PERFORM create_notification(
            NEW.user_id,
            'system',
            'Application Update',
            'Your tour operator application was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided') || '. You may reapply.',
            '/account/become-operator'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_operator_application_decision
    AFTER UPDATE ON operator_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_operator_application_decision();
