"use client";

import { forwardRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Film } from "lucide-react";

interface CinematicVideoStageProps {
  videoSrc?: string;
  posterSrc?: string;
}

const CinematicVideoStage = forwardRef<HTMLVideoElement, CinematicVideoStageProps>(
  (
    {
      videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      posterSrc,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
      const video = typeof ref === "function" ? null : ref?.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
      const video = typeof ref === "function" ? null : ref?.current;
      if (!video) return;

      video.muted = !isMuted;
      setIsMuted(!isMuted);
    };

    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#000000] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,1)] group">
        {/* Specular Edge Refraction */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

        {/* Native HTML5 Video Element */}
        <video
          ref={ref}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="auto"
          aria-label="XITE Cinematic Engine Video Demonstration"
          className="w-full h-full object-cover transform-gpu will-change-transform scale-105"
        />

        {/* Dark Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/60 pointer-events-none z-10" />

        {/* Subtle Minimal UI Controls Bar */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={togglePlay}
            type="button"
            className="p-2.5 rounded-full bg-black/60 border border-white/[0.12] backdrop-blur-md text-white hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all cursor-pointer"
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>

          <button
            onClick={toggleMute}
            type="button"
            className="p-2.5 rounded-full bg-black/60 border border-white/[0.12] backdrop-blur-md text-white hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all cursor-pointer"
            aria-label={isMuted ? "Unmute Video" : "Mute Video"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white/70" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Video Badge */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/[0.1] backdrop-blur-md text-[11px] font-mono tracking-wider text-neutral-400">
          <Film className="w-3 h-3 text-white/80" />
          <span>XITE CINEMATIC STAGE</span>
        </div>
      </div>
    );
  }
);

CinematicVideoStage.displayName = "CinematicVideoStage";

export default CinematicVideoStage;
