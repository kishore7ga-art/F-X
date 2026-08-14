"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Layout, LogIn, UserPlus, Shield, Sparkles } from "lucide-react";

const TOTAL_FRAMES = 300;
const FRAME_BASE = "/frames/xite-intro/ezgif-frame-";

function getFrameSrc(index: number): string {
  const num = String(index).padStart(3, "0");
  return `${FRAME_BASE}${num}.jpg`;
}

export default function XiteIntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Preload all frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        loaded++;
        if (loaded === 1) drawFrame(0);
      };
      images.push(img);
    }

    imagesRef.current = images;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgAspect > canvasAspect) {
      sw = img.naturalHeight * canvasAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / canvasAspect;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // Scroll handler
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / sectionHeight);

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * (TOTAL_FRAMES - 1))
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  return (
    <section
      ref={sectionRef}
      style={{ height: "600vh" }}
      className="relative bg-black"
    >
      {/* ─── TOP GLASS NAVIGATION HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 backdrop-blur-md bg-black/40 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xs shadow-lg shadow-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            XITE
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <Link
            href="/editor/greenfield"
            className="hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Editor Tool</span>
          </Link>
          <Link
            href="/login"
            className="hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/request-access"
            className="hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Request Access</span>
          </Link>
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Studio</span>
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition hidden sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/editor/greenfield"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:brightness-110 active:scale-95 transition"
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Open Editor</span>
          </Link>
        </div>
      </header>

      {/* Sticky canvas that stays in viewport while scrolling */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      {/* ─── BOTTOM FLOATING QUICK NAVIGATION BAR ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl backdrop-blur-xl bg-slate-900/80 border border-white/15 rounded-2xl p-2.5 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* 1. Open Editor */}
          <Link
            href="/editor/greenfield"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-2.5 text-xs font-bold transition shadow-md shadow-blue-600/30 text-center"
          >
            <Layout className="h-4 w-4 shrink-0" />
            <span>Editor Tool</span>
          </Link>

          {/* 2. Login */}
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 text-xs font-semibold transition text-center"
          >
            <LogIn className="h-4 w-4 shrink-0 text-blue-400" />
            <span>Sign In</span>
          </Link>

          {/* 3. Register */}
          <Link
            href="/request-access"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 text-xs font-semibold transition text-center"
          >
            <UserPlus className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Register</span>
          </Link>

          {/* 4. Admin Studio */}
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 text-xs font-semibold transition text-center"
          >
            <Shield className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Admin</span>
          </a>
        </div>
      </div>
    </section>
  );
}
