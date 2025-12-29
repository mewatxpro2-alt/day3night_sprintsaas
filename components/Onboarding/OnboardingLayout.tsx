import React from 'react';

interface OnboardingLayoutProps {
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
    onSkip?: () => void;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    currentStep,
    totalSteps,
    children,
    onSkip
}) => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar */}
            <div className="w-full px-6 py-6 flex items-center justify-between">
                {/* Logo (Optional or explicit branding) */}
                <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                    <span className="font-display font-bold text-accent-primary">S</span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 max-w-xs mx-8">
                    <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Skip Button */}
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="text-sm text-textMuted hover:text-textMain transition-colors"
                    >
                        Skip
                    </button>
                )}
                {!onSkip && <div className="w-8" />} {/* Spacer */}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-full max-w-xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
