import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Package,
  Heart,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  Zap,
  DollarSign,
  Eye,
  MousePointerClick,
  MessageSquare,
  Loader2,
  Download,
  ExternalLink,
  ArrowUpRight // Added for Seller Dashboard link
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
import Button from '../components/Button';
import FeaturedCard from '../components/FeaturedCard';
import { useSavedItems } from '../hooks/useSavedItems';
import { useSubmissions } from '../hooks/useSubmissions';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

// Chart data - empty until real activity data is available
const chartData: { name: string; views: number; sales: number }[] = [];

interface PurchasedOrder {
  id: string;
  order_number: string;
  price_amount: number;
  status: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  } | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { hasSellerActivity, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { savedItems, isLoading: savedLoading } = useSavedItems();
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'purchased' | 'mylistings'>('purchased'); // Default to purchased for buyers
  const [purchasedOrders, setPurchasedOrders] = useState<PurchasedOrder[]>([]);
  const [purchasedLoading, setPurchasedLoading] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: '₹0',
    totalViews: '0',
    clickRate: '0%',
    activeListings: '0'
  });

  // Smart redirect: If user has seller activity, send them to seller dashboard
  React.useEffect(() => {
    if (!roleLoading && hasSellerActivity) {
      navigate('/seller', { replace: true });
    }
  }, [hasSellerActivity, roleLoading, navigate]);

  // Fetch purchased orders
  useEffect(() => {
    const fetchPurchasedOrders = async () => {
      if (!user) return;
      setPurchasedLoading(true);

      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            id, order_number, price_amount, status, created_at,
            listing:listings(id, title, image_url, price)
          `)
          .eq('buyer_id', user.id)
          .in('status', ['paid', 'delivered', 'completed'])
          .order('created_at', { ascending: false });

        console.log('[Dashboard] Buyer Orders:', { count: orders?.length, orders, error, userId: user.id });

        if (error) throw error;
        setPurchasedOrders(orders || []);
      } catch (err) {
        console.error('Error fetching purchased orders:', err);
      } finally {
        setPurchasedLoading(false);
      }
    };

    fetchPurchasedOrders();
  }, [user]);

  // Fetch buyer stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setPurchasedLoading(true);
        // Using savedItems loading state from hook, no local setter needed for savedLoading

        // Get purchased orders count
        const { count: purchasedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['paid', 'delivered', 'completed']);

        // Get saved items count
        const { count: savedCount } = await supabase
          .from('saved_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          totalRevenue: String(purchasedCount || 0), // Buyers: Purchased count
          totalViews: String(savedCount || 0),       // Buyers: Saved count
          clickRate: '0%',
          activeListings: '0'
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setPurchasedLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-20 animate-fade-in min-h-screen">

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-textMain mb-2">Dashboard</h1>
          <p className="text-textMuted">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder'}.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Settings size={16} />} onClick={() => navigate('/settings')}>Settings</Button>
          <Button onClick={() => navigate('/submit')}>Submit New Kit</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-accent-primary text-textMain' : 'border-transparent text-textMuted hover:text-textMain'}`}
        >
          Seller Overview
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'purchased' ? 'border-accent-primary text-textMain' : 'border-transparent text-textMuted hover:text-textMain'}`}
        >
          Purchased Kits ({purchasedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'border-accent-primary text-textMain' : 'border-transparent text-textMuted hover:text-textMain'}`}
        >
          Saved / Liked ({savedItems.length})
        </button>
      </div>

      {/* OVERVIEW TAB (Buyer Stats) */}
      {activeTab === 'overview' && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Purchased Kits', value: stats.totalRevenue, icon: Package },
              { label: 'Saved Items', value: stats.totalViews, icon: Heart },
              // { label: 'Active Listings', value: stats.activeListings, icon: Package } // Removed as it's seller data
            ].map((metric, i) => (
              <div key={i} className="p-6 rounded-xl bg-surface border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-textMuted text-sm">{metric.label}</span>
                  <div className="p-2 rounded-lg bg-surfaceHighlight text-accent-primary">
                    <metric.icon size={16} />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-textMain">{metric.value}</span>
                </div>
              </div>
            ))}

            {/* Quick Link to Seller Dashboard */}
            <Link to="/seller" className="p-6 rounded-xl bg-surface border border-border hover:border-accent-primary transition-all group cursor-pointer block">
              <div className="flex items-center justify-between mb-4">
                <span className="text-textMuted text-sm">Selling?</span>
                <div className="p-2 rounded-lg bg-surfaceHighlight text-accent-primary group-hover:bg-accent-primary group-hover:text-black transition-colors">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-textMain">Go to Seller Dashboard</span>
                <ArrowUpRight className="text-textMuted group-hover:text-accent-primary transition-colors" size={20} />
              </div>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-medium text-textMain mb-6">Recent Activity</h3>

              {/* Show Recent Purchases if any, otherwise empty state */}
              {purchasedOrders.length > 0 ? (
                <div className="space-y-4">
                  {purchasedOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-surfaceHighlight/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-surface">
                          {order.listing?.image_url && (
                            <img src={order.listing.image_url} alt={order.listing.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-textMain">{order.listing?.title || order.order_number}</h4>
                          <p className="text-xs text-textMuted">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500 capitalize">
                        {order.status}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('purchased')}
                      className="text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
                    >
                      View all purchases &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-center">
                  <div>
                    <Package size={48} className="mx-auto mb-4 text-textMuted opacity-30" />
                    <p className="text-textMuted">No purchases yet</p>
                    <p className="text-xs text-textMuted/60 mt-1">Kits you buy will appear here</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-medium text-textMain mb-6">Recent Messages</h3>
              <div className="space-y-4">
                {/* Empty State - No hardcoded data */}
                <div className="h-[150px] flex items-center justify-center text-center">
                  <div>
                    <MessageSquare size={36} className="mx-auto mb-3 text-textMuted opacity-30" />
                    <p className="text-textMuted text-sm">No messages yet</p>
                    <p className="text-xs text-textMuted/60 mt-1">Messages from sellers will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
      )
      }

      {/* PURCHASED TAB */}
      {
        activeTab === 'purchased' && (
          <div className="animate-slide-up">
            {purchasedLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
              </div>
            ) : purchasedOrders.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-center py-20 col-span-full">
                <Package size={48} className="text-textMuted mb-4 opacity-50" />
                <h3 className="text-textMain font-bold text-lg mb-2">No purchased kits yet</h3>
                <p className="text-textMuted mb-6 max-w-sm">Start your next project by acquiring a launch-ready foundation.</p>
                <Button onClick={() => navigate('/mvp-kits')}>Browse Catalog</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedOrders.map(order => (
                  order.listing && (
                    <div key={order.id} className="bg-surface border border-border rounded-xl overflow-hidden group">
                      <div className="relative aspect-video">
                        <img
                          src={order.listing.image_url || '/placeholder.jpg'}
                          className="w-full h-full object-cover opacity-80"
                          alt={order.listing.title}
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-accent-primary/90 rounded-full text-xs font-bold text-black">
                          PURCHASED
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-textMain font-bold truncate">{order.listing.title}</h4>
                        <p className="text-xs text-textMuted mt-1">Order #{order.order_number}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-textMuted text-sm">₹{order.price_amount}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<ExternalLink size={14} />}
                              onClick={() => navigate(`/order/${order.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              icon={<Download size={14} />}
                              onClick={() => navigate(`/order/${order.id}`)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )
      }

      {/* SAVED TAB */}
      {
        activeTab === 'saved' && (
          <div className="animate-slide-up">
            {savedLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
              </div>
            ) : savedItems.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-center py-20">
                <Heart size={48} className="text-textMuted mb-4 opacity-50" />
                <h3 className="text-textMain font-bold text-lg mb-2">No saved items yet</h3>
                <p className="text-textMuted mb-6 max-w-sm">Browse the catalog and save items you're interested in.</p>
                <Button onClick={() => navigate('/mvp-kits')}>Browse Catalog</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map(item => (
                  item.listing && (
                    <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden group">
                      <div className="relative aspect-video">
                        <img src={item.listing.image_url || ''} className="w-full h-full object-cover opacity-80" alt="" />
                        <div className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-accent-primary cursor-pointer">
                          <Heart size={16} fill="currentColor" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-textMain font-bold truncate">{item.listing.title}</h4>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-textMuted text-sm">₹{item.listing.price}</span>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/listing/${item.listing?.id}`)}>View Kit</Button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )
      }
      {/* MY LISTINGS TAB */}
      {
        activeTab === 'mylistings' && (
          <div className="animate-slide-up">
            {myListingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-20 border border-border border-dashed rounded-2xl">
                <Package size={48} className="mx-auto text-textMuted mb-4" />
                <p className="text-textMuted mb-4">You haven't created any listings yet.</p>
                <Button onClick={() => navigate('/submit')}>Submit Your First Kit</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map(listing => (
                  <div key={listing.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent-primary/30 transition-colors">
                    <div className="relative aspect-video">
                      <img src={listing.image_url || ''} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${listing.is_live ? 'bg-accent-primary text-black' : 'bg-red-500 text-white'}`}>
                          {listing.is_live ? 'LIVE' : 'DRAFT'}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded bg-surface/90 text-textMain text-xs font-bold">
                          ₹{listing.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-textMain font-bold truncate mb-2">{listing.title}</h4>
                      <p className="text-textMuted text-sm line-clamp-2 mb-4">{listing.description}</p>
                      <div className="flex items-center justify-between text-xs text-textMuted mb-4">
                        <span className="flex items-center gap-1"><Eye size={12} /> {listing.views_count || 0} views</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {listing.likes_count || 0} likes</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/details/${listing.id}`)}>View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

    </div >
  );
};

export default Dashboard;
