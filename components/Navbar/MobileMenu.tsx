
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronDown, LogOut } from 'lucide-react';
import { NavGroup, MAIN_NAV } from './config';
import Button from '../Button';
import { useAuth } from '../../hooks/useAuth';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, isAdmin }) => {
    const { user, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    if (!isOpen) return null;

    const toggleGroup = (id: string) => {
        setExpandedGroup(expandedGroup === id ? null : id);
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
        navigate('/');
    };

    return (
        <div className="fixed inset-0 z-[100] md:hidden animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border animate-slide-in-right overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-display font-medium text-lg">Menu</span>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-textMuted hover:text-textMain transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {MAIN_NAV.map((group) => (
                            <MobileNavGroup
                                key={group.id}
                                group={group}
                                isExpanded={expandedGroup === group.id}
                                onToggle={() => toggleGroup(group.id)}
                                onClose={onClose}
                            />
                        ))}
                    </div>

                    <hr className="border-border my-6" />

                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-sm">
                                    {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-textMain">
                                        {user?.user_metadata?.full_name || 'User'}
                                    </div>
                                    <div className="text-xs text-textMuted max-w-[200px] truncate">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { navigate('/dashboard'); onClose(); }}
                                className="block w-full text-left px-2 py-2 text-textMuted hover:text-textMain"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => { navigate('/seller'); onClose(); }}
                                className="block w-full text-left px-2 py-2 text-accent-primary font-medium"
                            >
                                Seller Dashboard
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => { navigate('/admin'); onClose(); }}
                                    className="block w-full text-left px-2 py-2 text-blue-400 font-medium"
                                >
                                    Admin Panel
                                </button>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="block w-full text-left px-2 py-2 text-red-400 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button onClick={() => { navigate('/signin'); onClose(); }} variant="ghost" className="w-full justify-start">
                                Sign In
                            </Button>
                            <Button onClick={() => { navigate('/signup'); onClose(); }} className="w-full">
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MobileNavGroup: React.FC<{
    group: NavGroup;
    isExpanded: boolean;
    onToggle: () => void;
    onClose: () => void;
}> = ({ group, isExpanded, onToggle, onClose }) => {
    return (
        <div className="border-b border-border/50 last:border-0 pb-2">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-2 text-left text-lg font-medium text-textMain"
            >
                {group.label}
                <ChevronDown
                    size={18}
                    className={`text-textMuted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-2 pb-4 space-y-1 ml-2 pl-4 border-l-2 border-border">
                    {group.items?.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className="block py-2 text-textMuted hover:text-textMain hover:pl-2 transition-all"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {group.sections?.map((section) => (
                        <div key={section.label} className="py-2">
                            <div className="text-xs font-semibold text-textMuted/50 uppercase tracking-wider mb-2">
                                {section.label}
                            </div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className="block py-2 text-textMuted hover:text-textMain hover:pl-2 transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
