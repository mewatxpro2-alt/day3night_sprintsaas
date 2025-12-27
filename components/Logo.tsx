import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
    variant?: 'primary' | 'compact' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'primary', size = 'md', className = '' }) => {
    const navigate = useNavigate();

    // Size mapping
    const sizeClasses = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
    };

    const iconSizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
    };

    // The "Sprint Bolt" Icon - Minimal Geometric S/Arrow
    const LogoIcon = () => (
        <svg
            viewBox="0 0 32 32"
            className={`${iconSizeClasses[size]} text-accent-primary flex-shrink-0`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Top Shape (Forward Motion) */}
            <path
                d="M6 16L12 4H26L20 16H6Z"
                fill="currentColor"
                className="opacity-90"
            />
            {/* Bottom Shape (Interlocked) */}
            <path
                d="M26 16L20 28H6L12 16H26Z"
                fill="currentColor"
                fillOpacity="0.6"
            />
        </svg>
    );

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <a
            href="/"
            onClick={handleClick}
            className={`group flex items-center gap-2.5 font-display font-bold text-gray-900 dark:text-white select-none ${className}`}
            aria-label="SprintSaaS Home"
        >
            <div className="relative flex items-center justify-center">
                <LogoIcon />
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {variant !== 'icon' && (
                <span
                    className={`
            ${textSizeClasses[size]} 
            tracking-tight
            ${variant === 'compact' ? 'hidden md:block' : ''}
          `}
                >
                    SprintSaaS
                </span>
            )}
        </a>
    );
};

export default Logo;
