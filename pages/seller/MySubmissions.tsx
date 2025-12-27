import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, CheckCircle, XCircle, ExternalLink, Plus,
    Eye, Tag, DollarSign, Calendar, AlertCircle, Loader2,
    FileStack, Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';

interface Submission {
    id: string;
    project_name: string;
    short_summary?: string;
    thumbnail_url?: string;
    video_url?: string;
    category?: string;
    price?: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    reviewed_at?: string;
}

const MySubmissions: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchSubmissions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('submissions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                setSubmissions(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [user]);

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center">
                <p className="text-textMuted mb-4">Please sign in to view your submissions</p>
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        <CheckCircle size={12} />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle size={12} />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                        <Clock size={12} />
                        Under Review
                    </span>
                );
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    return (
        <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">My Submissions</h1>
                    <p className="text-textMuted">Track the status of your kit submissions</p>
                </div>
                <Button onClick={() => navigate('/submit')} icon={<Plus size={16} />}>
                    Submit New Kit
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-2xl font-bold text-textMain">{stats.total}</p>
                    <p className="text-xs text-textMuted uppercase tracking-wider mt-1">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20">
                    <p className="text-2xl font-bold text-accent-secondary">{stats.pending}</p>
                    <p className="text-xs text-accent-secondary/80 uppercase tracking-wider mt-1">Pending</p>
                </div>
                <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                    <p className="text-2xl font-bold text-accent-primary">{stats.approved}</p>
                    <p className="text-xs text-accent-primary/80 uppercase tracking-wider mt-1">Approved</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                    <p className="text-xs text-red-400/80 uppercase tracking-wider mt-1">Rejected</p>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-accent-primary" size={32} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-6">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-2xl bg-surface">
                    <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                        <FileStack className="text-textMuted" size={24} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-textMain mb-2">No Submissions Yet</h3>
                    <p className="text-textMuted mb-6 max-w-sm">
                        Submit your first kit to start earning revenue on the marketplace.
                    </p>
                    <Button onClick={() => navigate('/submit')} icon={<Plus size={16} />}>
                        Submit Your First Kit
                    </Button>
                </div>
            )}

            {/* Submissions Grid */}
            {!isLoading && submissions.length > 0 && (
                <div className="grid gap-6">
                    {submissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-primary/30 transition-all flex flex-col md:flex-row gap-6"
                        >
                            {/* Thumbnail */}
                            <div className="md:w-64 shrink-0">
                                {submission.thumbnail_url ? (
                                    <div className="aspect-video rounded-xl overflow-hidden bg-surfaceHighlight relative group">
                                        <img
                                            src={submission.thumbnail_url}
                                            alt={submission.project_name}
                                            className="w-full h-full object-cover"
                                        />
                                        {submission.video_url && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                                    <Play size={20} className="text-black ml-1" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-xl bg-surfaceHighlight flex items-center justify-center">
                                        <FileStack className="text-textMuted" size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-textMain mb-1">
                                            {submission.project_name}
                                        </h3>
                                        {submission.short_summary && (
                                            <p className="text-textMuted text-sm">{submission.short_summary}</p>
                                        )}
                                    </div>
                                    {getStatusBadge(submission.status)}
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-3 text-xs text-textMuted mb-4">
                                    {submission.category && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-surfaceHighlight rounded border border-border/50">
                                            <Tag size={12} />
                                            {submission.category}
                                        </span>
                                    )}
                                    {submission.price !== undefined && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-surfaceHighlight rounded border border-border/50">
                                            <DollarSign size={12} />
                                            ${submission.price}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 px-2 py-1 bg-surfaceHighlight rounded border border-border/50">
                                        <Calendar size={12} />
                                        {new Date(submission.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Rejection Reason */}
                                {submission.status === 'rejected' && submission.rejection_reason && (
                                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
                                        <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                                        <p className="text-sm text-red-300">{submission.rejection_reason}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-auto pt-4 border-t border-border flex gap-3">
                                    <button
                                        onClick={() => setSelectedSubmission(submission)}
                                        className="px-4 py-2 rounded-lg bg-surfaceHighlight hover:bg-accent-tertiary/10 text-textMuted hover:text-accent-tertiary text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    {submission.status === 'approved' && (
                                        <button
                                            onClick={() => navigate(`/kit/${submission.id}`)}
                                            className="px-4 py-2 rounded-lg bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <ExternalLink size={16} />
                                            View Live Listing
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedSubmission && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    onClick={() => setSelectedSubmission(null)}
                >
                    <div
                        className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-display font-bold text-textMain">{selectedSubmission.project_name}</h2>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Thumbnail/Video */}
                            {selectedSubmission.thumbnail_url && (
                                <div className="rounded-xl overflow-hidden">
                                    {selectedSubmission.video_url ? (
                                        <video
                                            src={selectedSubmission.video_url}
                                            poster={selectedSubmission.thumbnail_url}
                                            controls
                                            className="w-full aspect-video bg-black"
                                        />
                                    ) : (
                                        <img
                                            src={selectedSubmission.thumbnail_url}
                                            alt={selectedSubmission.project_name}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-surfaceHighlight">
                                <span className="text-sm text-textMuted">Status</span>
                                {getStatusBadge(selectedSubmission.status)}
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-surfaceHighlight">
                                    <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-textMain font-medium">{selectedSubmission.category || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-surfaceHighlight">
                                    <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Price</p>
                                    <p className="text-textMain font-medium">${selectedSubmission.price || 0}</p>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">Why was this rejected?</p>
                                    <p className="text-sm text-textMain">{selectedSubmission.rejection_reason}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="space-y-3">
                                <p className="text-xs text-textMuted uppercase tracking-wider">Timeline</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-accent-primary" />
                                        <span className="text-textMuted">Submitted:</span>
                                        <span className="text-textMain">{new Date(selectedSubmission.created_at).toLocaleString()}</span>
                                    </div>
                                    {selectedSubmission.reviewed_at && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                                            <span className="text-textMuted">Reviewed:</span>
                                            <span className="text-textMain">{new Date(selectedSubmission.reviewed_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySubmissions;
