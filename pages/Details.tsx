import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, ShieldCheck, MessageCircle, Star, Play, Loader2, Maximize2, Lock, CheckCircle, XCircle, HelpCircle, PackageCheck, FileCode, Zap, Bookmark, Download, Eye, ChevronRight, Images, Code2, Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Listing } from '../lib/database.types';
import Button from '../components/Button';
import PurchaseButton from '../components/PurchaseButton';
import { useToggleSave, useSavedItems } from '../hooks/useSavedItems';

import InquiryModal from '../components/InquiryModal';
import TrustSignals from '../components/TrustSignals';
import { Link } from 'react-router-dom';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toggleSave, isLoading: saveLoading } = useToggleSave();
  const { savedListingIds, refetch } = useSavedItems();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [purchasedOrderId, setPurchasedOrderId] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<'standard' | 'extended' | 'buyout'>('standard');

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*, tagline, setup_time, deliverables, perfect_for, not_for, what_buyer_gets, screenshot_urls, creator:profiles!listings_creator_id_fkey(id, full_name, avatar_url, is_verified_seller, seller_level, rating_average, rating_count, total_sales, completion_rate), category:categories(title)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);

        // Increment view count (fire and forget)
        supabase.from('listings')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)
          .then(() => { });
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Check if user has already purchased this listing
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user || !id) return;

      try {
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('listing_id', id)
          .in('status', ['paid', 'delivered', 'completed'])
          .maybeSingle();

        if (order) {
          setPurchasedOrderId(order.id);
        }
      } catch (err) {
        console.error('Error checking purchase status:', err);
      }
    };

    checkPurchaseStatus();
  }, [user, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated || !listing) {
      navigate('/signin');
      return;
    }
    await toggleSave(listing.id);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-textMuted">Kit not found</p>
        <Button onClick={() => navigate('/mvp-kits')}>Back to Blueprints</Button>
      </div>
    );
  }

  const isSaved = savedListingIds.has(listing.id);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background text-textMain selection:bg-accent-primary/20">
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        sellerId={listing.creator_id}
        sellerName={listing.creator?.full_name || 'Creator'}
      />

      {/* BREADCRUMB - Clean & Simple */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <span onClick={() => navigate('/mvp-kits')} className="hover:text-textMain cursor-pointer transition-colors">Catalog</span>
          <ChevronRight size={14} className="text-border" />
          <span onClick={() => navigate(`/mvp-kits?category=${listing.category?.title}`)} className="hover:text-textMain cursor-pointer transition-colors">{listing.category?.title || 'SaaS'}</span>
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT CONTENT COLUMN (8 Cols) */}
        <div className="lg:col-span-8">

          {/* 1. PRODUCT HEADER - Pure Typography */}
          <div className="mb-8 border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-border text-textSecondary">
                {listing.category?.title || 'Blueprint'}
              </span>
              {listing.views_count > 100 && (
                <span className="text-xs text-textMuted flex items-center gap-1.5">
                  <Eye size={14} /> {listing.views_count} views
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold text-textMain mb-4 tracking-tight leading-tight">
              {listing.title}
            </h1>

            {listing.short_summary && (
              <p className="text-xl text-textSecondary leading-relaxed font-light max-w-3xl">
                {listing.short_summary}
              </p>
            )}

            {/* TECH STACK - Minimal Badges */}
            {listing.tech_stack && listing.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {listing.tech_stack.map(tech => (
                  <span key={tech} className="px-3 py-1.5 rounded border border-border bg-surface text-sm text-textSecondary">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. MEDIA PREVIEW - Flat, Bordered */}
          <div className="space-y-8 mb-12">
            <div className="border border-border bg-black rounded-lg overflow-hidden">
              {/* Simple minimal header */}
              <div className="h-9 bg-surface border-b border-border flex items-center px-3 justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                </div>
              </div>

              <div className="relative aspect-video w-full bg-[#111]">
                {listing.preview_url && isPreviewActive ? (
                  <>
                    {!iframeLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-textMuted" size={24} />
                      </div>
                    )}
                    <iframe
                      src={listing.preview_url}
                      className="w-full h-full border-0"
                      title="Live Preview"
                      onLoad={() => setIframeLoaded(true)}
                      allowFullScreen
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={listing.image_url || 'https://picsum.photos/800/600'}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer" onClick={() => setIsPreviewActive(true)}>
                      <button className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                        <Play size={18} fill="currentColor" /> Live Preview
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SCREENSHOTS GRID - Clean & Tight */}
            {listing.screenshot_urls && listing.screenshot_urls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.screenshot_urls.map((url, idx) => (
                  <div key={idx} className="aspect-[4/3] rounded border border-border bg-surface overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => window.open(url, '_blank')}>
                    <img
                      src={url}
                      alt={`Interface ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* VIDEO LINK - Simple Text Link */}
            {listing.demo_video_url && (
              <div className="flex items-center gap-3 p-4 border border-border rounded bg-surface">
                <div className="p-2 bg-surfaceHighlight rounded text-textMain">
                  <VideoIcon size={20} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-textMain">Walkthrough Video</div>
                  <a href={listing.demo_video_url} target="_blank" rel="noreferrer" className="text-xs text-textSecondary hover:text-textMain underline">
                    Watch full demo on Loom ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 3. DETAILS - Linear Flow */}
          <div className="space-y-12">

            {/* Technical Overview */}
            <section>
              <h3 className="text-xl font-semibold text-textMain mb-4">Technical Overview</h3>
              <div className="prose prose-invert prose-p:text-textSecondary prose-li:text-textSecondary max-w-none text-base leading-7 whitespace-pre-line">
                {listing.description}
              </div>
            </section>

            {/* Features List */}
            {listing.features && (
              <section className="border-t border-border pt-8">
                <h3 className="text-lg font-semibold text-textMain mb-6">Key Capabilities</h3>
                <div className="grid md:grid-cols-1 gap-4">
                  <div className="text-textSecondary whitespace-pre-line leading-relaxed">
                    {listing.features}
                  </div>
                </div>
              </section>
            )}

            {/* Suitability */}
            <section className="border-t border-border pt-8 grid md:grid-cols-2 gap-8">
              {listing.perfect_for && (
                <div>
                  <h4 className="font-medium text-textMain mb-4 text-sm uppercase tracking-wide">Good for</h4>
                  <ul className="space-y-3">
                    {listing.perfect_for.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-textSecondary">
                        <CheckCircle size={16} className="text-textMain mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {listing.not_for && (
                <div>
                  <h4 className="font-medium text-textMain mb-4 text-sm uppercase tracking-wide">Not for</h4>
                  <ul className="space-y-3">
                    {listing.not_for.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-textSecondary">
                        <span className="text-textMuted mt-0.5 shrink-0">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

        </div>

        {/* RIGHT SIDEBAR - Clean, Functional */}
        <div className="lg:col-span-4 pl-0 lg:pl-6 border-l border-border/0 lg:border-border">
          <div className="sticky top-24 space-y-8">

            {/* BUY BOX */}
            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-textMain">
                    {listing.price === 0 ? 'Free' : `₹${listing.license_standard_price || listing.price}`}
                  </span>
                  <span className="text-sm text-textMuted">Standard License</span>
                </div>
                <p className="text-sm text-textSecondary">One-time payment. Lifetime access.</p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  className="w-full h-12 text-base font-medium rounded-md"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/signin', { state: { from: `/checkout/${listing.id}?license=standard` } });
                    } else {
                      navigate(`/checkout/${listing.id}?license=standard`);
                    }
                  }}
                >
                  Acquire Blueprint
                </Button>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Lock size={12} className="text-textMuted" />
                  <span className="text-xs text-textMuted">Secure checkout via Stripe</span>
                </div>
              </div>

              {/* Trust Items & Assets (Inside Buy Box) */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Included Assets</h4>
                <ul className="space-y-3">
                  {listing.what_buyer_gets && listing.what_buyer_gets.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-textMain">
                      <PackageCheck size={16} className="text-textSecondary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}

                  {listing.deliverables && listing.deliverables.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-textMain">
                      <CheckCircle size={16} className="text-textSecondary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}

                  {!listing.what_buyer_gets?.length && !listing.deliverables?.length && (
                    <>
                      <li className="flex items-center gap-3 text-sm text-textMain">
                        <Code2 size={16} className="text-textSecondary" />
                        <span>Full Source Code</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-textMain">
                        <ShieldCheck size={16} className="text-textSecondary" />
                        <span>Manual Code Audit</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* SELLER INFO - Separate Card */}
            <div className="border-t border-border pt-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden">
                  {listing.creator?.avatar_url ? (
                    <img src={listing.creator.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold">{listing.creator?.full_name?.[0]}</div>
                  )}
                </div>
                <div>
                  <Link to={`/seller/${listing.creator_id}`} className="text-sm font-medium text-textMain hover:underline block">
                    {listing.creator?.full_name || 'Anonymous Creator'}
                  </Link>
                  <button onClick={() => setIsInquiryModalOpen(true)} className="text-xs text-textSecondary hover:text-textMain transition-colors">
                    Ask a question
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Details;