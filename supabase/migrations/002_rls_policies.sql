-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view any profile (for creator info display)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CATEGORIES POLICIES
-- Categories are public readable
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- LISTINGS POLICIES
-- Listings are public readable
CREATE POLICY "Listings are viewable by everyone"
  ON listings FOR SELECT
  USING (true);

-- Creators can insert their own listings
CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own listings
CREATE POLICY "Creators can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own listings
CREATE POLICY "Creators can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = creator_id);

-- SAVED_ITEMS POLICIES
-- Users can only view their own saved items
CREATE POLICY "Users can view own saved items"
  ON saved_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own saved items
CREATE POLICY "Users can save items"
  ON saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved items
CREATE POLICY "Users can unsave items"
  ON saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- SUBMISSIONS POLICIES
-- Users can only view their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Authenticated users can submit"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- PLANS POLICIES
-- Plans are public readable
CREATE POLICY "Plans are viewable by everyone"
  ON plans FOR SELECT
  USING (true);
