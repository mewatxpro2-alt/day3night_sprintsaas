import React from 'react';
import { DollarSign, Package, TrendingUp, Clock, ArrowUpRight, Wallet, Plus } from 'lucide-react';
import { useSellerEarnings, useSellerOrders, useSellerPayouts } from '../../hooks/useSeller';
import { useSellerInquiries } from '../../hooks/useSellerInquiries';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Button from '../../components/Button';

const SellerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { earnings, isLoading: earningsLoading } = useSellerEarnings();
    const { orders, isLoading: ordersLoading } = useSellerOrders();
    const { payouts, isLoading: payoutsLoading } = useSellerPayouts();
    const { inquiries, isLoading: inquiriesLoading, unreadCount: inquiryUnreadCount } = useSellerInquiries();

    const isLoading = earningsLoading || ordersLoading || payoutsLoading || inquiriesLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const recentOrders = orders.slice(0, 5);
    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'scheduled');
    const recentInquiries = inquiries.slice(0, 3);

    const stats = [
        {
            label: 'Total Earnings',
            value: `₹${(earnings?.total_earnings || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'accent-primary',
            desc: 'After platform commission'
        },
        {
            label: 'Total Sales',
            value: (earnings?.orders_count || 0).toString(),
            icon: Package,
            color: 'accent-tertiary',
            desc: 'Completed orders'
        },
        {
            label: 'My Submissions',
            value: 'View',
            icon: Package,
            color: 'accent-primary',
            desc: 'Track submission status',
            link: '/seller/submissions'
        },
        {
            label: 'Inquiries',
            value: inquiries.length.toString(),
            icon: MessageCircle,
            color: 'accent-secondary',
            desc: `${inquiryUnreadCount} new`,
            isHighlight: inquiryUnreadCount > 0
        },
        {
            label: 'Pending Payout',
            value: `₹${(earnings?.pending_payouts || 0).toLocaleString()}`,
            icon: Clock,
            color: 'accent-secondary',
            desc: 'Processing'
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header with Quick Submit Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Seller Dashboard</h1>
                    <p className="text-textMuted">Track your sales, earnings, and messages</p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/submit')}
                    icon={<Plus size={18} />}
                >
                    Submit New Kit
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const CardContent = (
                        <>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                                    <Icon size={22} className={`text-${stat.color}`} />
                                </div>
                                <TrendingUp size={16} className="text-accent-primary opacity-50" />
                            </div>
                            <p className="text-3xl font-display font-bold text-textMain mb-1">
                                {stat.value}
                            </p>
                            <p className="text-textMuted text-sm">{stat.desc}</p>
                        </>
                    );

                    if (stat.link) {
                        return (
                            <Link
                                key={stat.label}
                                to={stat.link}
                                className={`p-6 rounded-2xl bg-surface border transition-all group cursor-pointer ${stat.isHighlight ? 'border-accent-secondary shadow-[0_0_15px_-5px_var(--accent-secondary)]' : 'border-border hover:border-accent-primary/30'}`}
                            >
                                {CardContent}
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={stat.label}
                            className={`p-6 rounded-2xl bg-surface border transition-all group ${stat.isHighlight ? 'border-accent-secondary shadow-[0_0_15px_-5px_var(--accent-secondary)]' : 'border-border hover:border-accent-primary/30'}`}
                        >
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Orders & Inquiries */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Inquiries */}
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                                <MessageCircle size={20} className="text-accent-secondary" />
                                Recent Inquiries
                            </h2>
                            {inquiries.length > 0 && (
                                <button
                                    onClick={() => alert('Full inbox coming shortly!')}
                                    className="text-sm text-accent-tertiary hover:underline flex items-center gap-1"
                                >
                                    View all <ArrowUpRight size={14} />
                                </button>
                            )}
                        </div>

                        {recentInquiries.length === 0 ? (
                            <div className="text-center py-8 text-textMuted bg-surfaceHighlight/30 rounded-xl border border-dashed border-border/50">
                                <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No new inquiries</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentInquiries.map((inquiry) => (
                                    <div
                                        key={inquiry.id}
                                        className={`p-4 rounded-xl border transition-all ${inquiry.status === 'new'
                                            ? 'bg-surfaceHighlight border-accent-secondary/30 shadow-sm'
                                            : 'bg-surface border-border/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted font-bold">
                                                    {(inquiry.buyer?.full_name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-textMain">
                                                        {inquiry.subject}
                                                        {inquiry.status === 'new' && (
                                                            <span className="ml-2 text-[10px] bg-accent-secondary text-accent-secondary-fg px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-textMuted">
                                                        From <span className="text-textMain">{inquiry.buyer?.full_name || 'User'}</span> • {new Date(inquiry.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <button className="text-xs font-medium text-accent-primary hover:underline">
                                                    Reply via Email
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 pl-[52px]">
                                            <p className="text-sm text-textSecondary line-clamp-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                                "{inquiry.message}"
                                            </p>
                                            <p className="text-[10px] text-textMuted mt-2 flex items-center gap-1">
                                                <Package size={10} />
                                                Regarding: {inquiry.listing?.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-textMain">Recent Sales</h2>
                            <Link
                                to="/seller/orders"
                                className="text-sm text-accent-tertiary hover:underline flex items-center gap-1"
                            >
                                View all <ArrowUpRight size={14} />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="text-center py-12 text-textMuted">
                                <Package size={40} className="mx-auto mb-4 opacity-30" />
                                <p>No sales yet</p>
                                <p className="text-sm">Your sales will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-surfaceHighlight border border-border/50 hover:border-accent-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {order.listing?.image_url && (
                                                <img
                                                    src={order.listing.image_url}
                                                    alt={order.listing.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-textMain line-clamp-1">
                                                    {order.listing?.title || 'Unknown Kit'}
                                                </p>
                                                <p className="text-sm text-textMuted">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-accent-primary">
                                                +₹{order.seller_amount}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-accent-primary/10 text-accent-primary' :
                                                order.status === 'paid' ? 'bg-accent-tertiary/10 text-accent-tertiary' :
                                                    'bg-accent-secondary/10 text-accent-secondary-fg'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Payouts */}
                <div className="p-6 rounded-2xl bg-surface border border-border h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-textMain">Payouts</h2>
                        <Link
                            to="/seller/payouts"
                            className="text-sm text-accent-tertiary hover:underline flex items-center gap-1"
                        >
                            Manage <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {pendingPayouts.length === 0 ? (
                        <div className="text-center py-8 text-textMuted">
                            <Wallet size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No pending payouts</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingPayouts.slice(0, 4).map((payout) => (
                                <div
                                    key={payout.id}
                                    className="p-3 rounded-xl bg-surfaceHighlight border border-border/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-textMain">₹{payout.amount}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${payout.status === 'scheduled' ? 'bg-accent-secondary/10 text-accent-secondary-fg' :
                                            'bg-accent-tertiary/10 text-accent-tertiary'
                                            }`}>
                                            {payout.status}
                                        </span>
                                    </div>
                                    {payout.scheduled_at && (
                                        <p className="text-xs text-textMuted mt-1">
                                            Est. {new Date(payout.scheduled_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <Link
                        to="/seller/bank"
                        className="mt-6 block w-full text-center px-4 py-3 rounded-xl bg-accent-primary/10 text-accent-primary font-medium hover:bg-accent-primary/20 transition-colors"
                    >
                        Manage Bank Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;

