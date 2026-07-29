import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <MacbookScroll
        title={
          <span>
            Every College Deserves a <br /> Modern Website.
          </span>
        }
        badge={
          <Badge className="h-10 w-10 -rotate-12 transform" />
        }
        src="/macbook-madras-college.png"
        showGradient={false}
      />
    </div>
  );
}

// XITE Badge Icon
const Badge = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <img
        src="/xite-logo.png"
        alt="XITE Logo"
        className="h-full w-full object-contain rounded-xl shadow-xl border border-white/20 p-1.5 bg-black/80 backdrop-blur-md"
      />
    </div>
  );
};
