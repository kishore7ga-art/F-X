import type { Metadata } from "next";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { HeroSection } from "@/components/ui/hero-section-1";
import SVGMaskEffectDemo from "@/components/svg-mask-effect-demo";
import WobbleCardDemo from "@/components/wobble-card-demo";
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
          <SVGMaskEffectDemo />
        </SectionWrapper>
        
        <SectionWrapper variant="scale-up">
          <WobbleCardDemo />
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
        
        <SectionWrapper variant="slide-left">
          <PointerHighlightSection />
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
