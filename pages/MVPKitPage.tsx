import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2, ChevronLeft, Play, ShoppingCart, Clock, Zap, Users, Code2,
    Shield, Star, CheckCircle2, XCircle, Mail, ExternalLink, Award,
    RefreshCw, MessageCircle, Globe, Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Listing } from '../types';
import Button from '../components/Button';
import InquiryModal from '../components/InquiryModal';

// =====================================================
// MVP KIT PAGE - FIXED ENTERPRISE LAYOUT
// =====================================================

const MVPKitPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchListing = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
            *,
            creator:profiles!listings_creator_id_fkey(
              id, full_name, avatar_url, is_verified_seller, 
              seller_level, rating_average, rating_count, total_sales
            ),
            category:categories(title)
          `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                const mappedListing: Listing = {
                    ...data,
                    image: data.image_url,
                    techStack: data.tech_stack || [],
                    creator: {
                        id: data.creator?.id,
                        name: data.creator?.full_name || 'Creator',
                        avatar: data.creator?.avatar_url,
                        verified: data.creator?.is_verified_seller || false,
                        rating: data.creator?.rating_average || 0,
                        ratingCount: data.creator?.rating_count || 0,
                        totalSales: data.creator?.total_sales || 0,
                    }
                };

                setListing(mappedListing);

                // Increment views
                supabase.from('listings').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-6">
                <h1 className="text-2xl font-bold text-textMain mb-4">Product Not Found</h1>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    // Helpers
    const allImages = [listing.image, ...(listing.screenshot_urls || [])].filter(Boolean) as string[];
    const currencySymbol = listing.currency === 'USD' ? '$' : '₹';
    const formattedPrice = `${currencySymbol}${listing.price?.toLocaleString()}`;
    const videoUrl = listing.demo_video_url || listing.video_url;

    const handlePurchase = () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        navigate(`/checkout/${listing.id}`);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                listingId={listing.id}
                listingTitle={listing.title}
                sellerId={listing.creator.id}
                sellerName={listing.creator.name}
                sellerVerified={listing.creator.verified}
            />

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-textSecondary hover:text-textMain mb-6 transition"
                >
                    <ChevronLeft size={18} />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* ======================================= */}
                {/* SECTION 1: HERO */}
                {/* ======================================= */}
                <section className="mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Category Badge */}
                        <span className="px-3 py-1 text-xs font-mono uppercase bg-accent-primary/10 text-accent-primary rounded-full">
                            {(listing as any).category?.title || listing.category}
                        </span>
                        {/* Stage Badge */}
                        {listing.product_stage && (
                            <span className={`px-3 py-1 text-xs font-mono uppercase rounded-full ${listing.product_stage === 'production' ? 'bg-green-500/10 text-green-500' :
                                    listing.product_stage === 'experimental' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-blue-500/10 text-blue-500'
                                }`}>
                                {listing.product_stage.toUpperCase()}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-textMain mb-4 tracking-tight">
                        {listing.title}
                    </h1>

                    {(listing.tagline || listing.short_summary) && (
                        <p className="text-lg md:text-xl text-textSecondary max-w-3xl leading-relaxed">
                            {listing.tagline || listing.short_summary}
                        </p>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* ======================================= */}
                        {/* SECTION 2: MEDIA */}
                        {/* ======================================= */}
                        {allImages.length > 0 && (
                            <section>
                                {/* Main Image / Video */}
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-surfaceHighlight border border-border shadow-soft">
                                    {isVideoPlaying && videoUrl ? (
                                        <iframe
                                            src={videoUrl.includes('youtube') ?
                                                `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}?autoplay=1` :
                                                videoUrl
                                            }
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="autoplay"
                                        />
                                    ) : (
                                        <>
                                            <img
                                                src={allImages[currentImageIndex]}
                                                alt={listing.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {videoUrl && (
                                                <button
                                                    onClick={() => setIsVideoPlaying(true)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">
                                                        <Play size={28} className="text-slate-900 ml-1" />
                                                    </div>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {allImages.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => { setCurrentImageIndex(index); setIsVideoPlaying(false); }}
                                                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${index === currentImageIndex ? 'border-accent-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ======================================= */}
                        {/* SECTION 3: EXECUTIVE SUMMARY */}
                        {/* ======================================= */}
                        {(listing.executive_summary || listing.description) && (
                            <section>
                                <h2 className="text-xl font-bold text-textMain mb-4 flex items-center gap-2">
                                    <Sparkles size={20} className="text-accent-primary" />
                                    Overview
                                </h2>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-textSecondary leading-relaxed text-lg">
                                        {listing.executive_summary || listing.description}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* ======================================= */}
                        {/* SECTION 4: PROBLEM IT SOLVES */}
                        {/* ======================================= */}
                        {listing.problem_it_solves && (
                            <section className="p-6 rounded-xl bg-surfaceHighlight border border-border">
                                <h3 className="text-base font-bold text-textMain mb-3">The Problem</h3>
                                <p className="text-textSecondary leading-relaxed">
                                    {listing.problem_it_solves}
                                </p>
                            </section>
                        )}

                        {/* ======================================= */}
                        {/* SECTION 5: FEATURES & TECH */}
                        {/* ======================================= */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Features */}
                            {listing.features && (
                                <div>
                                    <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                                        <Zap size={18} className="text-accent-primary" />
                                        Core Features
                                    </h3>
                                    <ul className="space-y-3">
                                        {listing.features.split('\n').filter(f => f.trim()).map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-textSecondary">{feature.replace(/^[•\-]\s*/, '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tech Stack */}
                            {listing.techStack && listing.techStack.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                                        <Code2 size={18} className="text-accent-primary" />
                                        Tech Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.techStack.map((tech, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-sm font-medium bg-surface border border-border rounded-lg text-textMain"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ======================================= */}
                        {/* SECTION 6: PERFECT FOR / NOT FOR */}
                        {/* ======================================= */}
                        {(listing.perfect_for?.length || listing.not_for?.length) && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {listing.perfect_for && listing.perfect_for.length > 0 && (
                                    <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                                        <h3 className="text-base font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={18} />
                                            Perfect For
                                        </h3>
                                        <ul className="space-y-2">
                                            {listing.perfect_for.map((item, i) => (
                                                <li key={i} className="text-sm text-textSecondary flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {listing.not_for && listing.not_for.length > 0 && (
                                    <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                                        <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <XCircle size={18} />
                                            Not For
                                        </h3>
                                        <ul className="space-y-2">
                                            {listing.not_for.map((item, i) => (
                                                <li key={i} className="text-sm text-textSecondary flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* ======================================= */}
                        {/* SIDEBAR: PRICING CARD */}
                        {/* ======================================= */}
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-textMain font-mono">{formattedPrice}</span>
                                    {listing.pricing_type === 'subscription' && (
                                        <span className="text-textSecondary text-sm ml-2">/month</span>
                                    )}
                                    {listing.pricing_type === 'one-time' && (
                                        <span className="text-textMuted text-sm ml-2">one-time</span>
                                    )}
                                </div>

                                {/* License Badge */}
                                {listing.license_type && (
                                    <div className="flex items-center gap-2 mb-6 text-sm">
                                        <Shield size={16} className="text-accent-primary" />
                                        <span className="text-textSecondary capitalize">{listing.license_type} License</span>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <Button className="w-full mb-4 gap-2" onClick={handlePurchase}>
                                    <ShoppingCart size={18} />
                                    Get Access
                                </Button>

                                <button
                                    onClick={() => setIsInquiryModalOpen(true)}
                                    className="w-full py-2.5 text-sm font-medium text-textSecondary hover:text-textMain transition"
                                >
                                    Contact Seller
                                </button>

                                {/* Key Details */}
                                <div className="mt-6 pt-6 border-t border-border space-y-4">
                                    {listing.setup_time && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-textMuted flex items-center gap-2">
                                                <Clock size={14} />
                                                Setup Time
                                            </span>
                                            <span className="text-textMain font-medium">{listing.setup_time}</span>
                                        </div>
                                    )}

                                    {listing.complexity_level && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-textMuted flex items-center gap-2">
                                                <Zap size={14} />
                                                Complexity
                                            </span>
                                            <span className="text-textMain font-medium capitalize">{listing.complexity_level}</span>
                                        </div>
                                    )}

                                    {listing.support_level && listing.support_level !== 'none' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-textMuted flex items-center gap-2">
                                                <MessageCircle size={14} />
                                                Support
                                            </span>
                                            <span className="text-textMain font-medium capitalize">{listing.support_level}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-border space-y-3">
                                    {listing.has_refund_policy && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <RefreshCw size={14} />
                                            <span>14-day refund policy</span>
                                        </div>
                                    )}

                                    {listing.has_maintenance_commitment && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <Shield size={14} />
                                            <span>6-month maintenance</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ======================================= */}
                            {/* SIDEBAR: SELLER CARD */}
                            {/* ======================================= */}
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    {listing.creator.avatar ? (
                                        <img
                                            src={listing.creator.avatar}
                                            alt={listing.creator.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
                                            <span className="text-accent-primary font-bold text-lg">
                                                {(listing.seller_display_name || listing.creator.name)?.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-textMain flex items-center gap-2">
                                            {listing.seller_display_name || listing.creator.name}
                                            {listing.creator.verified && (
                                                <Award size={14} className="text-accent-primary" />
                                            )}
                                        </h4>
                                        {listing.seller_experience_level && (
                                            <p className="text-xs text-textMuted capitalize">
                                                {listing.seller_experience_level} Developer
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {listing.seller_bio && (
                                    <p className="text-sm text-textSecondary mb-4 leading-relaxed">
                                        {listing.seller_bio}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-textMuted">
                                    {listing.seller_prior_projects !== undefined && listing.seller_prior_projects > 0 && (
                                        <span>{listing.seller_prior_projects} projects</span>
                                    )}
                                    {listing.creator.rating > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                            {listing.creator.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                {listing.seller_portfolio_url && (
                                    <a
                                        href={listing.seller_portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 mt-4 text-sm text-accent-primary hover:underline"
                                    >
                                        <ExternalLink size={14} />
                                        View Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MVPKitPage;
