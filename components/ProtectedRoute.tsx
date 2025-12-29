import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading, profile } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 bg-accent-primary rounded-xl flex items-center justify-center animate-bounce">
                        <div className="w-4 h-4 bg-background rounded-sm" />
                    </div>
                    <p className="text-textMuted font-mono text-sm tracking-widest">LOADING</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
    }

    // Redirect new users to onboarding
    // Only if profile loaded and onboarding not completed
    if (profile) {
        // console.log('[ProtectedRoute] Checking onboarding:', {
        //     completed: profile.onboarding_completed,
        //     path: location.pathname
        // });

        if (profile.onboarding_completed === false && location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
