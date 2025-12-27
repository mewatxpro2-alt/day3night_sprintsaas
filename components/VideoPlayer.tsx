import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
    canWatchFull?: boolean;
    className?: string;
}

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    title,
    canWatchFull = false,
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();
    const { user } = useAuth(); // To check if user is logged in

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [showPreviewLimit, setShowPreviewLimit] = useState(false);

    // Limit logic: 30s for non-purchased users
    const PREVIEW_LIMIT = 30;
    // canWatchFull is now passed directly as prop

    // Handle mouse movement to show/hide controls
    const handleMouseMove = useCallback(() => {
        if (!isPlaying) return; // Don't show controls if not playing (just show big play button)

        setShowControls(true);
        setIsHovering(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
            setIsHovering(false);
        }, 2000);
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // Time update & Limit check
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;

        // Check limit
        if (!canWatchFull && current >= PREVIEW_LIMIT) {
            videoRef.current.pause();
            setIsPlaying(false);
            setCurrentTime(PREVIEW_LIMIT);
            setShowPreviewLimit(true);
            return;
        }

        setCurrentTime(current);
    };

    const handleDurationChange = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // Play/Pause
    const togglePlay = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;

        if (showPreviewLimit) return; // Cannot play if limit reached

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setShowControls(false); // Hide controls shortly after playing
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowControls(false); // Hide controls when paused (show big button instead)
        }
    }, [showPreviewLimit]);

    // Seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const time = parseFloat(e.target.value);

        // Prevent seeking past limit for non-purchasers
        if (!canWatchFull && time > PREVIEW_LIMIT) {
            videoRef.current.currentTime = PREVIEW_LIMIT;
            setCurrentTime(PREVIEW_LIMIT);
            setShowPreviewLimit(true);
            setIsPlaying(false);
            return;
        }

        videoRef.current.currentTime = time;
        setCurrentTime(time);
        setShowPreviewLimit(false); // Reset limit warning if seeking back
    };

    // Volume
    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const val = parseFloat(e.target.value);
        videoRef.current.volume = val;
        setVolume(val);
        setIsMuted(val === 0);
    };

    // Fullscreen
    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isHovering && !document.fullscreenElement) return;
            // Only capture if hovering or fullscreen (to avoid blocking page scroll etc)

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    if (videoRef.current) videoRef.current.currentTime += 5;
                    break;
                case 'ArrowLeft':
                    if (videoRef.current) videoRef.current.currentTime -= 5;
                    break;
                case 'f':
                    toggleFullscreen(e as any);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, isHovering, toggleFullscreen]);


    return (
        <div
            ref={containerRef}
            className={`relative group bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain bg-black"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Dark Overlay gradient for controls visibility */}
            <div className={`
                absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none transition-opacity duration-300
                ${(showControls && isPlaying) ? 'opacity-100' : 'opacity-0'}
            `} />

            {/* Center Play Button (Idle or Paused) */}
            {!isPlaying && !showPreviewLimit && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-[1px]">
                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)] group/play hover:scale-110 hover:bg-accent-primary hover:border-accent-primary hover:text-black hover:shadow-[0_0_40px_rgba(74,222,128,0.4)]"
                    >
                        <Play size={32} className="ml-1 fill-current group-hover/play:scale-110 transition-transform" />
                    </button>
                    {/* Optional: Add "Watch Demo" text below button if desired, but keeping minimal as requested */}
                </div>
            )}

            {/* Limit Reached Overlay */}
            {showPreviewLimit && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm animate-fade-in p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center mb-4">
                        <Lock size={32} className="text-accent-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Preview Ended</h3>
                    <p className="text-white/70 mb-6 max-w-md">
                        Purchase this blueprint to watch the full walkthrough, access source code, and get seller support.
                    </p>
                    <button
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.currentTime = 0;
                                setShowPreviewLimit(false);
                                setIsPlaying(true);
                                videoRef.current.play();
                            }
                        }}
                        className="flex items-center gap-2 text-sm text-accent-primary hover:text-white transition-colors uppercase tracking-widest font-bold"
                    >
                        <RotateCcw size={16} />
                        Replay Preview
                    </button>
                </div>
            )}

            {/* Top Bar (Title) - Only show when controls are visible AND playing */}
            <div className={`
                absolute top-0 left-0 right-0 p-6 flex justify-between items-start transition-transform duration-300 z-10
                ${(showControls && isPlaying) ? 'translate-y-0' : '-translate-y-full'}
            `}>
                <div className="flex flex-col">
                    {title && <h3 className="text-white font-medium text-lg drop-shadow-md">{title}</h3>}
                    {!canWatchFull && (
                        <span className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 mt-1">
                            <Lock size={12} />
                            Preview Mode (30s)
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom Controls Bar - Only show when controls are visible AND playing */}
            <div className={`
                absolute bottom-4 left-4 right-4 transition-all duration-300 z-10
                ${(showControls && isPlaying) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
            `}>
                {/* Glass Panel */}
                <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-lg">

                    {/* Progress Bar */}
                    <div className="group/timeline relative h-2 w-full cursor-pointer flex items-center">
                        {/* Background Track */}
                        <div className="absolute inset-0 bg-white/20 rounded-full" />

                        {/* Buffer/Limit Bar (for preview) */}
                        {!canWatchFull && duration > 0 && (
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-red-500/20 rounded-full z-[1]"
                                style={{ width: `${(PREVIEW_LIMIT / duration) * 100}%` }}
                            />
                        )}

                        {/* Played Progress */}
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-accent-primary rounded-full z-[2] transition-all duration-100"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/timeline:opacity-100 transition-opacity transform scale-0 group-hover/timeline:scale-100" />
                        </div>

                        {/* Input Range (Hidden but functional) */}
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[3]"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-accent-primary transition-colors focus:outline-none"
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="text-white hover:text-white/80">
                                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-16 h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Time Display */}
                            <span className="text-xs font-mono font-medium text-white/80 tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration || 0)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-white/80 transition-colors"
                            >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
