
BEGIN;

-- 1. Create staff profiles
CREATE TABLE public.staff_profiles (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    role TEXT NOT NULL
        CHECK (
            role IN (
                'administrator',
                'admissions_officer'
            )
        ),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.staff_profiles
    ENABLE ROW LEVEL SECURITY;

-- 3. Remove all existing table permissions
REVOKE ALL PRIVILEGES
ON TABLE public.staff_profiles
FROM PUBLIC, anon, authenticated, service_role;

-- 4. Allow server-side service role to read staff profiles
GRANT SELECT
ON TABLE public.staff_profiles
TO service_role;

COMMIT;
