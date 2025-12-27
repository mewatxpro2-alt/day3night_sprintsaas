// =====================================================
// PHASE 3: MARKETPLACE COMMERCE TYPES
// =====================================================

import type { Listing, Creator, StatMetric, ViewState } from '../types';

// Order Status State Machine
export type OrderStatus =
    | 'created'           // Order created, awaiting payment
    | 'payment_pending'   // Payment initiated
    | 'paid'              // Payment successful, access granted
    | 'delivered'         // Buyer confirmed receipt
    | 'completed'         // Order finished, payout eligible
    | 'refunded'          // Money returned to buyer
    | 'disputed';         // Under dispute review

// Payment Status
export type PaymentStatus =
    | 'pending'
    | 'authorized'
    | 'captured'
    | 'failed'
    | 'refunded';

// Payout Status
export type PayoutStatus =
    | 'pending'
    | 'scheduled'
    | 'processing'
    | 'completed'
    | 'failed';

// Dispute Status
export type DisputeStatus =
    | 'open'
    | 'under_review'
    | 'resolved_refund'
    | 'resolved_no_refund'
    | 'closed';

// Seller Inquiry Status
export type InquiryStatus =
    | 'new'
    | 'read'
    | 'replied'
    | 'archived';

// License Types
export type LicenseType = 'standard' | 'extended' | 'buyout';

// License Configuration (for listings)
export interface LicenseConfig {
    standard: {
        enabled: boolean;
        price: number;
        max: number;
        sold: number;
        remaining: number;
    };
    extended: {
        enabled: boolean;
        price: number | null;
        max: number;
        sold: number;
        remaining: number;
    };
    buyout: {
        enabled: boolean;
        price: number | null;
        sold: boolean;
        available: boolean;
        requiresApproval: boolean;
    };
}

// =====================================================
// PHASE 4A: TRUST & SAFETY TYPES
// =====================================================

// Account Status (user-level access control)
export type AccountStatus =
    | 'active'      // Normal user
    | 'restricted'  // Has some limitations
    | 'suspended'   // Temporarily locked out
    | 'banned';     // Permanently banned

// Moderation Status (listing lifecycle)
export type ModerationStatus =
    | 'submitted'       // Just submitted, awaiting review
    | 'pending_review'  // In review queue
    | 'approved'        // Approved and live
    | 'featured'        // Approved + featured
    | 'hidden'          // Temporarily hidden
    | 'removed';        // Permanently removed

// Restriction Types (granular action limits)
export type RestrictionType =
    | 'no_purchase'  // Cannot buy
    | 'no_sell'      // Cannot list/sell
    | 'no_message'   // Cannot send messages
    | 'no_review'    // Cannot leave reviews
    | 'read_only';   // Can only browse

// Flag Types (reasons for flagging)
export type FlagType =
    | 'spam'
    | 'fraud'
    | 'chargeback'
    | 'fake_listing'
    | 'harassment'
    | 'tos_violation'
    | 'copyright'
    | 'suspicious_activity'
    | 'manual_review';

// Moderation Action Types
export type ModerationActionType =
    // User actions
    | 'flag' | 'unflag'
    | 'restrict' | 'unrestrict'
    | 'suspend' | 'unsuspend'
    | 'ban' | 'unban'
    // Listing actions
    | 'approve' | 'reject'
    | 'hide' | 'unhide'
    | 'remove' | 'restore'
    | 'feature' | 'unfeature'
    // Content actions
    | 'delete' | 'edit';

// Report Types
export type ReportType =
    | 'spam'
    | 'fraud'
    | 'harassment'
    | 'copyright'
    | 'inappropriate'
    | 'fake'
    | 'other';

// Report Status
export type ReportStatus =
    | 'pending'
    | 'reviewing'
    | 'resolved_action_taken'
    | 'resolved_no_action'
    | 'dismissed';

// =====================================================
// PHASE 4A: TRUST & SAFETY INTERFACES
// =====================================================

export interface UserFlag {
    id: string;
    user_id: string;
    flag_type: FlagType;
    reason: string;
    evidence_urls?: string[];
    flagged_by?: string;
    is_system_generated: boolean;
    is_active: boolean;
    resolved_at?: string;
    resolved_by?: string;
    resolution_notes?: string;
    created_at: string;
    updated_at: string;
    // Joined
    user?: Profile;
    flagger?: Profile;
}

export interface UserRestriction {
    id: string;
    user_id: string;
    restriction_type: RestrictionType;
    reason: string;
    starts_at: string;
    expires_at?: string;
    applied_by: string;
    is_active: boolean;
    lifted_at?: string;
    lifted_by?: string;
    lift_reason?: string;
    created_at: string;
    // Joined
    user?: Profile;
    applier?: Profile;
}

export interface ModerationAction {
    id: string;
    admin_id: string;
    target_type: 'user' | 'listing' | 'review' | 'message' | 'order';
    target_id: string;
    action_type: ModerationActionType;
    previous_state?: Record<string, unknown>;
    new_state?: Record<string, unknown>;
    reason?: string;
    notes?: string;
    evidence_urls?: string[];
    is_reversible: boolean;
    reversed_at?: string;
    reversed_by?: string;
    reversal_reason?: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    // Joined
    admin?: Profile;
}

