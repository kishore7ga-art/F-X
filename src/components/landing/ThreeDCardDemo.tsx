"use client";

import React from "react";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.15] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[22rem] h-auto rounded-xl p-4 border">
        <CardItem
          translateZ="50"
          className="text-lg font-bold text-neutral-600 dark:text-white"
        >
          Build Beautiful Websites
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-xs max-w-xs mt-1.5 dark:text-neutral-300 leading-relaxed"
        >
          Create professional college websites using a visual drag-and-drop builder. Customize every section without writing code.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-3">
          <img
            src="/madras-graduation.png"
            height="1000"
            width="1000"
            className="h-36 w-full object-cover rounded-lg group-hover/card:shadow-xl"
            alt="Build Beautiful Websites"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-8">
          <CardItem
            translateZ={20}
            as={Link}
            href="/onboarding"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold dark:text-white hover:text-blue-400"
          >
            Try now →
          </CardItem>
          <CardItem
            translateZ={20}
            as={Link}
            href="/onboarding"
            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white dark:text-black text-white text-xs font-bold shadow-md"
          >
            Sign up
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

export function ThreeDCardDemoSecond() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.15] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[22rem] h-auto rounded-xl p-4 border">
        <CardItem
          translateZ="50"
          className="text-lg font-bold text-neutral-600 dark:text-white"
        >
          Ready-Made Templates
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-xs max-w-xs mt-1.5 dark:text-neutral-300 leading-relaxed"
        >
          Choose from professionally designed templates built specifically for educational institutions.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-3">
          <img
            src="/xite-builder-graphic.jpg"
            height="1000"
            width="1000"
            className="h-36 w-full object-cover rounded-lg group-hover/card:shadow-xl"
            alt="Ready-Made Templates"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-8">
          <CardItem
            translateZ={20}
            as={Link}
            href="/templates"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold dark:text-white hover:text-purple-400"
          >
            Explore →
          </CardItem>
          <CardItem
            translateZ={20}
            as={Link}
            href="/templates"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg"
          >
            Get Started
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
