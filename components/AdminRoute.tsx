import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

const ADMIN_EMAIL = 'tadmin@gmail.com';

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // Wait for auth to fully load before making any decisions
    if (loading) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-bounce">
                        <div className="w-4 h-4 bg-background rounded-sm" />
                    </div>
                    <p className="text-textMuted font-mono text-sm tracking-widest">LOADING ADMIN</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Check admin status directly here instead of using hook
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
