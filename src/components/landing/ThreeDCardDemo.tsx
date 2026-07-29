"use client";

import React from "react";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.25] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full sm:w-[28rem] lg:w-[32rem] h-auto rounded-2xl p-6 md:p-8 border">
        <CardItem
          translateZ="50"
          className="text-2xl font-black text-neutral-600 dark:text-white"
        >
          Build Beautiful Websites
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-400 text-sm max-w-sm mt-2 leading-relaxed"
        >
          Create professional college websites using a visual drag-and-drop builder. Customize every section without writing code.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src="/madras-graduation.png"
            height="1000"
            width="1000"
            className="h-52 md:h-64 w-full object-cover rounded-xl group-hover/card:shadow-2xl border border-white/10"
            alt="Build Beautiful Websites"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-8">
          <CardItem
            translateZ={20}
            as={Link}
            href="/onboarding"
            className="px-4 py-2 rounded-xl text-sm font-bold dark:text-white hover:text-blue-400"
          >
            Try now →
          </CardItem>
          <CardItem
            translateZ={20}
            as={Link}
            href="/onboarding"
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white dark:text-black text-white text-sm font-bold shadow-lg"
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
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.25] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full sm:w-[28rem] lg:w-[32rem] h-auto rounded-2xl p-6 md:p-8 border">
        <CardItem
          translateZ="50"
          className="text-2xl font-black text-neutral-600 dark:text-white"
        >
          Ready-Made Templates
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-400 text-sm max-w-sm mt-2 leading-relaxed"
        >
          Choose from professionally designed templates built specifically for educational institutions.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src="/xite-builder-graphic.jpg"
            height="1000"
            width="1000"
            className="h-52 md:h-64 w-full object-cover rounded-xl group-hover/card:shadow-2xl border border-white/10"
            alt="Ready-Made Templates"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-8">
          <CardItem
            translateZ={20}
            as={Link}
            href="/templates"
            className="px-4 py-2 rounded-xl text-sm font-bold dark:text-white hover:text-purple-400"
          >
            Explore →
          </CardItem>
          <CardItem
            translateZ={20}
            as={Link}
            href="/templates"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold shadow-lg"
          >
            Get Started
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
