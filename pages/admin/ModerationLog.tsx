import React, { useState } from 'react';
import {
    Loader2,
    History,
    Filter,
    User,
    Package,
    MessageSquare,
    ShoppingCart,
    ChevronDown,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    Ban,
    Flag,
    Shield,
    Star
} from 'lucide-react';
import { useModerationHistory } from '../../hooks/useTrustSafety';
import type { ModerationActionType } from '../../types/marketplace';

const ModerationLog: React.FC = () => {
    const [filterType, setFilterType] = useState<'user' | 'listing' | undefined>(undefined);
    const { actions, isLoading, error, refetch } = useModerationHistory(filterType);
    const [expandedAction, setExpandedAction] = useState<string | null>(null);

    // Action type to icon/color mapping
    const getActionStyles = (actionType: ModerationActionType) => {
        const styles: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
            // User actions
            flag: { icon: <Flag size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            unflag: { icon: <Flag size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            restrict: { icon: <AlertTriangle size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            unrestrict: { icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            suspend: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
            unsuspend: { icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            ban: { icon: <Ban size={14} />, color: 'text-red-500', bg: 'bg-red-500/10' },
            unban: { icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            // Listing actions
            approve: { icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            reject: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
            hide: { icon: <Eye size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            unhide: { icon: <Eye size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            remove: { icon: <XCircle size={14} />, color: 'text-red-500', bg: 'bg-red-500/10' },
            restore: { icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
            feature: { icon: <Star size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            unfeature: { icon: <Star size={14} />, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            // Content actions
            delete: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
            edit: { icon: <MessageSquare size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        };
        return styles[actionType] || { icon: <History size={14} />, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    };

    const getTargetIcon = (targetType: string) => {
        switch (targetType) {
            case 'user': return <User size={14} />;
            case 'listing': return <Package size={14} />;
            case 'message': return <MessageSquare size={14} />;
            case 'order': return <ShoppingCart size={14} />;
            default: return <History size={14} />;
        }
    };

    const formatActionType = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Moderation Log
                    </h1>
                    <p className="text-textMuted">
                        Complete audit trail of all moderation actions
                    </p>
                </div>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-surface border border-border rounded-lg text-textSecondary hover:bg-surfaceHighlight transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-textMuted">
                    <Filter size={16} />
                    <span className="text-sm">Filter by:</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType(undefined)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === undefined
                                ? 'bg-accent-primary/20 text-accent-primary'
                                : 'bg-surface border border-border text-textMuted hover:text-textMain'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('user')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${filterType === 'user'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-surface border border-border text-textMuted hover:text-textMain'
                            }`}
                    >
                        <User size={14} /> Users
                    </button>
                    <button
                        onClick={() => setFilterType('listing')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${filterType === 'listing'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-surface border border-border text-textMuted hover:text-textMain'
                            }`}
                    >
                        <Package size={14} /> Listings
                    </button>
                </div>
            </div>

            {/* Actions List */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {actions.length === 0 ? (
                    <div className="p-12 text-center">
                        <History size={48} className="mx-auto text-textMuted mb-4 opacity-50" />
                        <p className="text-textMuted">No moderation actions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {actions.map((action) => {
                            const styles = getActionStyles(action.action_type);
                            const isExpanded = expandedAction === action.id;

                            return (
                                <div key={action.id} className="hover:bg-surfaceHighlight transition-colors">
                                    <button
                                        onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                                        className="w-full px-6 py-4 flex items-center gap-4 text-left"
                                    >
                                        {/* Action Icon */}
                                        <div className={`p-2 rounded-lg ${styles.bg}`}>
                                            <span className={styles.color}>{styles.icon}</span>
                                        </div>

                                        {/* Action Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-medium ${styles.color}`}>
                                                    {formatActionType(action.action_type)}
                                                </span>
                                                <span className="text-textMuted">on</span>
                                                <span className="flex items-center gap-1 text-textSecondary">
                                                    {getTargetIcon(action.target_type)}
                                                    {action.target_type}
                                                </span>
                                            </div>
                                            {action.reason && (
                                                <p className="text-sm text-textMuted truncate">
                                                    {action.reason}
                                                </p>
                                            )}
                                        </div>

                                        {/* Admin */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Shield size={14} className="text-blue-400" />
                                            <span className="text-textSecondary">
                                                {action.admin?.full_name || 'Admin'}
                                            </span>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-sm text-textMuted whitespace-nowrap">
                                            {new Date(action.created_at).toLocaleString()}
                                        </div>

                                        {/* Expand Icon */}
                                        <ChevronDown
                                            size={16}
                                            className={`text-textMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-6 pb-4 pt-0 bg-surfaceHighlight/50">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-textMuted mb-1">Target ID</p>
                                                    <code className="text-xs bg-surface px-2 py-1 rounded text-textSecondary">
                                                        {action.target_id}
                                                    </code>
                                                </div>
                                                {action.notes && (
                                                    <div>
                                                        <p className="text-textMuted mb-1">Notes</p>
                                                        <p className="text-textMain">{action.notes}</p>
                                                    </div>
                                                )}
                                                {action.previous_state && (
                                                    <div>
                                                        <p className="text-textMuted mb-1">Previous State</p>
                                                        <code className="text-xs bg-surface px-2 py-1 rounded text-textSecondary block">
                                                            {JSON.stringify(action.previous_state)}
                                                        </code>
                                                    </div>
                                                )}
                                                {action.new_state && (
                                                    <div>
                                                        <p className="text-textMuted mb-1">New State</p>
                                                        <code className="text-xs bg-surface px-2 py-1 rounded text-textSecondary block">
                                                            {JSON.stringify(action.new_state)}
                                                        </code>
                                                    </div>
                                                )}
                                                {action.reversed_at && (
                                                    <div className="col-span-2">
                                                        <p className="text-yellow-400 flex items-center gap-1">
                                                            <AlertTriangle size={14} />
                                                            Reversed on {new Date(action.reversed_at).toLocaleString()}
                                                            {action.reversal_reason && `: ${action.reversal_reason}`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-textMuted">
                <span>Showing {actions.length} actions</span>
                <span>
                    Last updated: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

export default ModerationLog;
