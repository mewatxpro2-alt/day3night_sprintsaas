import React, { useState } from 'react';
import {
    X, CheckCircle, XCircle, Clock, ExternalLink,
    Github, Globe, Monitor, User, Target, Briefcase,
    AlertTriangle, Calendar, AlertCircle, Shield
} from 'lucide-react';
import { SellerApplicationData } from '../../hooks/useSellerApplication';
import { supabase } from '../../lib/supabase';

interface ApplicationReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    data: SellerApplicationData | null;
    onApprove: (userId: string) => void;
    onReject: (userId: string) => void;
    onActionComplete: () => void;
    isProcessing: boolean;
}

const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
    isOpen, onClose, user, data, onApprove, onActionComplete, isProcessing: parentProcessing
}) => {
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectType, setRejectType] = useState<'soft' | 'hard'>('soft');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [cooldown, setCooldown] = useState(7);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false);

    if (!isOpen || !user) return null;
    const safeData = data || {};
    const processing = parentProcessing || isInternalProcessing;

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for the user.');
            return;
        }

        setIsInternalProcessing(true);
        try {
            const { error } = await supabase.rpc('reject_seller_application', {
                target_user_id: user.id,
                rejection_type: rejectType,
                reason_public: rejectReason,
                notes_internal: rejectNotes,
                cooldown_days: cooldown
            });

            if (error) throw error;

            onActionComplete();
            onClose();
        } catch (err: any) {
            console.error('Rejection failed:', err);
            alert(`Failed: ${err.message}`);
        } finally {
            setIsInternalProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col animate-scale-in">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surfaceHighlight/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : <User size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-textMain">Review Application</h2>
                            <p className="text-sm text-textMuted flex items-center gap-2">
                                Applicant: <span className="text-textMain font-medium">{user.full_name}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surfaceHighlight rounded-lg text-textMuted hover:text-textMain"><X size={20} /></button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border">
                            <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase mb-2">
                                <Briefcase size={14} /> Applicant Type
                            </div>
                            <div className="text-lg font-bold text-textMain capitalize">
                                {safeData.applicantType || 'Not Specified'}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border">
                            <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase mb-2">
                                <Target size={14} /> Intent
                            </div>
                            <div className="text-lg font-bold text-textMain capitalize">
                                {safeData.applicationIntent || 'Not Specified'}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-border">
                            <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase mb-2">
                                <Clock size={14} /> Applied At
                            </div>
                            <div className="text-lg font-bold text-textMain">
                                {user.seller_applied_at ? new Date(user.seller_applied_at).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* 2. Project Details */}
                    <div>
                        <h3 className="text-sm font-bold text-textMain uppercase tracking-wide border-b border-border pb-2 mb-4 flex items-center gap-2">
                            <Monitor size={16} className="text-accent-primary" /> Project Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase">Product Type</label>
                                    <p className="text-textMain font-medium capitalize mt-1">
                                        {safeData.productType?.replace(/_/g, ' ') || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase">Product Status</label>
                                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        {safeData.productStatus?.replace(/_/g, ' ') || '-'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-textMuted uppercase">Tech Stack</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {safeData.techStack ? (
                                            safeData.techStack.split(',').map((stack: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono text-textSecondary">
                                                    {stack.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-textMuted text-sm">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-textMuted uppercase mb-2 block">Problem Statement / Description</label>
                                <div className="bg-surfaceHighlight/30 p-4 rounded-lg border border-border text-sm text-textSecondary leading-relaxed min-h-[120px]">
                                    {safeData.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Links & Verification */}
                    <div>
                        <h3 className="text-sm font-bold text-textMain uppercase tracking-wide border-b border-border pb-2 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-accent-primary" /> Verification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-textMuted uppercase">External Links</label>
                                <div className="space-y-2">
                                    {safeData.links?.website ? (
                                        <a href={safeData.links.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border hover:border-accent-primary/50 transition-colors group">
                                            <Globe size={16} className="text-textMuted group-hover:text-accent-primary" />
                                            <span className="text-sm text-textMain truncate flex-1">{safeData.links.website}</span>
                                            <ExternalLink size={12} className="text-textMuted" />
                                        </a>
                                    ) : <div className="text-sm text-textMuted italic">No Website provided</div>}

                                    {safeData.links?.demo ? (
                                        <a href={safeData.links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border hover:border-accent-primary/50 transition-colors group">
                                            <Monitor size={16} className="text-textMuted group-hover:text-accent-primary" />
                                            <span className="text-sm text-textMain truncate flex-1">{safeData.links.demo}</span>
                                            <ExternalLink size={12} className="text-textMuted" />
                                        </a>
                                    ) : <div className="text-sm text-textMuted italic">No Demo provided</div>}

                                    {safeData.links?.github ? (
                                        <a href={safeData.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border hover:border-accent-primary/50 transition-colors group">
                                            <Github size={16} className="text-textMuted group-hover:text-accent-primary" />
                                            <span className="text-sm text-textMain truncate flex-1">{safeData.links.github}</span>
                                            <ExternalLink size={12} className="text-textMuted" />
                                        </a>
                                    ) : <div className="text-sm text-textMuted italic">No GitHub provided</div>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-textMuted uppercase mb-3 block">Ownership Declaration</label>
                                <div className={`flex items-start gap-3 p-4 rounded-lg border ${safeData.hasFullRights ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    {safeData.hasFullRights ? (
                                        <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`font-bold text-sm ${safeData.hasFullRights ? 'text-green-500' : 'text-red-500'}`}>
                                            {safeData.hasFullRights ? 'Confirmed 100% Ownership' : 'Ownership NOT Confirmed'}
                                        </p>
                                        <p className="text-xs text-textMuted mt-1">
                                            User has asserted they own all rights to this project and its code.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Rejection Mode */}
                {rejectMode ? (
                    <div className="p-6 border-t border-border bg-red-500/5 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-red-500 flex items-center gap-2"><XCircle size={18} /> Reject Application</h3>
                            <button onClick={() => setRejectMode(false)} className="text-sm text-textMuted hover:text-textMain">Cancel</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">Rejection Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRejectType('soft')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${rejectType === 'soft' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-surface border-border opacity-50'}`}
                                    >
                                        Soft Reject
                                    </button>
                                    <button
                                        onClick={() => setRejectType('hard')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${rejectType === 'hard' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-surface border-border opacity-50'}`}
                                    >
                                        Hard Reject
                                    </button>
                                </div>
                            </div>

                            {rejectType === 'soft' && (
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">Cooldown</label>
                                    <div className="flex gap-2">
                                        {[7, 14, 30].map(days => (
                                            <button
                                                key={days}
                                                onClick={() => setCooldown(days)}
                                                className={`px-3 py-2 rounded-lg border text-sm font-bold ${cooldown === days ? 'bg-surfaceHighlight border-textMain text-textMain' : 'bg-surface border-border text-textMuted'}`}
                                            >
                                                {days}d
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-textMain mb-1">Public Reason (Required) <span className="text-red-500">*</span></label>
                                <textarea
                                    className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:border-red-500 focus:outline-none"
                                    rows={2}
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-textMuted mb-1">Internal Notes</label>
                                <textarea
                                    className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:border-red-500 focus:outline-none"
                                    rows={1}
                                    value={rejectNotes}
                                    onChange={e => setRejectNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleRejectSubmit}
                                disabled={processing}
                                className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors shadow-lg"
                            >
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 border-t border-border bg-surfaceHighlight/10 flex justify-between items-center">
                        <div className="text-xs text-textMuted">Decision triggers email notification.</div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectMode(true)}
                                disabled={processing}
                                className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm flex items-center gap-2"
                            >
                                <XCircle size={16} /> Reject...
                            </button>
                            <button
                                onClick={() => onApprove(user.id)}
                                disabled={processing}
                                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 font-bold text-sm shadow-lg flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Approve Seller
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationReviewModal;