export interface AbuseReport {
    id: string;
    reporter_id?: string;
    reporter_email?: string;
    target_type: 'user' | 'listing' | 'review' | 'message';
    target_id: string;
    report_type: ReportType;
    description: string;
    evidence_urls?: string[];
    status: ReportStatus;
    reviewed_by?: string;
    reviewed_at?: string;
    resolution_notes?: string;
    action_taken?: string;
    created_at: string;
    updated_at: string;
    // Joined
    reporter?: Profile;
    reviewer?: Profile;
}

// =====================================================
// PHASE 4B: REVIEWS & REPUTATION TYPES
// =====================================================

// Seller Trust Levels
export type SellerLevel =
    | 'new'         // < 3 sales
    | 'rising'      // 3-10 sales, rating >= 3.5
    | 'established' // 11-50 sales, rating >= 4.0
    | 'trusted'     // 51-100 sales, rating >= 4.5
    | 'top_seller'; // 100+ sales, rating >= 4.8

export interface Review {
    id: string;
    order_id: string;
    reviewer_id: string;
    seller_id: string;
    listing_id: string;
    rating: number; // 1-5
    title?: string;
    comment?: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    is_visible: boolean;
    is_flagged: boolean;
    flagged_reason?: string;
    moderated_by?: string;
    moderated_at?: string;
    seller_response?: string;
    seller_response_at?: string;
    created_at: string;
    updated_at: string;
    // Joined
    reviewer?: Profile;
    seller?: Profile;
    listing?: {
        id: string;
        title: string;
        image_url?: string;
    };
}

// =====================================================
// ENTITIES
// =====================================================

export interface Order {
    id: string;
    order_number: string;
    buyer_id: string;
    seller_id: string;
    listing_id: string;
    price_amount: number;
    commission_rate: number;
    commission_amount: number;
    seller_amount: number;
    currency: string;
    status: OrderStatus;
    created_at: string;
    paid_at?: string;
    delivered_at?: string;
    completed_at?: string;
    notes?: string;
    // License
    license_type?: LicenseType;
    // Joined fields
    listing?: Listing;
    buyer?: Profile;
    seller?: Profile;
}

export interface Payment {
    id: string;
    order_id: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    method?: string;
    error_code?: string;
    error_description?: string;
    webhook_payload?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface SellerBankAccount {
    id: string;
    seller_id: string;
    account_holder_name: string;
    bank_name: string;
    account_number_last4: string;
    ifsc_code: string;
    upi_id?: string;
    razorpay_fund_account_id?: string;
    razorpay_contact_id?: string;
    is_verified: boolean;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface SellerPayout {
    id: string;
    seller_id: string;
    order_id: string;
    amount: number;
    status: PayoutStatus;
    razorpay_payout_id?: string;
    payout_method?: string;
    scheduled_at?: string;
    processed_at?: string;
    error_message?: string;
    created_at: string;
}

export interface OrderAccess {
    id: string;
    order_id: string;
    source_files_url?: string;
    access_granted_at: string;
    access_expires_at?: string;
    download_count: number;
    max_downloads: number;
    created_at: string;
}

export interface Message {
    id: string;
    order_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    read_at?: string;
    is_flagged: boolean;
    flagged_reason?: string;
    flagged_by?: string;
    created_at: string;
    attachments?: string[];
    // Joined fields
    sender?: Profile;
    receiver?: Profile;
}

export interface Dispute {
    id: string;
    order_id: string;
    raised_by: string;
    reason: string;
    description?: string;
    evidence_urls?: string[];
    status: DisputeStatus;
    resolution?: string;
    resolved_by?: string;
    resolved_at?: string;
    created_at: string;
    // Joined fields
    order?: Order;
    raiser?: Profile;
}

export interface SellerInquiry {
    id: string;
    listing_id: string;
    seller_id: string;
    buyer_id: string;
    subject: string;
    message: string;
    status: InquiryStatus;
    seller_reply?: string;
    replied_at?: string;
    read_at?: string;
    created_at: string;
    updated_at: string;
    // Joined fields
    listing?: Listing;
    seller?: Profile;
    buyer?: Profile;
}


export interface PlatformConfig {
    id: string;
    key: string;
    value: unknown;
    updated_at: string;
    updated_by?: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateOrderRequest {
    listing_id: string;
}

export interface CreateOrderResponse {
    order_id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key_id: string; // Razorpay public key
}

export interface VerifyPaymentRequest {
    order_id: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    order: Order;
    access?: OrderAccess;
}

export interface SellerEarnings {
    total_sales: number;
    total_earnings: number;
    pending_payouts: number;
    completed_payouts: number;
    orders_count: number;
}

// Re-export existing types for convenience
export type { Listing, Creator, StatMetric, ViewState } from '../types';

export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    is_seller: boolean;
    is_verified_seller: boolean;
    created_at: string;
}
