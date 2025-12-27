import React, { useState } from 'react';
import { Loader2, Shield, User, Calendar, Eye, Store, UserX, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { supabase } from '../../lib/supabase';

const Users: React.FC = () => {
    const { users, isLoading, error, refetch } = useAdminUsers();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 15;

    // Filter users by search query
    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            (user.full_name?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const toggleSellerStatus = async (userId: string, currentStatus: boolean) => {
        setActionLoading(userId);
        try {
            await supabase
                .from('profiles')
                .update({ is_seller: !currentStatus })
                .eq('id', userId);
            refetch();
        } catch (err) {
            console.error('Error toggling seller status:', err);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Users</h1>
                    <p className="text-textMuted">{users.length} registered users</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-tertiary transition-colors"
                />
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-surfaceHighlight transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User size={16} className="text-blue-500" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-white">
                                                {user.full_name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-textMuted">{user.email || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 flex items-center gap-1">
                                                    <Shield size={12} />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/10 text-gray-400">
                                                    User
                                                </span>
                                            )}
                                            {user.is_seller && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">
                                                    Seller
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-textMuted">
                                            <Calendar size={14} />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleSellerStatus(user.id, user.is_seller || false)}
                                                disabled={actionLoading === user.id}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${user.is_seller
                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                    : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20'
                                                    }`}
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : user.is_seller ? (
                                                    <><UserX size={12} /> Revoke Seller</>
                                                ) : (
                                                    <><Store size={12} /> Make Seller</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-textMuted">
                        Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

export default Users;
