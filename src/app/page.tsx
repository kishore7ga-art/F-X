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

export const dynamic = "force-dynamic";

const TITLE = "Build Modern College Websites Without Writing Code — XITE";

export const metadata: Metadata = {
  title: TITLE,
};

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <main className="bg-black text-white selection:bg-blue-600 selection:text-white">
        <HeaderNavbar />
        
        <HeroSection />
        
        <SectionWrapper>
          <MacbookScrollDemo />
        </SectionWrapper>
        
        <SectionWrapper>
          <SparklesSection />
        </SectionWrapper>
        
        <SectionWrapper id="features">
          <FeaturesRevealSection />
        </SectionWrapper>
        
        <SectionWrapper id="builder">
          <TabsSection />
        </SectionWrapper>
        
        <SectionWrapper>
          <CoverSection />
        </SectionWrapper>
        
        <SectionWrapper>
          <PointerHighlightSection />
        </SectionWrapper>
        
        <SectionWrapper>
          <HeroScrollDemo />
        </SectionWrapper>
        
        <SectionWrapper id="compare">
          <CompareSection />
        </SectionWrapper>
        
        <SectionWrapper id="templates">
          <TimelineSection />
        </SectionWrapper>
        
        <SectionWrapper>
          <ThreeDMarqueeDemoSecond />
        </SectionWrapper>
        
        <SectionWrapper id="testimonials">
          <TestimonialsSection />
        </SectionWrapper>
        
        <CinematicFooter />
      </main>
    </SmoothScrollProvider>
  );
}
