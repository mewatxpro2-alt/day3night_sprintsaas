import React from 'react';
import Button from '../components/Button';
import { WifiOff, RotateCcw, Home } from 'lucide-react';

interface ErrorPageProps {
  type: 'offline' | '404';
  onRetry?: () => void;
  onHome?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ type, onRetry, onHome }) => {
  const isOffline = type === 'offline';

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* THE 3D SPILLED PAINT ANIMATION */}
      <div className="relative w-[400px] h-[300px] mb-8">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            {/* 3D Can Gradients */}
            <linearGradient id="canSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="40%" stopColor="#52525B" />
              <stop offset="60%" stopColor="#71717A" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>
            
            <linearGradient id="canInside" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#09090B" />
               <stop offset="100%" stopColor="#18181B" />
            </linearGradient>

            {/* Liquid Gradients */}
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#D1F25E" />
               <stop offset="100%" stopColor="#B8D64D" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <style>
            {`
              /* Overall Container Scale */
              .scene {
                transform-origin: center center;
              }

              /* 1. Can Tipping Animation */
              .can-container {
                transform-origin: 200px 180px;
                animation: tipCan 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
              }

              /* 2. Liquid Bulging (Enlarging at rim) */
              .liquid-bulge {
                transform-origin: 200px 180px; /* Center of can opening roughly */
                transform: scale(0);
                opacity: 1;
                animation: bulgeLiquid 1s ease-out 1.2s forwards;
              }

              /* 3. Liquid Spilling (Slow Motion Drop) */
              .liquid-spill-path {
                stroke-dasharray: 400;
                stroke-dashoffset: 400;
                animation: spillLiquid 2s ease-in-out 2s forwards;
              }
              
              /* 4. Puddle Expansion */
              .puddle {
                transform-origin: 200px 260px;
                transform: scale(0);
                opacity: 0;
                animation: expandPuddle 2s ease-out 2.8s forwards;
              }
              
              /* Text Slide In */
              .text-4 {
                 opacity: 0;
                 transform: translateX(0);
                 animation: slideInText 1s ease-out 0.5s forwards;
              }

              @keyframes tipCan {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-70deg) translateX(-20px) translateY(10px); }
              }

              @keyframes bulgeLiquid {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
              }

              @keyframes spillLiquid {
                0% { stroke-dashoffset: 400; opacity: 1;}
                100% { stroke-dashoffset: 0; opacity: 1;}
              }

              @keyframes expandPuddle {
                 0% { transform: scale(0); opacity: 0; }
                 100% { transform: scale(1); opacity: 1; }
              }

              @keyframes slideInText {
                 0% { opacity: 0; transform: translateY(20px); }
                 100% { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>

          {/* Background Numbers "4" (Left) */}
          <text x="60" y="180" fontSize="180" fontWeight="bold" fill="#3F3F46" opacity="0.5" className="text-4" style={{ transformOrigin: 'center' }}>
            4
          </text>
          
           {/* Background Numbers "4" (Right) */}
          <text x="280" y="180" fontSize="180" fontWeight="bold" fill="#3F3F46" opacity="0.5" className="text-4" style={{ animationDelay: '0.7s', transformOrigin: 'center' }}>
            4
          </text>

          {/* The Puddle (Renders behind can initially, but logic places it below) */}
          <ellipse cx="200" cy="270" rx="120" ry="15" fill="#D1F25E" className="puddle" filter="url(#glow)" />

          {/* The Can Group */}
          <g className="can-container">
             
             {/* Can Body (Cylinder Side) */}
             <path 
               d="M160 80 L160 200 A 40 20 0 0 0 240 200 L240 80" 
               fill="url(#canSide)" 
             />
             
             {/* Can Bottom (Visual only if rotated differently, mostly hidden) */}
             <ellipse cx="200" cy="200" rx="40" ry="20" fill="#27272A" />

             {/* Can Rim/Opening */}
             <g>
                {/* Outer Rim */}
                <ellipse cx="200" cy="80" rx="40" ry="20" fill="#E4E4E7" />
                {/* Inner Void */}
                <ellipse cx="200" cy="80" rx="36" ry="18" fill="url(#canInside)" />
             </g>

             {/* The Liquid Inside (The Bulge) */}
             {/* Positioned at the mouth of the can */}
             <circle cx="200" cy="80" r="34" fill="#D1F25E" className="liquid-bulge" filter="url(#glow)" />
             
             {/* Face on Can (To match the playful look) */}
             <g transform="translate(180, 130) rotate(90)">
                <circle cx="0" cy="0" r="4" fill="#18181B" opacity="0.6" />
                <circle cx="0" cy="20" r="4" fill="#18181B" opacity="0.6" />
                <rect x="10" y="5" width="4" height="10" rx="2" fill="#18181B" opacity="0.6" />
             </g>

          </g>

          {/* The Spilling Liquid Stream (Animated Path) */}
          {/* Need to position this carefully relative to the tipped can position */}
          {/* When tipped -70deg, the mouth (200,80) moves left and down. */}
          {/* We cheat slightly by starting the stream path where the can mouth ends up visually */}
          <g style={{ filter: 'url(#glow)' }}>
             <path 
               d="M165 150 Q 160 200 180 220 T 200 270" 
               fill="none" 
               stroke="#D1F25E" 
               strokeWidth="30" 
               strokeLinecap="round"
               className="liquid-spill-path"
               opacity="0"
             />
          </g>

        </svg>
      </div>

      {/* Text Content */}
      <div className="text-center z-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tight">
          Oops!
        </h1>
        <p className="text-xl text-white/80 font-medium mb-2">
          Who spilled the {isOffline ? 'wifi' : 'paint'}?
        </p>
        <p className="text-textMuted text-sm mb-10 max-w-md mx-auto leading-relaxed">
          {isOffline 
            ? "Your internet connection seems to have dropped. Check your cables and try again." 
            : "The page you are looking for has spilled into the void or never existed."}
        </p>

        <div className="flex gap-4 justify-center">
          {onRetry && (
             <Button onClick={onRetry} icon={<RotateCcw size={16} />} size="lg" className="shadow-[0_0_20px_-5px_rgba(209,242,94,0.4)]">
               {isOffline ? 'Retry Connection' : 'Refresh Page'}
             </Button>
          )}
          {onHome && (
             <Button variant="outline" onClick={onHome} icon={<Home size={16} />} size="lg">
               Back Home
             </Button>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      {isOffline && (
        <div className="absolute top-10 right-10 p-4 rounded-full bg-white/5 border border-white/10 animate-pulse">
           <WifiOff className="text-textMuted" />
        </div>
      )}
    </div>
  );
};

export default ErrorPage;