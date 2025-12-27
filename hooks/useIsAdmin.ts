import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const ADMIN_EMAIL = 'tadmin@gmail.com';

export const useIsAdmin = () => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsAdmin(false);
            setIsLoading(false);
            return;
        }

        // Simple email check - matches AdminRoute.tsx
        const adminStatus = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        setIsAdmin(adminStatus);
        setIsLoading(false);
    }, [user]);

    return { isAdmin, isLoading };
};

