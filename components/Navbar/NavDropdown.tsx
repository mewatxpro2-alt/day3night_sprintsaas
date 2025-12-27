
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NavGroup, NavItem } from './config';

interface NavDropdownProps {
    group: NavGroup;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ group }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Safe delay to prevent flickering
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // 150ms grace period
    };

    // Close on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Close on click outside and Esc key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    return (
        <div
            className="relative flex items-center h-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
        >
            <button
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-3 rounded-lg
          ${isOpen ? 'text-accent-primary bg-accent-primary/5' : 'text-textMuted hover:text-textMain hover:bg-white/5'}`}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                {group.label}
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 mt-[1px] ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Content */}
            <div
                className={`absolute top-full left-0 mt-2 w-max min-w-[200px] bg-surface border border-border/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl overflow-hidden transition-all duration-200 origin-top-left z-50
          ${isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                        : 'opacity-0 -translate-y-2 pointer-events-none scale-95'
                    }`}
            >
                {/* Simple List */}
                {group.items && (
                    <div className="p-1.5 w-64">
                        {group.items.map((item) => (
                            <DropdownItem key={item.path} item={item} onClick={() => setIsOpen(false)} />
                        ))}
                    </div>
                )}

                {/* Multi-Section (Grid) */}
                {group.sections && (
                    <div className="grid grid-cols-2 gap-2 p-2 w-[520px] bg-surface/50">
                        {group.sections.map((section) => (
                            <div key={section.label} className="p-2">
                                <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-2 px-3 opacity-60">
                                    {section.label}
                                </h4>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => (
                                        <DropdownItem key={item.path} item={item} onClick={() => setIsOpen(false)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DropdownItem: React.FC<{ item: NavItem, onClick: () => void }> = ({ item, onClick }) => {
    const Icon = item.icon;

    return (
        <Link
            to={item.path}
            onClick={onClick}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surfaceHighlight transition-colors group"
        >
            {Icon && (
                <div className="mt-0.5 text-textMuted group-hover:text-accent-primary transition-colors">
                    <Icon size={18} strokeWidth={2} />
                </div>
            )}
            <div>
                <div className="text-sm font-medium text-textMain group-hover:text-accent-primary transition-colors leading-none mb-1">
                    {item.label}
                </div>
                {item.description && (
                    <div className="text-xs text-textMuted/80 line-clamp-1 leading-tight group-hover:text-textMuted">
                        {item.description}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default NavDropdown;
