
-- ============================================================
-- INFANT JESUS ACADEMY
-- ADMISSIONS DATABASE MIGRATION
-- SECURITY REVIEWED DRAFT
--
-- IMPORTANT:
-- Do not execute until explicitly approved.
-- ============================================================

CREATE TABLE public.admissions_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  application_reference text NOT NULL UNIQUE
    CHECK (
      application_reference ~ '^IJA-[0-9]{4}-[A-F0-9]{12}$'
    ),

  applicant_name text NOT NULL
    CHECK (
      char_length(trim(applicant_name)) BETWEEN 1 AND 150
    ),

  gender text NOT NULL
    CHECK (
      gender IN ('Female', 'Male', 'Other')
    ),

  date_of_birth date NOT NULL,

  nationality text NOT NULL
    CHECK (
      char_length(trim(nationality)) BETWEEN 1 AND 100
    ),

  state_of_origin text NOT NULL
    CHECK (
      char_length(trim(state_of_origin)) BETWEEN 1 AND 100
    ),

  current_address text NOT NULL
    CHECK (
      char_length(trim(current_address)) BETWEEN 1 AND 1000
    ),

  parent_name text NOT NULL
    CHECK (
      char_length(trim(parent_name)) BETWEEN 1 AND 150
    ),

  parent_phone text NOT NULL
    CHECK (
      char_length(parent_phone) BETWEEN 7 AND 20
      AND parent_phone ~ '^[+()0-9 -]+$'
    ),

  programme text NOT NULL
    CHECK (
      programme IN (
        'Nursery Education',
        'Primary Education',
        'Secondary Education'
      )
    ),

  previous_school text
    CHECK (
      previous_school IS NULL
      OR char_length(previous_school) <= 200
    ),

  reason_for_leaving text
    CHECK (
      reason_for_leaving IS NULL
      OR char_length(reason_for_leaving) <= 2000
    ),

  -- Private Supabase Storage object paths, never public URLs.
  passport_photo_path text NOT NULL,
  nin_document_path text NOT NULL,
  birth_certificate_path text NOT NULL,

  review_confirmed boolean NOT NULL
    CHECK (review_confirmed = true),

  privacy_notice_version text NOT NULL
    CHECK (privacy_notice_version = '2026-10-30'),

  privacy_acknowledged boolean NOT NULL
    CHECK (privacy_acknowledged = true),

  privacy_acknowledged_at timestamptz NOT NULL,

  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'under_review',
        'accepted',
        'rejected'
      )
    ),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- ----------------------------------------------------------
  -- DOCUMENT PATH VALIDATION
  -- ----------------------------------------------------------


  CONSTRAINT passport_path_format CHECK (
    passport_photo_path ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/passport[.](jpg|png)$'
  ),

  CONSTRAINT nin_path_format CHECK (
    nin_document_path ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/nin[.](jpg|png|pdf)$'
  ),

  CONSTRAINT birth_certificate_path_format CHECK (
    birth_certificate_path ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/birth-certificate[.](jpg|png|pdf)$'
  ),


  -- Additional database-level protection:
  -- All document folders must belong to this application.
  CONSTRAINT passport_path_matches_application CHECK (
    lower(split_part(passport_photo_path, '/', 1)) = lower(id::text)
  ),

  CONSTRAINT nin_path_matches_application CHECK (
    lower(split_part(nin_document_path, '/', 1)) = lower(id::text)
  ),

  CONSTRAINT birth_certificate_path_matches_application CHECK (
    lower(split_part(birth_certificate_path, '/', 1)) = lower(id::text)
  )
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.admissions_applications
  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DATABASE PERMISSIONS
-- ============================================================

-- Remove existing table privileges from all relevant roles.
REVOKE ALL ON TABLE public.admissions_applications
  FROM PUBLIC, anon, authenticated, service_role;

-- Only trusted server-side service-role code may insert records.
GRANT INSERT ON TABLE public.admissions_applications
  TO service_role;

-- No anonymous or authenticated applicant policies are created.
-- Staff access must be implemented separately and reviewed.
-- ============================================================
