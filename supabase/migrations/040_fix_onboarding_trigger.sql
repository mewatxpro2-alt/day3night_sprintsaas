-- =====================================================
-- FIX: ENFORCE ONBOARDING DEFAULT
-- =====================================================
-- Ensure new users always start with onboarding_completed = FALSE
-- =====================================================

-- 1. Set column default in database
ALTER TABLE profiles 
ALTER COLUMN onboarding_completed SET DEFAULT FALSE;

-- 2. Update the user creation trigger to explicitly set it false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      is_seller,
      onboarding_completed -- Explicitly include this
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    FALSE,
    FALSE -- Default to false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
