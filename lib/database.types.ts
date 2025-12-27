export interface BlogPost {
    id: string;
    created_at: string;
    updated_at: string;
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    author_id?: string;
    is_published: boolean;
    is_featured: boolean;
    published_at?: string;
    tags?: string[];
    seo_title?: string;
    seo_description?: string;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    plan_id: string | null;
                    is_seller: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    plan_id?: string | null;
                    is_seller?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    plan_id?: string | null;
                    is_seller?: boolean;
                    created_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    description: string | null;
                    image_url: string | null;
                    listing_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description?: string | null;
                    image_url?: string | null;
                    listing_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string | null;
                    image_url?: string | null;
                    listing_count?: number;
                    created_at?: string;
                };
            };
            listings: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    price: number;
                    image_url: string | null;
                    category_id: string | null;
                    tech_stack: string[];
                    likes_count: number;
                    views_count: number;
                    creator_id: string | null;
                    is_live: boolean;
                    is_featured: boolean;
                    preview_url: string | null;
                    created_at: string;
                    updated_at: string;
                    // License fields
                    license_standard_enabled: boolean;
                    license_standard_price: number | null;
                    license_standard_max: number;
                    license_standard_sold: number;
                    license_extended_enabled: boolean;
                    license_extended_price: number | null;
                    license_extended_max: number;
                    license_extended_sold: number;
                    license_buyout_enabled: boolean;
                    license_buyout_price: number | null;
                    license_buyout_sold: boolean;
                    license_buyout_requires_approval: boolean;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    price?: number;
                    image_url?: string | null;
                    category_id?: string | null;
                    tech_stack?: string[];
                    likes_count?: number;
                    views_count?: number;
                    creator_id?: string | null;
                    is_live?: boolean;
                    is_featured?: boolean;
                    preview_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    // License fields
                    license_standard_enabled?: boolean;
                    license_standard_price?: number | null;
                    license_standard_max?: number;
                    license_standard_sold?: number;
                    license_extended_enabled?: boolean;
                    license_extended_price?: number | null;
                    license_extended_max?: number;
                    license_extended_sold?: number;
                    license_buyout_enabled?: boolean;
                    license_buyout_price?: number | null;
                    license_buyout_sold?: boolean;
                    license_buyout_requires_approval?: boolean;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    price?: number;
                    image_url?: string | null;
                    category_id?: string | null;
                    tech_stack?: string[];
                    likes_count?: number;
                    views_count?: number;
                    creator_id?: string | null;
                    is_live?: boolean;
                    is_featured?: boolean;
                    preview_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    // License fields
                    license_standard_enabled?: boolean;
                    license_standard_price?: number | null;
                    license_standard_max?: number;
                    license_standard_sold?: number;
                    license_extended_enabled?: boolean;
                    license_extended_price?: number | null;
                    license_extended_max?: number;
                    license_extended_sold?: number;
                    license_buyout_enabled?: boolean;
                    license_buyout_price?: number | null;
                    license_buyout_sold?: boolean;
                    license_buyout_requires_approval?: boolean;
                };
            };
            saved_items: {
                Row: {
                    id: string;
                    user_id: string;
                    listing_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    listing_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    listing_id?: string;
                    created_at?: string;
                };
            };
            submissions: {
                Row: {
                    id: string;
                    user_id: string | null;
                    project_name: string;
                    live_url: string | null;
                    category: string | null;
                    description: string | null;
                    price: number | null;
                    tech_stack: string | null;
                    thumbnail_url: string | null;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    project_name: string;
                    live_url?: string | null;
                    category?: string | null;
                    description?: string | null;
                    price?: number | null;
                    tech_stack?: string | null;
                    thumbnail_url?: string | null;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    project_name?: string;
                    live_url?: string | null;
                    category?: string | null;
                    description?: string | null;
                    price?: number | null;
                    tech_stack?: string | null;
                    thumbnail_url?: string | null;
                    status?: string;
                    created_at?: string;
                };
            };
            plans: {
                Row: {
                    id: string;
                    name: string;
                    price: number;
                    billing_period: string | null;
                    features: Json;
                    is_featured: boolean;
                    badge_text: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    price?: number;
                    billing_period?: string | null;
                    features?: Json;
                    is_featured?: boolean;
                    badge_text?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    price?: number;
                    billing_period?: string | null;
                    features?: Json;
                    is_featured?: boolean;
                    badge_text?: string | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type SavedItem = Database['public']['Tables']['saved_items']['Row'];
export type Submission = Database['public']['Tables']['submissions']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
