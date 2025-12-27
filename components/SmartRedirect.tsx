import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { useAuth } from '../hooks/useAuth';

/**
 * Component that handles smart post-login redirection
 * - Sellers with activity → /seller
 * - New users/buyers → /mvp-kits
 * - Respects 'from' location if present
 */
export const SmartRedirect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { hasSellerActivity, loading } = useUserRole();

    useEffect(() => {
        if (!isAuthenticated || loading) return;

        // Check if there's a specific redirect target
        const from = (location.state as any)?.from;

        if (from) {
            // Respect explicit redirect requests
            navigate(from, { replace: true });
        } else {
            // Smart default routing
            const destination = hasSellerActivity ? '/seller' : '/mvp-kits';
            navigate(destination, { replace: true });
        }
    }, [isAuthenticated, loading, hasSellerActivity, navigate, location]);

    return null;
};
