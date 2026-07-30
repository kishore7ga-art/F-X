"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Stage (a): the bare canvas, proving the plumbing before any concept lands.
 *
 * Deliberately one shape and three lights. What is being checked here is not how
 * it looks — it is that WebGL initialises inside the hero's frame at the right
 * size, that the render loop runs, that nothing is imported on the server, and
 * that the layout does not move when the canvas replaces the screenshot. Those
 * are the things that are painful to retrofit; a material is not.
 *
 * This module must never be imported directly by a page. It reaches for
 * `window` through three the moment it is evaluated, so it is loaded through
 * `HeroStage`, which is the only place `ssr: false` is applied.
 */

/** The slab the editor screenshot used to be, at the same 15:8 proportion. */
const PANEL: [number, number, number] = [2.6, 1.386, 0.07];

function Placeholder({ reduced }: { reduced: boolean }) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (reduced || !mesh.current) return;

    /**
     * A sway, not a spin.
     *
     * Continuous rotation is the single clearest tell of a Three.js demo — it
     * reads as "look, 3D" rather than as a product. This turns about a tenth of
     * a radian either side over roughly twenty seconds, which registers as the
     * page being alive without ever asking to be watched.
     */
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = Math.sin(t * 0.32) * 0.1;
    mesh.current.rotation.x = Math.sin(t * 0.21) * 0.045;
  });

  return (
    <mesh ref={mesh} castShadow>
      <boxGeometry args={PANEL} />
      {/*
        Neutral on purpose, and the one thing here I would not carry into stage
        (b) without asking: the live hero is painted in indigo/purple gradients
        while the documented palette says this surface is monochrome with a
        single accent. A grey slab is correct under either answer.
      */}
      <meshStandardMaterial color="#17171a" roughness={0.42} metalness={0.16} />
    </mesh>
  );
}

export default function HeroCanvas() {
  const reduced = useReducedMotion();

  return (
    <Canvas
      /**
       * Capped at 2. Uncapped, a phone reporting devicePixelRatio 3 renders nine
       * times the pixels of a laptop for a difference nobody can see, and it is
       * the first thing to make a 3D hero feel hot and slow rather than premium.
       */
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.4], fov: 36 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      /**
       * `demand` renders one frame and then stops, which is exactly what
       * reduced-motion should mean here: the scene is still there, still lit,
       * still three-dimensional — it simply holds still. Blanking it would
       * remove information rather than remove motion.
       */
      frameloop={reduced ? "demand" : "always"}
    >
      {/*
        Soft key, dim fill, low ambient. Bright flat lighting is the other half
        of why 3D reads as a demo; almost all of the perceived quality of a scene
        like this comes from one directional light being clearly in charge.
      */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 4, 5]} intensity={2.1} />
      <directionalLight position={[-4, -1.5, -2]} intensity={0.35} />

      <Placeholder reduced={reduced} />
    </Canvas>
  );
}
