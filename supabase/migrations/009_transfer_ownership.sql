-- =====================================================
-- MIGRATION 009: TRANSFER OWNERSHIP
-- Transfers all listings to khnnabubakar786@gmail.com
-- ensures they are marked as a seller
-- Ensures tadmin@gmail.com remains Admin
-- =====================================================

DO $$
DECLARE
  target_email TEXT := 'khnnabubakar786@gmail.com';
  target_user_id UUID;
  
  admin_email TEXT := 'tadmin@gmail.com';
  admin_user_id UUID;
BEGIN
  -- 1. Get the User ID for the new "Owner of Listings"
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Target user % not found - checking for Admin user instead', target_email;
  ELSE
      -- 2. Update Profile to be a Seller (but keep as 'user' role unless they need admin panels)
      UPDATE profiles 
      SET is_seller = TRUE
      WHERE id = target_user_id;

      -- 3. Transfer ALL listings to this user
      UPDATE listings
      SET creator_id = target_user_id;
      
      RAISE NOTICE 'Transferred all listings to user % (%)', target_email, target_user_id;
  END IF;

  -- 4. Ensure tadmin@gmail.com is still Admin
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
  
  IF admin_user_id IS NOT NULL THEN
      UPDATE profiles
      SET role = 'admin'
      WHERE id = admin_user_id;
      RAISE NOTICE 'Ensured % is set to Admin role', admin_email;
  END IF;

END $$;
