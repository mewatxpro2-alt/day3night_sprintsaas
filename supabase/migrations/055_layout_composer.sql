-- Migration: 055_layout_composer.sql
-- Purpose: Add layout_config JSONB column to listings table to store personalized layout configurations.

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
  "preset": "balanced",
  "sections": [
    { "id": "hero", "visible": true, "order": 0, "area": "main" },
    { "id": "media", "visible": true, "order": 1, "area": "main" },
    { "id": "stats", "visible": true, "order": 2, "area": "main" },
    { "id": "description", "visible": true, "order": 3, "area": "main" },
    { "id": "features", "visible": true, "order": 4, "area": "main" },
    { "id": "tech_stack", "visible": true, "order": 5, "area": "main" },
    { "id": "target_audience", "visible": true, "order": 6, "area": "main" },
    { "id": "pricing", "visible": true, "order": 0, "area": "sidebar" },
    { "id": "seller_card", "visible": true, "order": 1, "area": "sidebar" },
    { "id": "trust_badge", "visible": true, "order": 2, "area": "sidebar" }
  ]
}'::jsonb;

-- Comment on column
COMMENT ON COLUMN listings.layout_config IS 'Stores the personalized layout configuration for the listing MVP page.';
