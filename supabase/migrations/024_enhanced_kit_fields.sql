-- =============================================
-- 024: Enhanced MVP Kit Submission Fields
-- Adds comprehensive fields for professional kit listings
-- =============================================

-- Add new columns to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS setup_time TEXT; -- '5-10 mins', '15-30 mins', '1-2 hours'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS architecture_notes TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'one-time'; -- 'one-time', 'subscription'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS lifetime_access BOOLEAN DEFAULT true;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS what_buyer_gets JSONB; -- ["Source code", "Deployment access", "Download"]
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deliverables JSONB; -- ["Pre-configured Auth & DB", "One-click deployment", etc.]
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS perfect_for JSONB; -- ["SaaS MVP launches", "Internal tools", etc.]
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS not_for JSONB; -- ["Complete beginners", "No-code users", etc.]
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS screenshot_urls JSONB; -- Array of screenshot URLs

-- Add same columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS setup_time TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS architecture_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'one-time';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lifetime_access BOOLEAN DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS what_buyer_gets JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deliverables JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS perfect_for JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS not_for JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS screenshot_urls JSONB;

-- Add comments for documentation
COMMENT ON COLUMN submissions.tagline IS 'Short one-liner tagline for the kit';
COMMENT ON COLUMN submissions.setup_time IS 'Estimated setup time: 5-10 mins, 15-30 mins, or 1-2 hours';
COMMENT ON COLUMN submissions.deliverables IS 'Array of deliverable features: ["Pre-configured Auth & DB", "One-click deployment", "Commercial use allowed", "No lock-in"]';
COMMENT ON COLUMN submissions.perfect_for IS 'Array of use cases: ["SaaS MVP launches", "Internal tools", "Freelance deliverables", "Learning modern stacks"]';
COMMENT ON COLUMN submissions.not_for IS 'Array of who this is NOT for: ["Complete beginners", "No-code users", "Users needing finished product"]';
COMMENT ON COLUMN submissions.what_buyer_gets IS 'Array of what buyer receives: ["Source code", "Deployment access", "Download / repo access"]';

-- Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('submissions', 'listings')
AND column_name IN ('tagline', 'setup_time', 'deliverables', 'perfect_for', 'not_for', 'screenshot_urls')
ORDER BY table_name, column_name;
