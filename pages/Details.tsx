import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Listing } from '../types';
import InquiryModal from '../components/InquiryModal';
import LayoutRenderer from '../components/LayoutRenderer';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<'standard' | 'extended' | 'buyout'>('standard');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchListing = async () => {
      if (!id) return;
      try {
        // Fetch all fields that match our expanded Listing type
        // Note: New seller stats columns (followers_count, projects_completed, etc.) 
        // will be available after running migration 054_seller_interaction_layer.sql
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            creator:profiles!listings_creator_id_fkey(
              id, 
              full_name, 
              avatar_url, 
              is_verified_seller, 
              seller_level, 
              rating_average, 
              rating_count, 
              total_sales
            ),
            category:categories(title)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Map DB response to our Listing type (handling any minor field mismatches if necessary)
        // Note: The select query should return compatible shapes if migration 026 ran correctly.
        // We might need to manually map 'creator' fields if they don't match exactly.
        const mappedListing: Listing = {
          ...data,
          image: data.image_url, // Map back for compatibility
          techStack: data.tech_stack,
          creator: {
            id: data.creator.id,
            name: data.creator.full_name,
            avatar: data.creator.avatar_url,
            verified: data.creator.is_verified_seller,
            rating: data.creator.rating_average || 0,
            // Additional seller stats for SellerCard (defaults until migration runs)
            ratingCount: data.creator.rating_count || 0,
            totalSales: data.creator.total_sales || 0,
            // These will be 0 until migration 054 is run
            followersCount: 0,
            projectsCompleted: data.creator.total_sales || 0, // Use total_sales as proxy
            projectsSubmitted: 0,
            repeatBuyers: 0
          }
        };

        setListing(mappedListing);

        // View count increment (fire and forget)
        supabase.from('listings').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id).then(() => { });

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (!listing) return null;

  const allImages = [listing.image, ...(listing.screenshot_urls || [])].filter(Boolean) as string[];

  const handleNextImage = () => {
    setIsVideoPlaying(false);
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };
  const handlePrevImage = () => {
    setIsVideoPlaying(false);
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };

  // License Pricing Logic
  return (
    <div className="min-h-screen bg-[#F8F9FB] pt-24 pb-20">
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        sellerId={listing.creator.id}
        sellerName={listing.creator.name || 'Creator'}
        sellerVerified={listing.creator.verified}
      />

      {/* Floating Container */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-6">
        <LayoutRenderer
          listing={listing}
          onContactClick={() => setIsInquiryModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default Details;