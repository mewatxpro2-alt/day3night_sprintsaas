import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, FileStack, CheckCircle, TrendingUp, ArrowUpRight, AlertTriangle, ShoppingCart, MessageSquare } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';

const Overview: React.FC = () => {
    // console.log('[Overview] Component rendering...');

    const { stats, isLoading, error } = useAdminStats();

    // console.log('[Overview] State:', { stats, isLoading, error });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
                    <p className="text-textMuted text-sm">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mt-8">
                <p className="text-red-500 font-medium">Error loading stats: {error}</p>
                <p className="text-textMuted text-sm mt-2">Check the console for more details.</p>
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8 text-textMuted">No stats data available.</div>;
    }

    const statCards = [
        {
            label: 'Total Users',
            value: (stats.totalUsers || 0).toLocaleString(),
            icon: Users,
            color: 'sky',
            trend: 'Users',
            desc: 'registered users'
        },
        {
            label: 'Total Kits',
            value: (stats.totalKits || 0).toLocaleString(),
            icon: Package,
            color: 'leaf',
            trend: 'Active',
            desc: 'available kits'
        },
        {
            label: 'Pending',
            value: (stats.pendingSubmissions || 0).toLocaleString(),
            icon: FileStack,
            color: 'buttermilk',
            trend: (stats.pendingSubmissions || 0) > 0 ? 'Queue' : 'Clear',
            desc: 'needs review'
        },
        {
            label: 'Live',
            value: (stats.publishedKits || 0).toLocaleString(),
            icon: CheckCircle,
            color: 'leaf',
            trend: 'Published',
            desc: 'active products'
        },
    ];

    // Marketplace stats
    const marketplaceCards = [
        {
            label: 'Total Orders',
            value: (stats.totalOrders || 0).toLocaleString(),
            icon: Package,
            color: 'sky',
            trend: 'Orders',
            desc: 'completed sales'
        },
        {
            label: 'Total Revenue',
            value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'leaf',
            trend: 'GMV',
            desc: 'gross merchandise value'
        },
        {
            label: 'Commission Earned',
            value: `₹${(stats.totalCommission || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'leaf',
            trend: '15%',
            desc: 'platform revenue'
        },
        {
            label: 'Pending Payouts',
            value: (stats.pendingPayouts || 0).toLocaleString(),
            icon: FileStack,
            color: 'buttermilk',
            trend: (stats.pendingPayouts || 0) > 0 ? 'Queue' : 'Clear',
            desc: 'seller payouts'
        },
    ];

    // Theme mapping to our CSS variables
    const themeClasses = {
        leaf: {
            bg: 'bg-accent-primary/10',
            text: 'text-accent-primary',
            border: 'border-accent-primary/20',
            iconBg: 'bg-accent-primary/10',
            badge: 'bg-accent-primary/10 text-accent-primary text-xs font-semibold px-2 py-0.5 rounded-full'
        },
        buttermilk: {
            bg: 'bg-accent-secondary/10',
            text: 'text-accent-secondary-fg', // Using FG color for readability on light backgrounds
            border: 'border-accent-secondary/20',
            iconBg: 'bg-accent-secondary/20',
            badge: 'bg-accent-secondary/10 text-accent-secondary-fg text-xs font-semibold px-2 py-0.5 rounded-full'
        },
        sky: {
            bg: 'bg-accent-tertiary/10',
            text: 'text-accent-tertiary',
            border: 'border-accent-tertiary/20',
            iconBg: 'bg-accent-tertiary/10',
            badge: 'bg-accent-tertiary/10 text-accent-tertiary text-xs font-semibold px-2 py-0.5 rounded-full'
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Dashboard Overview</h1>
                <p className="text-textMuted">Welcome back to your control panel.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/admin/submissions" className="p-4 bg-accent-secondary/10 border border-accent-secondary/20 rounded-xl hover:bg-accent-secondary/20 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-accent-secondary-fg font-bold text-lg">{stats.pendingSubmissions || 0}</p>
                            <p className="text-textMuted text-sm">Pending Submissions</p>
                        </div>
                        <FileStack className="text-accent-secondary-fg" size={24} />
                    </div>
                </Link>
                <Link to="/admin/orders" className="p-4 bg-accent-tertiary/10 border border-accent-tertiary/20 rounded-xl hover:bg-accent-tertiary/20 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-accent-tertiary font-bold text-lg">{stats.totalOrders || 0}</p>
                            <p className="text-textMuted text-sm">Total Orders</p>
                        </div>
                        <ShoppingCart className="text-accent-tertiary" size={24} />
                    </div>
                </Link>
                <Link to="/admin/disputes" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-400 font-bold text-lg">View</p>
                            <p className="text-textMuted text-sm">Open Disputes</p>
                        </div>
                        <AlertTriangle className="text-red-400" size={24} />
                    </div>
                </Link>
                <Link to="/admin/messages" className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-400 font-bold text-lg">View</p>
                            <p className="text-textMuted text-sm">Contact Messages</p>
                        </div>
                        <MessageSquare className="text-blue-400" size={24} />
                    </div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const theme = themeClasses[stat.color as keyof typeof themeClasses];

                    return (
                        <div
                            key={stat.label}
                            className={`p-6 rounded-2xl bg-surface border border-border hover:${theme.border} transition-all hover:shadow-lg hover:shadow-accent-primary/5 group`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text} border border-transparent`}>
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <div className={`flex items-center gap-1 ${theme.badge}`}>
                                    <TrendingUp size={12} />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-4xl font-display font-bold text-textMain mb-1 tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-textMuted text-sm font-medium flex items-center gap-2">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Marketplace Stats Section */}
            <div>
                <h2 className="text-xl font-display font-bold text-textMain mb-4">Marketplace Commerce</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {marketplaceCards.map((stat) => {
                        const Icon = stat.icon;
                        const theme = themeClasses[stat.color as keyof typeof themeClasses];

                        return (
                            <div
                                key={stat.label}
                                className={`p-6 rounded-2xl bg-surface border border-border hover:${theme.border} transition-all hover:shadow-lg hover:shadow-accent-primary/5 group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text} border border-transparent`}>
                                        <Icon size={24} strokeWidth={2} />
                                    </div>
                                    <div className={`flex items-center gap-1 ${theme.badge}`}>
                                        <TrendingUp size={12} />
                                        <span>{stat.trend}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-4xl font-display font-bold text-textMain mb-1 tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="text-textMuted text-sm font-medium flex items-center gap-2">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Action Card - Review Submissions (Green/Primary) */}
                <div className="lg:col-span-2 p-8 rounded-2xl bg-surface border border-border relative overflow-hidden group hover:border-accent-primary/30 transition-all">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-32 bg-accent-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-accent-primary/10" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-textMain mb-2">Submissions Queue</h2>
                        <p className="text-textMuted mb-6 max-w-md">
                            You have {stats.pendingSubmissions || 0} new kit submissions waiting for review.
                            Process them to keep the marketplace fresh.
                        </p>

                        <a
                            href="/admin/submissions"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary text-accent-primary-fg rounded-xl font-medium hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20 transform hover:-translate-y-0.5"
                        >
                            <FileStack size={18} />
                            Review Pending Items
                            <ArrowUpRight size={16} />
                        </a>
                    </div>
                </div>

                {/* Secondary Actions Card */}
                <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between relative overflow-hidden group hover:border-accent-tertiary/30 transition-all">
                    <div className="absolute bottom-0 left-0 p-24 bg-accent-tertiary/5 rounded-full blur-2xl -ml-12 -mb-12" />

                    <div>
                        <h3 className="text-lg font-bold text-textMain mb-2">Quick Access</h3>
                        <p className="text-sm text-textMuted mb-6">Manage your platform resources</p>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <a href="/admin/kits" className="flex items-center justify-between p-3 rounded-xl bg-surfaceHighlight border border-border hover:border-accent-primary/50 transition-colors group/item">
                            <span className="text-sm font-medium text-textMain flex items-center gap-2">
                                <Package size={16} className="text-accent-primary" />
                                Manage Live Kits
                            </span>
                            <ArrowUpRight size={14} className="text-textMuted group-hover/item:text-accent-primary group-hover/item:translate-x-0.5 transition-all" />
                        </a>
                        <a href="/admin/users" className="flex items-center justify-between p-3 rounded-xl bg-surfaceHighlight border border-border hover:border-accent-tertiary/50 transition-colors group/item">
                            <span className="text-sm font-medium text-textMain flex items-center gap-2">
                                <Users size={16} className="text-accent-tertiary" />
                                View User Database
                            </span>
                            <ArrowUpRight size={14} className="text-textMuted group-hover/item:text-accent-tertiary group-hover/item:translate-x-0.5 transition-all" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
