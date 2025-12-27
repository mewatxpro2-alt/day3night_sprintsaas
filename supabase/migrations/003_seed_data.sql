-- Seed Categories (matching current UI data)
INSERT INTO categories (title, slug, description, image_url, listing_count) VALUES
  ('SaaS', 'saas', 'Dashboards, landing pages, and admin panels for software products.', 'https://picsum.photos/800/600?random=1', 847),
  ('E-commerce', 'ecommerce', 'Online stores, product showcases, and checkout experiences.', 'https://picsum.photos/800/600?random=3', 623),
  ('Portfolio', 'portfolio', 'Personal sites, creative portfolios, and resume pages.', 'https://picsum.photos/800/600?random=2', 412),
  ('Agency', 'agency', 'Client management, project dashboards, and service websites.', 'https://picsum.photos/800/600?random=7', 298),
  ('Fintech', 'fintech', 'Modern banking interfaces, crypto wallets, and trading dashboards.', 'https://picsum.photos/800/600?random=4', 186),
  ('AI Startup', 'ai-startup', 'Futuristic landing pages for LLMs, agents, and machine learning tools.', 'https://picsum.photos/800/600?random=5', 245),
  ('Health', 'health', 'Medical practice websites, health tracking, and wellness apps.', 'https://picsum.photos/800/600?random=6', 142),
  ('Landing', 'landing', 'High-conversion landing pages and product launches.', 'https://picsum.photos/800/600?random=8', 156);

-- Seed Plans (matching current Pricing page)
INSERT INTO plans (name, price, billing_period, features, is_featured, badge_text) VALUES
  ('Explorer', 0, 'forever', '["Browse full catalog", "View file structures", "Access open-source kits", "Community Discord access"]'::jsonb, FALSE, NULL),
  ('All-Access Pro', 29, 'month', '["Unlimited downloads (50+ Kits)", "Commercial usage license", "Private GitHub Repo access", "Priority creator support", "New kits added monthly"]'::jsonb, TRUE, 'Best Value'),
  ('Agency Partner', 99, 'month', '["5 Team member seats", "White-label client rights", "Dedicated account manager", "Custom feature requests", "SLA & Contract billing"]'::jsonb, FALSE, NULL);

-- Seed Listings (matching MOCK_LISTINGS)
-- First, get category IDs
DO $$
DECLARE
  saas_id UUID;
  fintech_id UUID;
  portfolio_id UUID;
  ecommerce_id UUID;
  landing_id UUID;
  agency_id UUID;
BEGIN
  SELECT id INTO saas_id FROM categories WHERE slug = 'saas';
  SELECT id INTO fintech_id FROM categories WHERE slug = 'fintech';
  SELECT id INTO portfolio_id FROM categories WHERE slug = 'portfolio';
  SELECT id INTO ecommerce_id FROM categories WHERE slug = 'ecommerce';
  SELECT id INTO landing_id FROM categories WHERE slug = 'landing';
  SELECT id INTO agency_id FROM categories WHERE slug = 'agency';

  -- Insert listings
  INSERT INTO listings (title, description, price, image_url, category_id, tech_stack, likes_count, views_count, is_live, is_featured, preview_url) VALUES
    ('Fintech Ledger OS', 'Double-entry accounting system with audit logs. Save 3 months of backend logic work.', 129, 'https://picsum.photos/800/600?random=99', fintech_id, ARRAY['Next.js', 'PostgreSQL', 'Tailwind'], 84, 3200, TRUE, TRUE, 'https://agent-694c2b7befaca990--heartfelt-baklava-cbef9a.netlify.app/'),
    ('Enterprise SaaS Starter', 'The standard for B2B apps. Includes Multi-tenancy, RBAC, and Stripe Billing pre-configured.', 149, 'https://picsum.photos/800/600?random=1', saas_id, ARRAY['Next.js 14', 'Supabase', 'Stripe'], 342, 12500, TRUE, TRUE, 'https://agent-694c2b7befaca990--heartfelt-baklava-cbef9a.netlify.app/'),
    ('Creator Portfolio OS', 'Deploy a high-converting portfolio in minutes. CMS-ready for case studies and digital products.', 69, 'https://picsum.photos/800/600?random=2', portfolio_id, ARRAY['Framer', 'React', 'Notion API'], 89, 4300, TRUE, FALSE, 'https://example.com'),
    ('Marketplace Core', 'Complete multi-vendor logic. User profiles, listings, and payout splits ready to ship.', 249, 'https://picsum.photos/800/600?random=3', ecommerce_id, ARRAY['Node.js', 'Postgres', 'React'], 210, 8900, FALSE, FALSE, NULL),
    ('Web3 Launchpad', 'High-trust crypto landing page. Includes wallet connect and roadmap modules.', 49, 'https://picsum.photos/800/600?random=4', landing_id, ARRAY['React', 'Wagmi', 'Tailwind'], 156, 6700, TRUE, FALSE, NULL),
    ('Client Portal System', 'Replace email threads. A secure dashboard for agencies to manage deliverables and invoices.', 199, 'https://picsum.photos/800/600?random=5', agency_id, ARRAY['Laravel', 'Vue', 'Inertia'], 56, 2100, TRUE, FALSE, NULL),
    ('Docs Platform Pro', 'Beautiful documentation site with full-text search. Keep your users unblocked.', 0, 'https://picsum.photos/800/600?random=6', saas_id, ARRAY['NextRA', 'MDX'], 890, 45000, TRUE, TRUE, NULL);
END $$;
