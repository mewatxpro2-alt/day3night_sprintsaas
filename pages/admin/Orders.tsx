import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, DollarSign, Calendar, User, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types/marketplace';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 15;

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('orders')
                .select(`
          *,
          listing:listings(id, title, image_url),
          buyer:profiles!orders_buyer_id_fkey(id, full_name, email),
          seller:profiles!orders_seller_id_fkey(id, full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            console.error('[AdminOrders] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders(); // Refresh orders
        } catch (err) {
            console.error('Error updating order status:', err);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            order.order_number?.toLowerCase().includes(search) ||
            order.listing?.title?.toLowerCase().includes(search) ||
            order.buyer?.full_name?.toLowerCase().includes(search) ||
            order.seller?.full_name?.toLowerCase().includes(search)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            created: 'bg-surfaceHighlight text-textMuted',
            payment_pending: 'bg-accent-secondary/10 text-accent-secondary-fg',
            paid: 'bg-accent-tertiary/10 text-accent-tertiary',
            delivered: 'bg-accent-primary/10 text-accent-primary',
            completed: 'bg-accent-primary/20 text-accent-primary',
            refunded: 'bg-red-500/10 text-red-500',
            disputed: 'bg-orange-500/10 text-orange-500',
        };
        return styles[status] || 'bg-surfaceHighlight text-textMuted';
    };

    // Stats
    const totalRevenue = orders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.price_amount), 0);
    const totalCommission = orders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.commission_amount), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">All Orders</h1>
                    <p className="text-textMuted">Manage transactions and resolve issues</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="p-2 rounded-lg bg-surfaceHighlight hover:bg-accent-tertiary/10 text-textMuted hover:text-accent-tertiary transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <p className="text-textMuted text-sm mb-1">Total Orders</p>
                    <p className="text-3xl font-display font-bold text-textMain">{orders.length}</p>
                </div>
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <p className="text-textMuted text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-accent-primary">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <p className="text-textMuted text-sm mb-1">Platform Commission</p>
                    <p className="text-3xl font-display font-bold text-accent-tertiary">₹{totalCommission.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                    <input
                        type="text"
                        placeholder="Search by order number, kit, buyer, seller..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-tertiary transition-colors"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-surfaceHighlight/50 rounded-xl border border-border/50">
                    {['all', 'paid', 'completed', 'disputed', 'refunded'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${statusFilter === status
                                ? 'bg-accent-tertiary text-textInverse shadow-sm'
                                : 'text-textMuted hover:text-textMain'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                    {error}
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight border-b border-border">
                            <tr>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Order</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Kit</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Buyer</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Seller</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Amount</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Status</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Date</th>
                                <th className="text-left text-xs font-bold text-textMuted uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm text-textMain">{order.order_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {order.listing?.image_url && (
                                                <img src={order.listing.image_url} alt="" className="w-10 h-8 rounded object-cover" />
                                            )}
                                            <p className="text-sm text-textMain line-clamp-1 max-w-[150px]">
                                                {order.listing?.title || 'Unknown'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-textMain">{order.buyer?.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-textMuted">{order.buyer?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-textMain">{order.seller?.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-textMuted">{order.seller?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-textMain">₹{order.price_amount}</p>
                                        <p className="text-xs text-textMuted">Fee: ₹{order.commission_amount}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            disabled={updatingOrderId === order.id}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize bg-surfaceHighlight border border-border text-textMain cursor-pointer focus:outline-none focus:border-accent-tertiary ${getStatusBadge(order.status)}`}
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="completed">Completed</option>
                                            <option value="refunded">Refunded</option>
                                            <option value="disputed">Disputed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-textMuted">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            to={`/order/${order.id}`}
                                            className="p-2 rounded-lg hover:bg-accent-tertiary/10 text-textMuted hover:text-accent-tertiary transition-colors inline-flex"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-textMuted">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-textMuted">
                        Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-surface border border-border hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} className="text-textMuted" />
                        </button>
                        <span className="text-sm text-textMain px-3">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-surface border border-border hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} className="text-textMuted" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
