"use client";

import React from "react";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.2] dark:bg-black dark:border-white/[0.15] border-black/[0.1] w-auto sm:w-[24rem] h-auto rounded-2xl p-5 border shadow-xl">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          Build Beautiful Websites
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-400 text-xs max-w-xs mt-1.5 leading-relaxed"
        >
          Create professional college websites using a visual drag-and-drop builder. Customize every section without writing code.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-3">
          <img
            src="/template-brightwood.jpg"
            height="1000"
            width="1000"
            className="h-44 w-full object-cover rounded-xl group-hover/card:shadow-2xl border border-white/10"
            alt="Build Beautiful Websites"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-6">
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
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold shadow-md"
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
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.2] dark:bg-black dark:border-white/[0.15] border-black/[0.1] w-auto sm:w-[24rem] h-auto rounded-2xl p-5 border shadow-xl">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          Ready-Made Templates
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-400 text-xs max-w-xs mt-1.5 leading-relaxed"
        >
          Choose from professionally designed templates built specifically for educational institutions.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-3">
          <img
            src="/xite-builder-graphic.jpg"
            height="1000"
            width="1000"
            className="h-44 w-full object-cover rounded-xl group-hover/card:shadow-2xl border border-white/10"
            alt="Ready-Made Templates"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-6">
          <CardItem
            translateZ={20}
            as={Link}
            href="/start"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold dark:text-white hover:text-purple-400"
          >
            Explore →
          </CardItem>
          <CardItem
            translateZ={20}
            as={Link}
            href="/start"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-md"
          >
            Get Started
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
