import React, { useState } from 'react';
import {
    CheckCircle, XCircle, Clock, ExternalLink,
    Github, Globe, Monitor, Code2, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { supabase } from '../../lib/supabase';
import { SellerApplicationData } from '../../hooks/useSellerApplication';

interface ApplicationCardProps {
    user: any;
    data: SellerApplicationData;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ user, data, onApprove, onReject, isProcessing }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4 transition-all hover:shadow-md">
            {/* Header / Summary */}
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-surfaceHighlight/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center text-textMuted">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-textMain text-lg">{user.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-textMuted">{user.email}</p>
                    </div>
                    <div className="h-8 w-px bg-border mx-2" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase tracking-wide">
                                {data.productType?.replace(/_/g, ' ') || 'Unknown Type'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-surfaceHighlight text-textMuted border border-border uppercase tracking-wide">
                                {data.applicantType || 'Unknown Applicant'}
                            </span>
                        </div>
                        <p className="text-xs text-textSecondary">
                            Applied: {user.seller_applied_at ? new Date(user.seller_applied_at).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isExpanded ? <ChevronUp size={20} className="text-textMuted" /> : <ChevronDown size={20} className="text-textMuted" />}
                </div>
            </div>

            {/* EXPANDED DETAILS */}
            {isExpanded && (
                <div className="border-t border-border bg-surfaceHighlight/5 p-6 animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Left: Project Details */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-textMuted uppercase mb-2">Intent</h4>
                                <p className="text-textMain">{data.applicationIntent === 'earn' ? 'Earn from existing projects' : data.applicationIntent === 'validate' ? 'Validate an idea' : 'Share production-ready SaaS'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-textMuted uppercase mb-2">Tech Stack</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.techStack?.split(',').map((stack: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono text-textSecondary">
                                            {stack.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-textMuted uppercase mb-2">Description</h4>
                                <p className="text-textSecondary text-sm leading-relaxed bg-surface p-4 rounded-lg border border-border">
                                    {data.description}
                                </p>
                            </div>
                        </div>

                        {/* Right: Validation & Links */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-textMuted uppercase mb-3">Links</h4>
                                <div className="space-y-2">
                                    {data.links?.website && (
                                        <a href={data.links.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-accent-primary hover:underline">
                                            <Globe size={14} /> Website: {data.links.website} <ExternalLink size={10} />
                                        </a>
                                    )}
                                    {data.links?.demo && (
                                        <a href={data.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-accent-primary hover:underline">
                                            <Monitor size={14} /> Demo: {data.links.demo} <ExternalLink size={10} />
                                        </a>
                                    )}
                                    {data.links?.github && (
                                        <a href={data.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-accent-primary hover:underline">
                                            <Github size={14} /> GitHub: {data.links.github} <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-textMuted uppercase mb-3">Declarations</h4>
                                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                    <CheckCircle size={16} />
                                    <span>User confirms 100% ownership of rights.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                        <button
                            onClick={() => onReject(user.id)}
                            disabled={isProcessing}
                            className="px-6 py-2.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <XCircle size={18} />
                            Reject Application
                        </button>
                        <button
                            onClick={() => onApprove(user.id)}
                            disabled={isProcessing}
                            className="px-6 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 font-bold text-sm transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Approve Seller Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SellerApplications: React.FC = () => {
    const { users, isLoading, refetch } = useAdminUsers();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filter for pending applications
    const pendingApplications = users.filter(u => u.seller_status === 'pending');

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this applicant?`)) return;

        setActionLoading(userId);
        try {
            const updates: any = {
                seller_status: action === 'approved' ? 'approved' : 'rejected',
                seller_reviewed_at: new Date().toISOString(),
            };

            if (action === 'approve') {
                updates.is_seller = true;
                updates.role = 'seller';
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;

            // Re-fetch to update UI
            await refetch();
        } catch (err) {
            console.error('Error processing application:', err);
            alert('Failed to process application');
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-textMuted">Loading applications...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Seller Applications</h1>
                    <p className="text-textMuted">Review and approve new seller requests.</p>
                </div>
                <div className="px-4 py-2 bg-accent-primary/10 rounded-lg border border-accent-primary/20 text-accent-primary font-bold">
                    {pendingApplications.length} Pending
                </div>
            </div>

            {pendingApplications.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-border rounded-xl">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-textMain mb-2">All Caught Up!</h3>
                    <p className="text-textMuted">No pending applications to review.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingApplications.map(user => (
                        <ApplicationCard
                            key={user.id}
                            user={user}
                            data={user.seller_application_data || {}}
                            onApprove={(id) => handleAction(id, 'approve')}
                            onReject={(id) => handleAction(id, 'reject')}
                            isProcessing={actionLoading === user.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerApplications;
