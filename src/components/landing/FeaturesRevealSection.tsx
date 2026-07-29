"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

// Unsplash images for the marquee background — education / tech / campus themed
const marqueeImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=300&fit=crop",
];

const Card = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-white/[0.08] group/canvas-card flex items-center justify-center max-w-sm w-full mx-auto p-4 relative h-[30rem] rounded-2xl bg-neutral-950/80 backdrop-blur-sm overflow-hidden cursor-pointer"
    >
      {/* Corner icons */}
      <Icon className="absolute h-5 w-5 -top-2.5 -left-2.5 text-white/20" />
      <Icon className="absolute h-5 w-5 -bottom-2.5 -left-2.5 text-white/20" />
      <Icon className="absolute h-5 w-5 -top-2.5 -right-2.5 text-white/20" />
      <Icon className="absolute h-5 w-5 -bottom-2.5 -right-2.5 text-white/20" />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 text-center px-4">
        <div className="group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex flex-col items-center justify-center gap-4">
          {icon}
          <h3 className="text-white text-xl font-bold">{title}</h3>
          <p className="text-neutral-400 text-sm max-w-xs">{description}</p>
        </div>
        <h3 className="text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 font-bold group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h3>
      </div>
    </div>
  );
};

const Icon = ({ className, ...rest }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className={className}
    {...rest}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

export default function FeaturesRevealSection() {
  return (
    <section className="w-full bg-black relative overflow-hidden">

      {/* ─── 3D Marquee Background ─── */}
      <div className="absolute inset-0 z-0 opacity-20">
        <ThreeDMarquee images={marqueeImages} />
      </div>

      {/* Dark overlay so cards are readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-black/80 to-black" />

      {/* ─── Foreground Content ─── */}
      <div className="relative z-10 py-24">
        <div className="text-center mb-16 px-6">
          <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Why XITE
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Built for what matters
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mx-auto px-8 max-w-7xl">
          <Card
            title="Build Beautiful Websites"
            description="Create professional college websites using a visual drag-and-drop builder. Customize every section without writing code."
            icon={
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            }
          >
            <CanvasRevealEffect
              animationSpeed={5.1}
              containerClassName="bg-emerald-900"
            />
          </Card>

          <Card
            title="Real-Time Analytics"
            description="Live dashboards for student performance, attendance trends, and financial health."
            icon={
              <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [236, 72, 153],
                [232, 121, 249],
              ]}
              dotSize={2}
            />
            <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50" />
          </Card>

          <Card
            title="Ready-Made Templates"
            description="Choose from professionally designed templates built specifically for educational institutions."
            icon={
              <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            }
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-sky-600"
              colors={[[125, 211, 252]]}
            />
          </Card>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </section>
  );
}
