import React, { useState } from 'react';
import {
    Loader2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    User,
    Package,
    MessageSquare,
    Flag,
    Clock,
    ChevronRight,
    Filter,
    ExternalLink
} from 'lucide-react';
import { useAbuseReports, useResolveReport, useStartReview } from '../../hooks/useAbuseReports';
import type { ReportStatus, ReportType } from '../../types/marketplace';

const AbuseReports: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>('pending');
    const { reports, isLoading, error, refetch, counts } = useAbuseReports({ status: statusFilter });
    const { resolveReport, isLoading: resolveLoading } = useResolveReport();
    const { startReview, isLoading: reviewLoading } = useStartReview();

    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [actionTaken, setActionTaken] = useState('');

    const getReportTypeStyles = (type: ReportType) => {
        const styles: Record<ReportType, { color: string; bg: string }> = {
            spam: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            fraud: { color: 'text-red-500', bg: 'bg-red-500/10' },
            harassment: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
            copyright: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
            inappropriate: { color: 'text-pink-400', bg: 'bg-pink-500/10' },
            fake: { color: 'text-red-400', bg: 'bg-red-500/10' },
            other: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
        };
        return styles[type] || styles.other;
    };

    const getStatusStyles = (status: ReportStatus) => {
        switch (status) {
            case 'pending':
                return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: <Clock size={14} /> };
            case 'reviewing':
                return { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Eye size={14} /> };
            case 'resolved_action_taken':
                return { color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle size={14} /> };
            case 'resolved_no_action':
                return { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: <XCircle size={14} /> };
            case 'dismissed':
                return { color: 'text-red-400', bg: 'bg-red-500/10', icon: <XCircle size={14} /> };
            default:
                return { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: <Clock size={14} /> };
        }
    };

    const getTargetIcon = (targetType: string) => {
        switch (targetType) {
            case 'user': return <User size={16} className="text-blue-400" />;
            case 'listing': return <Package size={16} className="text-green-400" />;
            case 'message': return <MessageSquare size={16} className="text-purple-400" />;
            default: return <Flag size={16} className="text-gray-400" />;
        }
    };

    const handleStartReview = async (reportId: string) => {
        const success = await startReview(reportId);
        if (success) refetch();
    };

    const handleResolve = async (
        reportId: string,
        resolution: 'resolved_action_taken' | 'resolved_no_action' | 'dismissed'
    ) => {
        const success = await resolveReport({
            reportId,
            resolution,
            notes: resolutionNotes,
            actionTaken: resolution === 'resolved_action_taken' ? actionTaken : undefined
        });
        if (success) {
            setSelectedReport(null);
            setResolutionNotes('');
            setActionTaken('');
            refetch();
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
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Abuse Reports
                    </h1>
                    <p className="text-textMuted">
                        Review and resolve user-submitted reports
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-sm text-textMuted">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{counts.pending}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Eye size={16} className="text-blue-400" />
                        <span className="text-sm text-textMuted">Reviewing</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{counts.reviewing}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-sm text-textMuted">Resolved</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{counts.resolved}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Flag size={16} className="text-textMuted" />
                        <span className="text-sm text-textMuted">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{counts.total}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-textMuted">
                    <Filter size={16} />
                    <span className="text-sm">Status:</span>
                </div>
                <div className="flex gap-2">
                    {[
                        { value: 'pending', label: 'Pending' },
                        { value: 'reviewing', label: 'Reviewing' },
                        { value: undefined, label: 'All' },
                    ].map((filter) => (
                        <button
                            key={filter.label}
                            onClick={() => setStatusFilter(filter.value as ReportStatus | undefined)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === filter.value
                                    ? 'bg-accent-primary/20 text-accent-primary'
                                    : 'bg-surface border border-border text-textMuted hover:text-textMain'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {reports.length === 0 ? (
                    <div className="p-12 text-center">
                        <Flag size={48} className="mx-auto text-textMuted mb-4 opacity-50" />
                        <p className="text-textMuted">No reports found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {reports.map((report) => {
                            const typeStyles = getReportTypeStyles(report.report_type);
                            const statusStyles = getStatusStyles(report.status);
                            const isSelected = selectedReport === report.id;

                            return (
                                <div key={report.id} className="hover:bg-surfaceHighlight transition-colors">
                                    <div className="px-6 py-4">
                                        <div className="flex items-start gap-4">
                                            {/* Target Icon */}
                                            <div className="p-2 bg-surfaceHighlight rounded-lg">
                                                {getTargetIcon(report.target_type)}
                                            </div>

                                            {/* Report Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {/* Report Type Badge */}
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyles.bg} ${typeStyles.color}`}>
                                                        {report.report_type}
                                                    </span>

                                                    {/* Status Badge */}
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${statusStyles.bg} ${statusStyles.color}`}>
                                                        {statusStyles.icon}
                                                        {report.status.replace(/_/g, ' ')}
                                                    </span>

                                                    {/* Target Type */}
                                                    <span className="text-xs text-textMuted">
                                                        on {report.target_type}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-textMain mb-2 line-clamp-2">
                                                    {report.description}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-textMuted">
                                                    <span>
                                                        Reported by: {report.reporter?.full_name || report.reporter?.email || 'Anonymous'}
                                                    </span>
                                                    <span>
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {report.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStartReview(report.id)}
                                                        disabled={reviewLoading}
                                                        className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye size={14} />
                                                        Review
                                                    </button>
                                                )}

                                                {(report.status === 'pending' || report.status === 'reviewing') && (
                                                    <button
                                                        onClick={() => setSelectedReport(isSelected ? null : report.id)}
                                                        className="px-3 py-1.5 bg-accent-primary/10 text-accent-primary rounded-lg text-sm font-medium hover:bg-accent-primary/20 transition-colors flex items-center gap-1"
                                                    >
                                                        Resolve
                                                        <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Resolution Panel */}
                                        {isSelected && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm text-textMuted mb-2">
                                                            Resolution Notes
                                                        </label>
                                                        <textarea
                                                            value={resolutionNotes}
                                                            onChange={(e) => setResolutionNotes(e.target.value)}
                                                            placeholder="Describe your resolution..."
                                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary resize-none"
                                                            rows={2}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-textMuted mb-2">
                                                            Action Taken (optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={actionTaken}
                                                            onChange={(e) => setActionTaken(e.target.value)}
                                                            placeholder="e.g., User warned, Listing removed..."
                                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleResolve(report.id, 'resolved_action_taken')}
                                                            disabled={resolveLoading || !resolutionNotes}
                                                            className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Action Taken
                                                        </button>
                                                        <button
                                                            onClick={() => handleResolve(report.id, 'resolved_no_action')}
                                                            disabled={resolveLoading || !resolutionNotes}
                                                            className="px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <XCircle size={14} />
                                                            No Action Needed
                                                        </button>
                                                        <button
                                                            onClick={() => handleResolve(report.id, 'dismissed')}
                                                            disabled={resolveLoading || !resolutionNotes}
                                                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <AlertTriangle size={14} />
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbuseReports;
