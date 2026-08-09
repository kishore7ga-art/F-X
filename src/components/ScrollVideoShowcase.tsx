"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Pause, Volume2, VolumeX, Video, Maximize2 } from "lucide-react";

export default function ScrollVideoShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !videoRef.current || !cardRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      });

      tl.fromTo(
        cardRef.current,
        { scale: 0.85, borderRadius: "2rem", opacity: 0.5 },
        { scale: 1, borderRadius: "1rem", opacity: 1, ease: "power2.out" }
      );

      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        if (!video.duration) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            if (video.duration) {
              video.currentTime = self.progress * video.duration;
            }
          },
        });
      };

      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    },
    { scope: sectionRef }
  );

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen py-20 px-6 flex flex-col items-center justify-center relative bg-neutral-950/80 z-10"
    >
      <div className="max-w-4xl w-full text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-4">
          <Video className="w-3.5 h-3.5" />
          GSAP ScrollTrigger + HTML5 Video
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Scroll-Synced Video Playback
        </h2>
        <p className="text-neutral-400 text-lg max-w-xl mx-auto">
          HTML5 native video timeline scrubbed dynamically via Lenis &amp; GSAP ScrollTrigger.
        </p>
      </div>

      <div
        ref={cardRef}
        className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-indigo-500/10 bg-neutral-900 group"
      >
        <video
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Video Control Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
