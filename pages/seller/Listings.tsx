import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import ListingCard from '../../components/ListingCard';

const SellerListings: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('creator_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setListings(data || []);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, [user]);

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto pb-20 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-accent-primary">
                        <Link to="/seller" className="hover:underline">Seller Dashboard</Link>
                        <span>/</span>
                        <span>My Listings</span>
                    </div>
                    <h1 className="text-4xl font-display font-bold text-textMain mb-2">My Listings</h1>
                    <p className="text-textMuted">Manage your kits and track their performance</p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/submit')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Submit New Kit
                    </button>
                </div>
            </div>

            {/* Navigation Tabs (Seller Context) */}
            <div className="flex border-b border-border mb-8 overflow-x-auto">
                <Link
                    to="/seller"
                    className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-textMuted hover:text-textMain transition-colors"
                >
                    Overview
                </Link>
                <Link
                    to="/seller/orders"
                    className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-textMuted hover:text-textMain transition-colors"
                >
                    Orders
                </Link>
                <Link
                    to="/seller/listings"
                    className="px-6 py-3 text-sm font-medium border-b-2 border-accent-primary text-textMain transition-colors"
                >
                    My Listings ({listings.length})
                </Link>
                <Link
                    to="/seller/payouts"
                    className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-textMuted hover:text-textMain transition-colors"
                >
                    Payouts
                </Link>
                <Link
                    to="/seller/bank"
                    className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-textMuted hover:text-textMain transition-colors"
                >
                    Settings
                </Link>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="h-[400px] flex items-center justify-center text-center border border-dashed border-border rounded-xl">
                    <div>
                        <Package size={48} className="mx-auto mb-4 text-textMuted opacity-30" />
                        <p className="text-textMuted mb-4">You haven't submitted any kits yet</p>
                        <button
                            onClick={() => navigate('/submit')}
                            className="text-accent-primary hover:underline"
                        >
                            Submit your first kit &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerListings;
