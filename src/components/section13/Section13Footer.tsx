"use client";

import { forwardRef } from "react";
import { ArrowRight } from "lucide-react";

const Section13Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    return (
      <footer
        ref={ref}
        {...props}
        className="w-full bg-[#000000] text-white py-20 px-6 sm:px-12 border-t border-white/[0.08] relative z-30"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          {/* Top Footer Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {/* Column 1: XITE */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                XITE
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
                <li><a href="#about" className="hover:text-white transition-colors">About XITE</a></li>
                <li><a href="#vision" className="hover:text-white transition-colors">Institutional Vision</a></li>
                <li><a href="#architecture" className="hover:text-white transition-colors">Technical Engine</a></li>
                <li><a href="#governance" className="hover:text-white transition-colors">Governance Control</a></li>
              </ul>
            </div>

            {/* Column 2: Platform */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                Platform
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
                <li><a href="#editor" className="hover:text-white transition-colors">XITE Editor Studio</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Master Templates</a></li>
                <li><a href="#sections" className="hover:text-white transition-colors">Modular Section System</a></li>
                <li><a href="#multitenant" className="hover:text-white transition-colors">Multi-Tenant Architecture</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                Resources
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
                <li><a href="#docs" className="hover:text-white transition-colors">System Documentation</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">OpenAPI Specs</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security Whitepaper</a></li>
                <li><a href="#status" className="hover:text-white transition-colors">Ecosystem Status</a></li>
              </ul>
            </div>

            {/* Column 4: Access */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                Access
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
                <li><a href="#login" className="hover:text-white transition-colors">Institutional SSO Login</a></li>
                <li><a href="#request" className="hover:text-white transition-colors">Request Access Token</a></li>
                <li><a href="#support" className="hover:text-white transition-colors">Enterprise Support</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy &amp; Governance</a></li>
              </ul>
            </div>
          </div>

          {/* Primary Footer Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Digital infrastructure for the institutions shaping tomorrow.
              </span>
            </div>

            {/* Primary Footer Action Button */}
            <a
              href="#editor"
              className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <span>GET TO EDITOR</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
          </div>

          {/* Final Copyright Pixel */}
          <div className="text-center pt-8 border-t border-white/[0.04]">
            <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
              © {new Date().getFullYear()} XITE INC. ALL RIGHTS RESERVED. PURE BLACK ENVIRONMENT.
            </p>
          </div>
        </div>
      </footer>
    );
  }
);

Section13Footer.displayName = "Section13Footer";

export default Section13Footer;
