import React, { useState } from 'react';
import {
    Search, Filter, MoreHorizontal, User,
    Shield, Check, X, Mail, Briefcase, Clock, Eye
} from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { supabase } from '../../lib/supabase';
import ApplicationReviewModal from '../../components/admin/ApplicationReviewModal';

const AdminUsers: React.FC = () => {
    const { users, isLoading, error, refetch } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'seller' | 'user' | 'admin'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const handleSellerAction = async (userId: string, action: 'approve' | 'reject') => {
        setActionLoading(userId);
        try {
            const updates: any = {
                seller_status: action === 'approve' ? 'approved' : 'rejected', // fixed typo: 'approved' vs 'approve' check
                seller_reviewed_at: new Date().toISOString(),
                // If approved, verify them as seller
                ...(action === 'approve' ? { is_seller: true, role: 'seller' } : {})
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;

            // Close modal if open
            setIsReviewOpen(false);
            setSelectedUser(null);

            refetch(); // Refresh list
        } catch (err) {
            console.error('Error updating seller status:', err);
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const openReviewModal = (user: any) => {
        setSelectedUser(user);
        setIsReviewOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        // Check seller status if filtering by pending
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'pending' && user.seller_status === 'pending');

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="p-8 text-center text-textMuted">Loading users...</div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Users</h1>
                    <p className="text-textMuted">Manage user accounts and permissions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : 'all')}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors flex items-center gap-2 ${filterStatus === 'pending'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-surface border-border text-textMuted hover:text-textMain'
                            }`}
                    >
                        <Clock size={16} />
                        {filterStatus === 'pending' ? 'Showing Pending Applications' : 'Show Pending Applications'}
                    </button>
                    <button className="px-4 py-2 bg-accent-primary text-textInverse rounded-lg font-medium hover:bg-accent-secondary transition-colors">
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-textMain focus:outline-none focus:border-accent-primary"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'seller', 'user', 'admin'] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${filterRole === role
                                ? 'bg-surfaceHighlight border-accent-primary text-accent-primary'
                                : 'bg-surface border-border text-textMuted hover:text-textMain'
                                }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-surfaceHighlight border-b border-border">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-textMuted uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-textMuted uppercase">Role</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-textMuted uppercase">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-textMuted uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-textMuted">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-textMain">{user.full_name}</p>
                                            <p className="text-xs text-textMuted">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {/* Role Badges */}
                                    <div className="flex gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                            : user.role === 'seller'
                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                : 'bg-surfaceHighlight text-textMuted border-border'
                                            }`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>

                                        {/* Pending Badge */}
                                        {user.seller_status === 'pending' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider animate-pulse">
                                                <Clock size={12} /> Pending Review
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                        <Check size={12} />
                                        Active
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    {user.seller_status === 'pending' ? (
                                        <button
                                            onClick={() => openReviewModal(user)}
                                            className="px-3 py-1.5 bg-accent-primary text-textInverse rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-accent-secondary transition-colors"
                                        >
                                            <Eye size={14} /> Review Application
                                        </button>
                                    ) : (
                                        <button className="p-1 hover:bg-surfaceHighlight rounded text-textMuted hover:text-textMain transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* REVIEW MODAL */}
            <ApplicationReviewModal
                isOpen={isReviewOpen}
                onClose={() => { setIsReviewOpen(false); setSelectedUser(null); }}
                user={selectedUser}
                data={selectedUser?.seller_application_data}
                onApprove={(id) => handleSellerAction(id, 'approve')}
                onReject={() => { }} // Legacy prop, we use RPC in modal now
                onActionComplete={() => { refetch(); setIsReviewOpen(false); }}
                isProcessing={!!actionLoading}
            />
        </div>
    );
};

export default AdminUsers;
