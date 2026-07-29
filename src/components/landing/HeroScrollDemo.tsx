"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden bg-black py-0 -my-6">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
              Unleash the Power of <br />
              <span className="text-4xl md:text-[5.5rem] font-black mt-2 leading-none bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Visual Editing
              </span>
            </h2>
          </>
        }
      >
        <img
          src="/xite-editor-hero.jpg"
          alt="XITE Visual Website Builder"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full w-full object-top shadow-2xl"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
