-- FIX: Set your user as admin (CHOOSE ONE METHOD)

-- METHOD 1: If you know your email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'fushamn@gmail.com';  -- Replace with YOUR email

-- METHOD 2: Set yourself as admin using auth.uid()
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- METHOD 3: Temporarily disable RLS to see data (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE email_audience DISABLE ROW LEVEL SECURITY;

-- After running one of the above, verify:
SELECT id, email, role FROM profiles WHERE role = 'admin';
