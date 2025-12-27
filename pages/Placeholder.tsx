import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Construction } from 'lucide-react';

const Placeholder: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pageTitle = searchParams.get('title') || 'Coming Soon';

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in pb-20 pt-20">
            <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight border border-border flex items-center justify-center mb-6 shadow-premium">
                <Construction className="text-accent-primary" size={32} />
            </div>

            <h1 className="text-3xl font-display font-bold text-textMain mb-3">
                {pageTitle}
            </h1>

            <p className="text-textMuted max-w-md mx-auto mb-8 leading-relaxed">
                We're currently building this page. It will be part of our next dedicated update for the marketplace.
            </p>

            <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => navigate('/mvp-kits')}>
                    Browse Existing Kits
                </Button>
            </div>
        </div>
    );
};

export default Placeholder;
