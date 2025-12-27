import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import {
    LayoutDashboard,
    FileStack,
    Package,
    Users,
    DollarSign,
    MessageSquare,
    LogOut,
    ChevronRight,
    Leaf,
    History,
    Flag,
    Shield,
    FileText
} from 'lucide-react';
import Logo from '../components/Logo';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const navItems = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/submissions', label: 'Submissions', icon: FileStack },
        { path: '/admin/kits', label: 'Live Kits', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: DollarSign },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/tickets', label: 'Support Tickets', icon: MessageSquare },
        { path: '/admin/blog', label: 'Blog Manager', icon: FileText },
        { path: '/admin/refunds', label: 'Refunds', icon: Flag },
        { path: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
        { path: '/admin/disputes', label: 'Disputes', icon: MessageSquare },
        { path: '/admin/abuse-reports', label: 'Abuse Reports', icon: Flag },
        { path: '/admin/moderation-log', label: 'Moderation Log', icon: History },
        { path: '/admin/settings', label: 'Settings', icon: Shield },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-background text-textMain">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-border flex flex-col fixed h-screen z-20">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <Logo variant="icon" />
                        <div>
                            <span className="text-lg font-display font-bold text-textMain">Admin</span>
                            <p className="text-xs text-textMuted font-medium">Control Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                                    ? 'bg-accent-primary/10 text-accent-primary font-semibold'
                                    : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight'
                                    }`}
                            >
                                <Icon size={18} className={active ? 'text-accent-primary' : 'text-textMuted group-hover:text-textMain'} />
                                <span className="text-sm flex-1">{item.label}</span>
                                {active && <ChevronRight size={16} className="text-accent-primary" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Theme Toggle */}
                <div className="p-4 border-t border-border mt-auto space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-medium text-textMuted">Appearance</span>
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surfaceHighlight border border-border/50">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-white">
                                {(user?.user_metadata?.full_name || user?.email || 'A')[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-textMain truncate">
                                {user?.user_metadata?.full_name || 'Admin User'}
                            </p>
                            <p className="text-xs text-textMuted truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-w-0 bg-background">
                <div className="p-8 max-w-7xl mx-auto text-textMain">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
