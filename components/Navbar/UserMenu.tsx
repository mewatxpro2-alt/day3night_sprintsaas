
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useIsAdmin';

export const UserMenu: React.FC = () => {
    const { user, signOut } = useAuth();
    const { isAdmin } = useIsAdmin();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
        navigate('/');
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surfaceHighlight transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-primary">
                        {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                    </span>
                </div>
                <div className="hidden lg:block text-left">
                    <span className="block text-sm text-textMain font-medium max-w-[100px] truncate">
                        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                    </span>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl py-2 z-50 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-textMain truncate">
                            {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-textMuted truncate">
                            {user.email}
                        </p>
                    </div>

                    <div className="py-2">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => { navigate('/admin'); setIsOpen(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:text-blue-300 hover:bg-surfaceHighlight transition-colors font-medium"
                                >
                                    Admin Panel
                                </button>
                                <hr className="my-2 border-border" />
                            </>
                        )}

                        <button
                            onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors"
                        >
                            Buyer Dashboard
                        </button>
                        <button
                            onClick={() => { navigate('/seller'); setIsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-accent-primary hover:bg-surfaceHighlight transition-colors font-medium"
                        >
                            Seller Dashboard
                        </button>
                        <button
                            onClick={() => { navigate('/submit'); setIsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors lg:hidden"
                        >
                            Submit Kit
                        </button>
                    </div>

                    <div className="border-t border-border pt-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-surfaceHighlight transition-colors flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
