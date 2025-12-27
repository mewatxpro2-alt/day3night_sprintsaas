import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "relative group inline-flex items-center justify-center font-semibold transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg tracking-tight hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    // Primary: Action (Green) - Black text for better contrast
    primary: "bg-accent-primary text-black shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-accent-primary/90 hover:shadow-[0_4px_12px_-4px_rgba(var(--accent-primary)/0.4)]",

    // Secondary: Surface based
    secondary: "bg-surface text-textMain hover:bg-surfaceHighlight shadow-sm border border-border",

    // Ghost: No background until hover
    ghost: "text-textMuted hover:bg-surfaceHighlight hover:text-textMain hover:translate-y-0",

    // Outline: Very subtle border
    outline: "border border-border text-textSecondary hover:text-textMain hover:border-borderHover hover:bg-surfaceHighlight",

    // Danger (Special case)
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-[15px] gap-2.5"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-70" />}
      {!isLoading && icon && (
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5 opacity-80 group-hover:opacity-100">
          {icon}
        </span>
      )}
      <span className="relative top-[0.5px]">{children}</span>
    </button>
  );
};

export default Button;