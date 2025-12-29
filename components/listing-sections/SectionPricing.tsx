import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../../types';
import Button from '../Button';
import { useAuth } from '../../hooks/useAuth';

interface SectionProps {
    listing: Listing;
}

const SectionPricing: React.FC<SectionProps> = ({ listing }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [selectedLicense, setSelectedLicense] = useState<'standard' | 'extended' | 'buyout'>('standard');

    const getPrice = () => {
        if (selectedLicense === 'extended') return listing.license_extended_price || listing.price * 5;
        if (selectedLicense === 'buyout') return listing.license_buyout_price || listing.price * 10;
        return listing.license_standard_price || listing.price;
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-border/60 overflow-hidden transform transition-all hover:shadow-lg mb-6">
            <div className="p-6">
                {/* Price Display */}
                <div className="mb-6 text-center border-b border-border/50 pb-6">
                    <p className="text-sm text-textMuted font-medium mb-1">
                        {selectedLicense === 'standard' ? 'Standard License' : selectedLicense === 'extended' ? 'Extended License' : 'Buyout License'}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-textMain">
                        <span className="text-5xl font-bold tracking-tighter text-black">${getPrice()}</span>
                    </div>
                    <p className="text-xs text-textMuted mt-2 flex items-center justify-center gap-1">
                        <Lock size={10} /> One-time payment. Lifetime access.
                    </p>
                </div>

                {/* License Selector */}
                <div className="space-y-2 mb-6">
                    {/* Standard */}
                    <button
                        onClick={() => setSelectedLicense('standard')}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedLicense === 'standard' ? 'bg-accent-primary/5 border-accent-primary shadow-sm' : 'bg-surface border-border opacity-70 hover:opacity-100'}`}
                    >
                        <div className="text-sm font-medium text-textMain">Standard</div>
                        <div className="text-xs text-textMuted">{listing.license_standard_max ? `Max ${listing.license_standard_max} copies` : 'Unlimited'}</div>
                    </button>

                    {/* Extended */}
                    {listing.license_extended_enabled && (
                        <button
                            onClick={() => setSelectedLicense('extended')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedLicense === 'extended' ? 'bg-accent-primary/5 border-accent-primary shadow-sm' : 'bg-surface border-border opacity-70 hover:opacity-100'}`}
                        >
                            <div className="text-sm font-medium text-textMain">Extended</div>
                            <div className="text-xs text-textMuted">Larger scale</div>
                        </button>
                    )}

                    {/* Buyout */}
                    {listing.license_buyout_enabled && (
                        <button
                            onClick={() => setSelectedLicense('buyout')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedLicense === 'buyout' ? 'bg-red-50/50 border-red-200 shadow-sm' : 'bg-surface border-border opacity-70 hover:opacity-100'}`}
                        >
                            <div className="text-sm font-medium text-textMain">Buyout Rights</div>
                            <div className="text-xs text-textMuted">Exclusive</div>
                        </button>
                    )}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    <Button
                        variant="primary"
                        className="w-full py-4 text-base shadow-xl shadow-accent-primary/20"
                        onClick={() => navigate(isAuthenticated ? `/checkout/${listing.id}` : '/signin')}
                    >
                        Purchase for ${getPrice()}
                    </Button>

                    <p className="text-[10px] text-center text-textMuted leading-tight px-4">
                        Includes source code & documentation.
                        <span className="block mt-1">100% Money-back guarantee.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SectionPricing;
