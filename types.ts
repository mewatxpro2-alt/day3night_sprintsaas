
export interface Creator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: 'SaaS' | 'Agency' | 'Portfolio' | 'E-commerce' | 'Landing' | 'Fintech' | 'AI Startup' | 'Health';
  techStack: string[];
  likes: number;
  views: number;
  creator: Creator;
  isLive: boolean;
  featured?: boolean;
  previewUrl?: string;
  screenshot_urls?: string[];
  tagline?: string;
  short_summary?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
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