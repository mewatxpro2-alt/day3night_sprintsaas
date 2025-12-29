import React, { useState, useEffect } from 'react';
import {
    User, Mail, Layout, Star, Briefcase, Settings,
    Save, Loader2, Camera, Check, Shield, AlertCircle
} from 'lucide-react';
import { useProfile, UserProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { profile, isLoading, updateProfile } = useProfile();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name,
                primary_intent: profile.primary_intent,
                experience_level: profile.experience_level,
                interests: profile.interests || [],
                seller_type: profile.seller_type,
                seller_product_focus: profile.seller_product_focus,
                seller_readiness: profile.seller_readiness,
                preferences: profile.preferences || {
                    show_buyer_content: true,
                    show_seller_tools: profile.is_seller,
                    receive_updates: true
                }
            });
        }
    }, [profile]);

    const handleSave = async (section: string) => {
        setIsSaving(true);
        setMessage(null);

        const result = await updateProfile(formData);

        setIsSaving(false);
        if (result.success) {
            setMessage({ type: 'success', text: `${section} updated successfully` });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update' });
        }
    };

    const toggleInterest = (interest: string) => {
        const currentInterests = formData.interests || [];
        const newInterests = currentInterests.includes(interest)
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];

        setFormData(prev => ({ ...prev, interests: newInterests }));
    };

    const togglePreference = (key: keyof NonNullable<UserProfile['preferences']>) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences!,
                [key]: !prev.preferences![key]
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (!profile) return null;

    const INTEREST_OPTIONS = ['SaaS', 'AI', 'Design Tools', 'Dev Tools', 'Marketing', 'Productivity', 'Finance', 'E-commerce'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-8 animate-fade-in">

            {/* 1. Header Section */}
            <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-surfaceHighlight border-4 border-surface shadow-inner flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-textMuted" />
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-accent-primary text-textInverse rounded-full shadow-lg hover:bg-accent-secondary transition-colors" title="Change Avatar">
                        <Camera size={14} />
                    </button>
                </div>

                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">
                        {profile.full_name || 'User Profile'}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 rounded-full bg-surfaceHighlight border border-border text-xs font-medium text-textMuted flex items-center gap-2">
                            <Mail size={12} /> {profile.email}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${profile.primary_intent === 'sell'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                            {profile.is_seller ? <Briefcase size={12} /> : <Star size={12} />}
                            {profile.primary_intent === 'sell' ? 'Seller Account' : 'Buyer Profile'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium flex items-center gap-1">
                            <Shield size={12} /> Verified
                        </span>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                    <p className="text-xs text-textMuted uppercase font-bold mb-1">Member Since</p>
                    <p className="text-sm font-mono text-textMain">
                        {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Notification Toast */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Editable Forms */}
                <div className="md:col-span-2 space-y-8">

                    {/* 2. Personal Info Section */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-textMain flex items-center gap-2">
                                <User size={20} className="text-accent-primary" />
                                Personal Info
                            </h2>
                            <button
                                onClick={() => handleSave('Personal Info')}
                                disabled={isSaving}
                                className="text-sm font-medium text-accent-primary hover:text-accent-secondary disabled:opacity-50 flex items-center gap-1"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name || ''}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">Primary Goal</label>
                                    <select
                                        value={formData.primary_intent || 'explore'}
                                        onChange={e => setFormData({ ...formData, primary_intent: e.target.value as any })}
                                        className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none appearance-none"
                                    >
                                        <option value="explore">Exploring</option>
                                        <option value="buy">Buying Software</option>
                                        <option value="sell">Selling Software</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">Experience Level</label>
                                    <select
                                        value={formData.experience_level || 'beginner'}
                                        onChange={e => setFormData({ ...formData, experience_level: e.target.value as any })}
                                        className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none appearance-none"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Interests Section */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-textMain flex items-center gap-2">
                                <Star size={20} className="text-amber-400" />
                                Interests & Focus
                            </h2>
                            <button
                                onClick={() => handleSave('Interests')}
                                disabled={isSaving}
                                className="text-sm font-medium text-accent-primary hover:text-accent-secondary disabled:opacity-50 flex items-center gap-1"
                            >
                                <Save size={14} /> Save Changes
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${formData.interests?.includes(interest)
                                        ? 'bg-accent-primary text-white border-accent-primary shadow-md'
                                        : 'bg-surfaceHighlight text-textMuted border-border hover:border-accent-primary/50'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Seller Profile (Conditional) */}
                    {(profile.is_seller || formData.primary_intent === 'sell') && (
                        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-display font-bold text-textMain flex items-center gap-2">
                                    <Briefcase size={20} className="text-purple-400" />
                                    Seller Profile
                                </h2>
                                <button
                                    onClick={() => handleSave('Seller Profile')}
                                    disabled={isSaving}
                                    className="text-sm font-medium text-accent-primary hover:text-accent-secondary disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Save size={14} /> Save Changes
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">Seller Type</label>
                                    <select
                                        value={formData.seller_type || 'solo'}
                                        onChange={e => setFormData({ ...formData, seller_type: e.target.value as any })}
                                        className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                    >
                                        <option value="solo">Solo Founder</option>
                                        <option value="indie">Indie Hacker</option>
                                        <option value="agency">Agency</option>
                                        <option value="team">VC Backed Team</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">Product Focus</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Micro-SaaS, AI Tools"
                                        value={formData.seller_product_focus || ''}
                                        onChange={e => setFormData({ ...formData, seller_product_focus: e.target.value })}
                                        className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Preferences & Stats */}
                <div className="space-y-8">

                    {/* 5. Preferences */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-textMain flex items-center gap-2">
                                <Settings size={20} className="text-textMuted" />
                                Preferences
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                <span className="text-sm font-medium text-textMain">Buyer Content</span>
                                <button
                                    onClick={() => togglePreference('show_buyer_content')}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.preferences?.show_buyer_content ? 'bg-accent-primary' : 'bg-gray-600'
                                        }`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.preferences?.show_buyer_content ? 'translate-x-5' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                <span className="text-sm font-medium text-textMain">Seller Tools</span>
                                <button
                                    onClick={() => togglePreference('show_seller_tools')}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.preferences?.show_seller_tools ? 'bg-accent-primary' : 'bg-gray-600'
                                        }`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.preferences?.show_seller_tools ? 'translate-x-5' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                <span className="text-sm font-medium text-textMain">Product Updates</span>
                                <button
                                    onClick={() => togglePreference('receive_updates')}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.preferences?.receive_updates ? 'bg-accent-primary' : 'bg-gray-600'
                                        }`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.preferences?.receive_updates ? 'translate-x-5' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSave('Preferences')}
                            disabled={isSaving}
                            className="w-full mt-6 py-2 rounded-xl bg-surface text-textMuted border border-border hover:bg-surfaceHighlight text-sm font-medium transition-colors"
                        >
                            Save Preferences
                        </button>
                    </div>

                    {/* 6. Account Details (Read-only) */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-display font-bold text-textMain mb-4">Account Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-textMuted">User ID</span>
                                <span className="font-mono text-textMain text-xs" title={profile.id}>
                                    {profile.id.substring(0, 8)}...
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-textMuted">Onboarding</span>
                                <span className={profile.onboarding_completed ? 'text-green-400' : 'text-amber-400'}>
                                    {profile.onboarding_completed ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-textMuted">Last Login</span>
                                <span className="text-textMain">Just now</span>
                            </div>
                            <div className="flex justify-between py-2 pt-4">
                                <button className="text-red-400 hover:text-red-300 text-xs font-bold uppercase transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
