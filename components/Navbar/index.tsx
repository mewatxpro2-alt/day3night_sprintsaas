
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import Logo from '../Logo';
import Button from '../Button';
import ThemeToggle from '../ThemeToggle';
import { MAIN_NAV } from './config';
import NavDropdown from './NavDropdown';
import MobileMenu from './MobileMenu';
import { UserMenu } from './UserMenu';

const Navbar: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { isAdmin } = useIsAdmin();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-[1400px] mx-auto px-6 h-18 flex items-center justify-between">

                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            {/* Desktop Logo */}
                            <div className="hidden md:block translate-y-[1px]">
                                <Logo variant="compact" />
                            </div>
                            {/* Mobile Logo */}
                            <div className="md:hidden">
                                <Logo variant="icon" />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {MAIN_NAV.map((group) => (
                                <NavDropdown key={group.id} group={group} />
                            ))}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate('/submit')}
                                        className="hidden lg:flex"
                                    >
                                        Submit Kit
                                    </Button>
                                    <UserMenu />
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/signin')}
                                        className="text-textMuted hover:text-textMain"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate('/signup')}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden items-center gap-3">
                            {isAuthenticated && (
                                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-bold text-accent-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(true)}>
                                    <Menu size={18} />
                                </div>
                            )}
                            {!isAuthenticated && (
                                <button
                                    className="p-2 text-textMain"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={24} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                isAdmin={isAdmin}
            />
        </>
    );
};

export default Navbar;
