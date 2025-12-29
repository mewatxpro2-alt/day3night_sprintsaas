-- =====================================================
-- MIGRATION 039: BACKFILL ONBOARDING STATUS
-- =====================================================
-- Mark all existing users as having completed onboarding
-- so they aren't forced into the new flow.
-- =====================================================

UPDATE profiles
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = NOW(),
  primary_intent = 'unsure' -- Default for legacy users
WHERE onboarding_completed IS FALSE OR onboarding_completed IS NULL;
