import React, { useState } from 'react';
import {
    Mail, Users, Download, Search, Filter, CheckCircle, XCircle,
    Clock, TrendingUp, UserCheck, UserX, Loader2, AlertCircle
} from 'lucide-react';
import { useEmailAudience, useEmailStats, exportEmailsToCSV, updateEmailStatus } from '../../hooks/useEmailAudience';
import type { EmailAudienceRecord } from '../../types';
import Button from '../../components/Button';

const EmailAudience: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { stats, isLoading: statsLoading } = useEmailStats();
    const { emails, isLoading, error, refetch } = useEmailAudience({
        search: searchQuery,
        source: sourceFilter,
        user_type: userTypeFilter,
        status: statusFilter
    });

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        const result = await exportEmailsToCSV({
            search: searchQuery,
            source: sourceFilter,
            user_type: userTypeFilter,
            status: statusFilter
        });

        if (result.success && result.csv) {
            // Download CSV
            const blob = new Blob([result.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `email-audience-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        setIsExporting(false);
    };

    const handleStatusUpdate = async (emailId: string, newStatus: EmailAudienceRecord['status']) => {
        await updateEmailStatus(emailId, newStatus);
        refetch();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Mail size={20} className="text-accent-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-textMain">Email Audience</h1>
                        <p className="text-sm text-textSecondary">Centralized email management & campaign intelligence</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-accent-primary" size={32} />
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Total Emails</span>
                            <Users size={16} className="text-textMuted" />
                        </div>
                        <div className="text-3xl font-bold text-textMain">{stats.total_emails.toLocaleString()}</div>
                        <div className="text-xs text-textSecondary mt-1">
                            {stats.subscribed_count} subscribed
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Newsletter</span>
                            <Mail size={16} className="text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-textMain">{stats.newsletter_count.toLocaleString()}</div>
                        <div className="text-xs text-textSecondary mt-1">
                            Organic signups
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Registered</span>
                            <UserCheck size={16} className="text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-textMain">{stats.registered_count.toLocaleString()}</div>
                        <div className="text-xs text-textSecondary mt-1">
                            {stats.buyer_count} buyers, {stats.seller_count} sellers
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Guests</span>
                            <UserX size={16} className="text-orange-500" />
                        </div>
                        <div className="text-3xl font-bold text-textMain">{stats.guest_count.toLocaleString()}</div>
                        <div className="text-xs text-textSecondary mt-1">
                            Not yet registered
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surfaceHighlight border border-border rounded-lg text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="px-4 py-2.5 bg-surfaceHighlight border border-border rounded-lg text-textMain focus:border-accent-primary focus:outline-none transition-all"
                    >
                        <option value="">All Sources</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="contact">Contact Form</option>
                        <option value="buyer_signup">Buyer Signup</option>
                        <option value="seller_signup">Seller Signup</option>
                        <option value="manual">Manual</option>
                    </select>

                    <select
                        value={userTypeFilter}
                        onChange={(e) => setUserTypeFilter(e.target.value)}
                        className="px-4 py-2.5 bg-surfaceHighlight border border-border rounded-lg text-textMain focus:border-accent-primary focus:outline-none transition-all"
                    >
                        <option value="">All Types</option>
                        <option value="guest">Guest</option>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-surfaceHighlight border border-border rounded-lg text-textMain focus:border-accent-primary focus:outline-none transition-all"
                    >
                        <option value="">All Status</option>
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    {/* Export Button */}
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        isLoading={isExporting}
                        icon={<Download size={16} />}
                        className="whitespace-nowrap"
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Email List */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-600">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-accent-primary" size={32} />
                    </div>
                ) : emails.length === 0 ? (
                    <div className="text-center py-20">
                        <Mail size={48} className="text-textMuted mx-auto mb-4 opacity-30" />
                        <p className="text-textSecondary">No emails found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surfaceHighlight border-b border-border">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Source</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Consent</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Created</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {emails.map((record) => (
                                    <tr key={record.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-textMain">{record.email}</span>
                                                {record.linked_user_id && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                        LINKED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-surface text-textMain border border-border">
                                                {record.source.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${record.user_type === 'seller' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                    record.user_type === 'buyer' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                        'bg-gray-50 text-gray-700 border border-gray-100'
                                                }`}>
                                                {record.user_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {record.status === 'subscribed' ? (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={14} className="text-red-500" />
                                                )}
                                                <span className="text-sm text-textMain capitalize">{record.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.consent_flag ? (
                                                <span className="text-xs text-green-600 font-medium">Yes</span>
                                            ) : (
                                                <span className="text-xs text-textMuted">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-textSecondary">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-textSecondary">
                                            {new Date(record.last_seen_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="mt-6 flex items-center justify-between text-xs text-textMuted">
                <span>Showing {emails.length} emails</span>
                <span>Campaign-ready • Export includes consent status</span>
            </div>
        </div>
    );
};

export default EmailAudience;
