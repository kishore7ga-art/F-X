"use client";

import React from "react";
import { motion, Variants } from "motion/react";

export type AnimationVariant =
  | "fade-up"
  | "scale-up"
  | "slide-left"
  | "slide-right"
  | "flip-3d"
  | "blur-reveal"
  | "bounce-up"
  | "rotate-in";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: AnimationVariant;
}

const animationVariants: Record<AnimationVariant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.86 },
    visible: { opacity: 1, scale: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -90 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 90 },
    visible: { opacity: 1, x: 0 },
  },
  "flip-3d": {
    hidden: { opacity: 0, rotateX: 28, scale: 0.9, y: 40 },
    visible: { opacity: 1, rotateX: 0, scale: 1, y: 0 },
  },
  "blur-reveal": {
    hidden: { opacity: 0, filter: "blur(14px)", y: 30 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  "bounce-up": {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0 },
  },
  "rotate-in": {
    hidden: { opacity: 0, rotateZ: -5, scale: 0.92, y: 40 },
    visible: { opacity: 1, rotateZ: 0, scale: 1, y: 0 },
  },
};

export function SectionWrapper({
  children,
  id,
  className,
  variant = "fade-up",
}: SectionWrapperProps) {
  const isSpring = variant === "bounce-up" || variant === "slide-left" || variant === "slide-right";

  return (
    <div style={{ perspective: "1200px" }}>
      <motion.div
        id={id}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={animationVariants[variant]}
        transition={
          isSpring
            ? { type: "spring", stiffness: 100, damping: 16, mass: 0.8 }
            : { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
