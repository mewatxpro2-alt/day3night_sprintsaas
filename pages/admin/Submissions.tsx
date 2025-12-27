import React, { useState } from 'react';
import { Check, X, Eye, Loader2, ExternalLink, Tag, DollarSign, Calendar, FileStack, Download, AlertTriangle, FolderArchive } from 'lucide-react';
import { useAdminSubmissions, type Submission } from '../../hooks/useAdminSubmissions';
import { useApproveSubmission, useRejectSubmission } from '../../hooks/useSubmissionActions';

const Submissions: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submissionToReject, setSubmissionToReject] = useState<string | null>(null);
    const { submissions, isLoading, error, refetch } = useAdminSubmissions({ status: statusFilter });
    const { approveSubmission, isLoading: isApproving } = useApproveSubmission();
    const { rejectSubmission, isLoading: isRejecting } = useRejectSubmission();

    const handleApprove = async (submission: Submission) => {
        console.log('[Admin] Approving submission:', submission.id, submission.project_name);
        const result = await approveSubmission(submission);
        console.log('[Admin] Approve result:', result);
        if (result.success) {
            alert(`✅ Approved: ${submission.project_name}`);
            setSelectedSubmission(null);
            refetch();
        } else {
            alert(`❌ Error: ${result.error || 'Failed to approve'}`);
        }
    };

    const handleRejectClick = (submissionId: string) => {
        setSubmissionToReject(submissionId);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const handleRejectConfirm = async () => {
        if (!submissionToReject) return;

        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        console.log('[Admin] Rejecting submission:', submissionToReject, 'with reason:', rejectionReason);
        const result = await rejectSubmission(submissionToReject, rejectionReason);
        console.log('[Admin] Reject result:', result);
        if (result.success) {
            alert('✅ Submission rejected');
            setSelectedSubmission(null);
            setShowRejectModal(false);
            setSubmissionToReject(null);
            setRejectionReason('');
            refetch();
        } else {
            alert(`❌ Error: ${result.error || 'Failed to reject'}`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-accent-primary-dim bg-accent-primary/10 border-accent-primary/20';
            case 'rejected':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            default:
                return 'text-accent-secondary-fg bg-accent-secondary/20 border-accent-secondary/20';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 h-full">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500 font-medium">Error: {error}</p>
            </div>
        );
    }

    // Dynamic classes for filters
    const getFilterClasses = (status: string) => {
        if (statusFilter === status) {
            return `bg-accent-tertiary text-textInverse shadow-lg shadow-accent-tertiary/25 ring-1 ring-accent-tertiary/20 transform scale-100`;
        }
        return `bg-surface text-textMuted hover:text-textMain hover:bg-surfaceHighlight border border-border hover:border-accent-tertiary/30`;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Kit Submissions</h1>
                    <p className="text-textMuted">Review and manage user-submitted kits</p>
                </div>
                <div className="h-10 w-10 bg-accent-secondary/10 rounded-xl flex items-center justify-center">
                    <FileStack className="text-accent-secondary-fg" size={20} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-surfaceHighlight/50 rounded-xl w-fit border border-border/50">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize flex items-center gap-2 ${getFilterClasses(status)}`}
                    >
                        {status}
                        {status === 'pending' && submissions.filter(s => s.status === 'pending').length > 0 && (
                            <span className="px-1.5 py-0.5 bg-accent-secondary/80 text-accent-secondary-fg rounded text-[10px] font-bold leading-none shadow-sm">
                                {submissions.filter(s => s.status === 'pending').length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Submissions Grid */}
            {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                        <FileStack className="text-textMuted" size={24} />
                    </div>
                    <p className="text-textMain font-medium text-lg">No submissions found</p>
                    <p className="text-textMuted text-sm">No {statusFilter !== 'all' ? statusFilter : ''} submissions match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="p-5 rounded-2xl bg-surface border border-border hover:border-accent-primary/30 transition-all group flex flex-col h-full hover:shadow-lg hover:shadow-accent-primary/5"
                        >
                            {/* Thumbnail */}
                            {submission.thumbnail_url && (
                                <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-surfaceHighlight relative ring-1 ring-black/5 dark:ring-white/5">
                                    <img
                                        src={submission.thumbnail_url}
                                        alt={submission.project_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border flex items-center gap-1.5 backdrop-blur-md shadow-sm ${getStatusColor(submission.status)}`}>
                                            {submission.status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="space-y-4 flex-1 flex flex-col">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-textMain line-clamp-1 mb-2 group-hover:text-accent-primary transition-colors">
                                        {submission.project_name}
                                    </h3>
                                    <p className="text-sm text-textMuted line-clamp-2 leading-relaxed">
                                        {submission.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-2 text-xs text-textMuted">
                                    {submission.category && (
                                        <span className="flex items-center gap-1 bg-surfaceHighlight px-2 py-1 rounded-md border border-border/50">
                                            <Tag size={12} />
                                            {submission.category}
                                        </span>
                                    )}
                                    {submission.price !== undefined && (
                                        <span className="flex items-center gap-1 bg-surfaceHighlight px-2 py-1 rounded-md border border-border/50">
                                            <DollarSign size={12} />
                                            ₹{submission.price}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 bg-surfaceHighlight px-2 py-1 rounded-md border border-border/50 ml-auto">
                                        <Calendar size={12} />
                                        {new Date(submission.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-border/50">
                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedSubmission(submission)}
                                            className="flex-1 px-3 py-2.5 rounded-xl bg-surfaceHighlight hover:bg-accent-tertiary/10 text-textMuted hover:text-accent-tertiary text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-accent-tertiary/20"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                        {submission.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(submission)}
                                                    disabled={isApproving}
                                                    className="px-3 py-2.5 rounded-xl bg-accent-primary/10 hover:bg-accent-primary text-accent-primary-dim hover:text-accent-primary-fg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 border border-transparent hover:border-accent-primary/20"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectClick(submission.id)}
                                                    disabled={isRejecting}
                                                    className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 border border-transparent hover:border-red-500/20"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in" onClick={() => setSelectedSubmission(null)}>
                    <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10 backdrop-blur-md bg-opacity-95">
                            <h2 className="text-xl font-display font-bold text-textMain">{selectedSubmission.project_name}</h2>
                            <button onClick={() => setSelectedSubmission(null)} className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Video & Thumbnail Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedSubmission.thumbnail_url && (
                                    <div className="rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-lg bg-surfaceHighlight">
                                        <p className="text-xs font-bold text-textMuted uppercase tracking-wider p-3 border-b border-border">Cover Image</p>
                                        <img src={selectedSubmission.thumbnail_url} alt="Cover" className="w-full aspect-video object-cover" />
                                    </div>
                                )}
                                {selectedSubmission.video_url && (
                                    <div className="rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-lg bg-surfaceHighlight">
                                        <p className="text-xs font-bold text-textMuted uppercase tracking-wider p-3 border-b border-border">Demo Video</p>
                                        <video src={selectedSubmission.video_url} controls className="w-full aspect-video bg-black" />
                                    </div>
                                )}
                            </div>

                            {/* Screenshots Section */}
                            {selectedSubmission.screenshot_urls && selectedSubmission.screenshot_urls.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 block">Screenshots</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedSubmission.screenshot_urls.map((url, i) => (
                                            <div key={i} className="rounded-lg overflow-hidden border border-border group cursor-zoom-in">
                                                <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-6">
                                {/* Key Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Category</label>
                                        <p className="text-textMain font-medium">{selectedSubmission.category || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Price</label>
                                        <p className="text-textMain font-medium">₹{selectedSubmission.price || 0}</p>
                                    </div>
                                    {selectedSubmission.setup_time && (
                                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                            <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Setup Time</label>
                                            <p className="text-textMain font-medium">{selectedSubmission.setup_time}</p>
                                        </div>
                                    )}
                                    <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Status</label>
                                        <p className="text-textMain font-medium capitalize">{selectedSubmission.status}</p>
                                    </div>
                                </div>

                                {/* Tagline */}
                                {selectedSubmission.tagline && (
                                    <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
                                        <label className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-1 block">Tagline</label>
                                        <p className="text-textMain font-medium leading-relaxed">{selectedSubmission.tagline}</p>
                                    </div>
                                )}

                                {/* Short Summary */}
                                {selectedSubmission.short_summary && (
                                    <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
                                        <label className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-1 block">Short Summary</label>
                                        <p className="text-textMain font-medium leading-relaxed">{selectedSubmission.short_summary}</p>
                                    </div>
                                )}

                                {/* Main Description */}
                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2 block">Technical Description</label>
                                    <p className="text-textMain leading-relaxed whitespace-pre-wrap text-sm">{selectedSubmission.description}</p>
                                </div>

                                {/* Features List */}
                                {selectedSubmission.features && (
                                    <div>
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2 block">Key Features</label>
                                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                            <p className="text-textMain whitespace-pre-wrap text-sm leading-relaxed">{selectedSubmission.features}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2 block">Tech Stack</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedSubmission.tech_stack || 'N/A').split(',').map((tech, i) => (
                                            <span key={i} className="px-3 py-1 bg-surfaceHighlight border border-border rounded-lg text-sm text-textMain">
                                                {tech.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* URLs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedSubmission.live_url && (
                                        <div className="p-4 rounded-xl bg-accent-tertiary/5 border border-accent-tertiary/10">
                                            <label className="text-xs font-bold text-accent-tertiary-dim uppercase tracking-wider mb-1 block">Live Preview</label>
                                            <a
                                                href={selectedSubmission.live_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent-tertiary hover:underline flex items-center gap-2 font-medium break-all text-sm"
                                            >
                                                {selectedSubmission.live_url}
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    )}
                                    {selectedSubmission.repo_url && (
                                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border">
                                            <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Repository</label>
                                            <a
                                                href={selectedSubmission.repo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-textMain hover:underline flex items-center gap-2 font-medium break-all text-sm"
                                            >
                                                {selectedSubmission.repo_url}
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Sections */}
                                {(selectedSubmission.deliverables && selectedSubmission.deliverables.length > 0) && (
                                    <div>
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 block">Deliverables (What's Included)</label>
                                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                            <ul className="space-y-2">
                                                {selectedSubmission.deliverables.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-textMain">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {(selectedSubmission.what_buyer_gets && selectedSubmission.what_buyer_gets.length > 0) && (
                                    <div>
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 block">What Buyer Gets</label>
                                        <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/10">
                                            <ul className="space-y-2">
                                                {selectedSubmission.what_buyer_gets.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-textMain">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary mt-1.5 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Use Cases Grid */}
                                {((selectedSubmission.perfect_for && selectedSubmission.perfect_for.length > 0) || (selectedSubmission.not_for && selectedSubmission.not_for.length > 0)) && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {selectedSubmission.perfect_for && selectedSubmission.perfect_for.length > 0 && (
                                            <div>
                                                <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 block">✅ Perfect For</label>
                                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                                    <ul className="space-y-2">
                                                        {selectedSubmission.perfect_for.map((item: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-textMain">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSubmission.not_for && selectedSubmission.not_for.length > 0 && (
                                            <div>
                                                <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 block">⚠️ NOT For</label>
                                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                                    <ul className="space-y-2">
                                                        {selectedSubmission.not_for.map((item: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-textMuted">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0"></span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Uploaded Resources Section */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
                                            <FolderArchive size={14} />
                                            Uploaded Resources
                                        </label>
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${selectedSubmission.kit_resources && selectedSubmission.kit_resources.length > 0
                                                ? 'bg-accent-primary/10 text-accent-primary'
                                                : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {selectedSubmission.kit_resources?.length || 0} files
                                        </span>
                                    </div>

                                    {/* Resource Validation Warning */}
                                    {(!selectedSubmission.kit_resources || selectedSubmission.kit_resources.length === 0) && (
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-4">
                                            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-400">No Resources Uploaded</p>
                                                <p className="text-xs text-red-400/70 mt-1">
                                                    The seller has not uploaded any resource files. Buyers need source code to receive value.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedSubmission.kit_resources && selectedSubmission.kit_resources.length > 0 && (
                                        <>
                                            {/* Check for source code */}
                                            {!selectedSubmission.kit_resources.some(r => r.file_type === 'zip') && (
                                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 mb-4">
                                                    <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-400">Missing Source Code</p>
                                                        <p className="text-xs text-amber-400/70 mt-1">
                                                            No ZIP file found. Ensure source code is included before approving.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {selectedSubmission.kit_resources.map((resource, i) => (
                                                    <div key={resource.id || i} className="p-4 rounded-xl bg-surfaceHighlight border border-border/50 flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                                                                <FileStack size={18} className="text-accent-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-textMain mb-0.5">{resource.file_name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-textMuted">
                                                                    <span className="px-2 py-0.5 bg-surface rounded border border-border uppercase font-mono">
                                                                        {resource.file_type}
                                                                    </span>
                                                                    {resource.file_size_bytes && (
                                                                        <span>{(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                                                                    )}
                                                                    {resource.linked_deliverable && (
                                                                        <span className="text-accent-primary">→ {resource.linked_deliverable}</span>
                                                                    )}
                                                                </div>
                                                                {resource.description && (
                                                                    <p className="text-xs text-textMuted mt-1">{resource.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={resource.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg bg-accent-tertiary/10 hover:bg-accent-tertiary/20 text-accent-tertiary transition-colors shrink-0"
                                                            title="Download / Preview"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {selectedSubmission.status === 'pending' && (
                                <div className="flex gap-4 pt-6 border-t border-border mt-8">
                                    <button
                                        onClick={() => handleApprove(selectedSubmission)}
                                        disabled={isApproving}
                                        className="flex-1 px-6 py-3.5 rounded-xl bg-accent-primary hover:bg-accent-primary-dim text-accent-primary-fg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isApproving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        Approve & Publish
                                    </button>
                                    <button
                                        onClick={() => handleRejectClick(selectedSubmission.id)}
                                        disabled={isRejecting}
                                        className="px-6 py-3.5 rounded-xl bg-surfaceHighlight hover:bg-red-500/10 text-textMuted hover:text-red-500 border border-border hover:border-red-500/20 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isRejecting ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl border border-border max-w-md w-full shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-xl font-display font-bold text-textMain">Reject Submission</h3>
                            <p className="text-textMuted text-sm mt-1">Please provide a reason for rejection. The seller will see this message.</p>
                        </div>
                        <div className="p-6">
                            <label className="text-sm font-medium text-textMain mb-2 block">Rejection Reason *</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., Incomplete documentation, Low quality screenshots, Description needs more detail..."
                                className="w-full h-32 px-4 py-3 rounded-xl bg-surfaceHighlight border border-border text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
                            />
                        </div>
                        <div className="p-6 border-t border-border flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSubmissionToReject(null);
                                    setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-surfaceHighlight hover:bg-border text-textMuted hover:text-textMain font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={isRejecting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isRejecting ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Submissions;
