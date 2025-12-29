
export interface Creator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  // Additional seller stats
  ratingCount?: number;
  totalSales?: number;
  followersCount?: number;
  projectsCompleted?: number;
  projectsSubmitted?: number;
  repeatBuyers?: number;
}

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  image_url?: string; // DB alias
  category: 'SaaS' | 'Agency' | 'Portfolio' | 'E-commerce' | 'Landing' | 'Fintech' | 'AI Startup' | 'Health' | 'Boilerplate' | 'API' | 'Tool' | 'Template';
  techStack: string[];
  likes: number;
  views: number;
  creator: Creator;
  isLive: boolean;
  featured?: boolean;
  previewUrl?: string;
  preview_url?: string; // DB column alias
  video_url?: string;
  demo_video_url?: string;
  screenshot_urls?: string[];
  tagline?: string;
  short_summary?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;

  // Detailed Content
  setup_time?: string;
  features?: string;
  deliverables?: string[];
  perfect_for?: string[];
  not_for?: string[];
  what_buyer_gets?: string[];
  architecture_notes?: string;

  // NEW: Pricing & Commercial Terms
  currency?: 'INR' | 'USD';
  pricing_type?: 'one-time' | 'subscription';
  product_stage?: 'mvp' | 'production' | 'experimental';
  license_type?: 'personal' | 'commercial' | 'unlimited';

  // NEW: Structured Description
  executive_summary?: string;
  problem_it_solves?: string;
  complexity_level?: 'beginner' | 'intermediate' | 'advanced';

  // NEW: Seller Credibility
  seller_display_name?: string;
  seller_bio?: string;
  seller_experience_level?: 'beginner' | 'intermediate' | 'expert';
  seller_prior_projects?: number;
  seller_portfolio_url?: string;

  // NEW: Trust Signals
  support_level?: 'none' | 'email' | 'discord' | 'dedicated';
  has_refund_policy?: boolean;
  has_maintenance_commitment?: boolean;

  // License Configuration (existing)
  license_standard_enabled?: boolean;
  license_standard_price?: number;
  license_standard_max?: number;
  license_standard_sold?: number;
  license_extended_enabled?: boolean;
  license_extended_price?: number;
  license_extended_max?: number;
  license_extended_sold?: number;
  license_buyout_enabled?: boolean;
  license_buyout_price?: number;
  license_buyout_sold?: boolean;
  license_buyout_requires_approval?: boolean;

  // Layout Config (existing)
  layout_config?: LayoutConfig;
};

// MVP Layout Composer Types
export type LayoutPreset = 'visual-first' | 'trust-first' | 'technical-first' | 'marketplace-classic' | 'minimal' | 'balanced';

export type SectionArea = 'main' | 'sidebar';

export type LegacySectionId =
  | 'hero'
  | 'media'
  | 'stats'
  | 'description'
  | 'features'
  | 'tech_stack'
  | 'target_audience'
  | 'pricing'
  | 'seller_card'
  | 'trust_badge'
  | 'faq';

export type SectionType = LegacySectionId | 'text_block' | 'media_block' | 'video_block';

// Alias for backward compatibility if needed, but prefer SectionType
export type SectionId = SectionType;

export interface SectionConfig {
  id: string; // UUID or Legacy ID
  type?: SectionType; // Component type. If missing, inferred from id (legacy)
  dataKey?: string; // Path to data (e.g. 'title', 'images.0')
  visible: boolean;
  order: number;
  area: SectionArea;
  collapsed?: boolean;
  highlighted?: boolean;
  settings?: Record<string, any>; // Flexible settings for visual customization
}

export interface LayoutConfig {
  preset: LayoutPreset;
  sections: SectionConfig[];
}

export interface StatMetric {
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export enum ViewState {
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  CATEGORIES = 'CATEGORIES',
  DETAILS = 'DETAILS',
  DASHBOARD = 'DASHBOARD',
  SUBMIT = 'SUBMIT',
  PRICING = 'PRICING',
  SIGN_IN = 'SIGN_IN',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  CONTACT = 'CONTACT'
}

export interface EmailAudienceRecord {
  id: string;
  email: string;
  source: 'newsletter' | 'contact' | 'buyer_signup' | 'seller_signup' | 'manual' | 'other';
  user_type: 'guest' | 'buyer' | 'seller' | 'admin';
  status: 'subscribed' | 'unsubscribed' | 'blocked';
  consent_flag: boolean;
  linked_user_id?: string;
  created_at: string;
  last_seen_at: string;
  metadata?: Record<string, any>;
}

export interface EmailAudienceStats {
  total_emails: number;
  subscribed_count: number;
  unsubscribed_count: number;
  newsletter_count: number;
  registered_count: number;
  guest_count: number;
  buyer_count: number;
  seller_count: number;
  linked_count: number;
}

// =====================================================
// CUSTOMER SUPPORT CHAT TYPES
// =====================================================

export type ConversationStatus = 'open' | 'resolved';
export type SenderType = 'user' | 'admin' | 'system';

export interface SupportConversation {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  feedback_requested_at: string | null;
  feedback_submitted_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  unread_count?: number;
  last_message_preview?: string;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface SupportChatState {
  conversation: SupportConversation | null;
  messages: SupportMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface SupportFeedback {
  id: string;
  conversation_id: string;
  rating: number; // 1-5
  category: string;
  comment: string | null;
  created_at: string;
}