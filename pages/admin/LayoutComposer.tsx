import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Layout, ChevronLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Listing, LayoutConfig } from '../../types';
import Button from '../../components/Button';

// Admin Listing Selector
const AdminLayoutComposer: React.FC = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
          *,
          creator:profiles!listings_creator_id_fkey(id, full_name, avatar_url, is_verified_seller, seller_level, rating_average, rating_count, total_sales)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = data.map(item => ({
                ...item,
                creator: {
                    id: item.creator.id,
                    name: item.creator.full_name,
                    avatar: item.creator.avatar_url,
                    verified: item.creator.is_verified_seller,
                    rating: item.creator.rating_average || 0,
                    ratingCount: item.creator.rating_count || 0,
                    totalSales: item.creator.total_sales || 0
                }
            })) as Listing[];

            setListings(mapped);
        } catch (err) {
            console.error('Error fetching listings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Layout className="text-accent-primary" /> Layout Composer
                </h1>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-surfaceHighlight border-b border-border text-xs uppercase text-textMuted font-semibold">
                            <tr>
                                <th className="p-4">Listing</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Current Layout</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {listings.map(l => (
                                <tr key={l.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-textMain">{l.title}</div>
                                        <div className="text-xs text-textMuted truncate max-w-xs">{l.id}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {l.isLive ? (
                                            <span className="text-emerald-600 text-xs font-bold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">Live</span>
                                        ) : (
                                            <span className="text-textMuted text-xs px-2 py-0.5 bg-gray-100 rounded">Draft</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-textSecondary text-center">
                                        {l.layout_config?.preset ? (
                                            <span className="capitalize px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
                                                {l.layout_config.preset.replace('-', ' ')}
                                            </span>
                                        ) : 'Default'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button onClick={() => navigate(`/admin/editor/${l.id}`)} size="sm" variant="outline">
                                            Open Visual Editor
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLayoutComposer;
