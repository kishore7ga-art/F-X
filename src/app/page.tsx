import type { Metadata } from "next";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { HeroSection } from "@/components/ui/hero-section-1";
import MacbookScrollDemo from "@/components/macbook-scroll-demo";
import { CinematicFooter } from "@/components/ui/motion-footer";
import SparklesSection from "@/components/landing/SparklesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FeaturesRevealSection from "@/components/landing/FeaturesRevealSection";
import CoverSection from "@/components/landing/CoverSection";
import TimelineSection from "@/components/landing/TimelineSection";
import CompareSection from "@/components/landing/CompareSection";
import PointerHighlightSection from "@/components/landing/PointerHighlightSection";
import { ThreeDMarqueeDemoSecond } from "@/components/landing/ThreeDMarqueeSection";
import TabsSection from "@/components/landing/TabsSection";
import { SectionWrapper } from "@/components/landing/SectionWrapper";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { HeroScrollDemo } from "@/components/landing/HeroScrollDemo";
import { BackgroundLines } from "@/components/ui/background-lines";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export function BackgroundLinesDemo() {
  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 py-16 sm:py-24">
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-white via-neutral-200 to-neutral-500 text-3xl sm:text-5xl lg:text-7xl font-sans py-2 sm:py-6 relative z-20 font-extrabold tracking-tight">
        Sanjana Airlines, <br /> Sajana Textiles.
      </h2>
      <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-neutral-300 text-center relative z-20 font-medium leading-relaxed">
        Get the best advices from our experts, including expert artists,
        painters, marathon enthusiasts and RDX, totally free.
      </p>
    </BackgroundLines>
  );
}

export function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[30rem] sm:h-[40rem] w-full items-center justify-center overflow-hidden my-8 px-4">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-4xl text-center text-2xl sm:text-4xl font-bold text-white leading-snug">
            The first rule of MRR Club is you do not talk about MRR Club. The
            second rule of MRR Club is you DO NOT talk about MRR Club.
          </p>
        }
        className="h-[30rem] sm:h-[40rem] rounded-3xl border border-white/10 text-white w-full max-w-6xl mx-auto"
      >
        Discover the power of{" "}
        <span className="text-blue-400 font-extrabold">Tailwind CSS v4</span> with native CSS
        variables and container queries with{" "}
        <span className="text-purple-400 font-extrabold">advanced animations</span>.
      </MaskContainer>
    </div>
  );
}

export const dynamic = "force-dynamic";

const TITLE = "Build Modern College Websites Without Writing Code — XITE";

export const metadata: Metadata = {
  title: TITLE,
};

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <main className="bg-black text-white selection:bg-blue-600 selection:text-white overflow-x-hidden w-full max-w-full relative">
        <HeaderNavbar />
        
        <HeroSection />
        
        <SectionWrapper variant="flip-3d">
          <MacbookScrollDemo />
        </SectionWrapper>
        
        <SectionWrapper variant="blur-reveal">
          <SparklesSection />
        </SectionWrapper>
        
        <SectionWrapper id="features" variant="bounce-up">
          <FeaturesRevealSection />
        </SectionWrapper>
        
        <SectionWrapper id="builder" variant="scale-up">
          <TabsSection />
        </SectionWrapper>
        
        <SectionWrapper variant="rotate-in">
          <CoverSection />
        </SectionWrapper>

        <SectionWrapper variant="blur-reveal">
          <BackgroundLinesDemo />
        </SectionWrapper>
        
        <SectionWrapper variant="slide-left">
          <PointerHighlightSection />
        </SectionWrapper>
        
        <SectionWrapper variant="scale-up">
          <SVGMaskEffectDemo />
        </SectionWrapper>

        <SectionWrapper variant="flip-3d">
          <HeroScrollDemo />
        </SectionWrapper>
        
        <SectionWrapper id="compare" variant="slide-right">
          <CompareSection />
        </SectionWrapper>
        
        <SectionWrapper id="templates" variant="blur-reveal">
          <TimelineSection />
        </SectionWrapper>
        
        <SectionWrapper variant="rotate-in">
          <ThreeDMarqueeDemoSecond />
        </SectionWrapper>
        
        <SectionWrapper id="testimonials" variant="scale-up">
          <TestimonialsSection />
        </SectionWrapper>
        
        <CinematicFooter />
      </main>
    </SmoothScrollProvider>
  );
}
