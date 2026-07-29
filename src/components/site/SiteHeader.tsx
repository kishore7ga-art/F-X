"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import type { SiteNavPage } from "@/lib/site/queries";

export function SiteHeader({
  collegeName,
  subdomain,
  pages,
  currentSlug,
  isEditor = false,
}: {
  collegeName: string;
  subdomain: string;
  pages: SiteNavPage[];
  currentSlug: string;
  isEditor?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeSlug = pages[0]?.slug ?? "home";

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 transition-colors"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        {/* Brand / Logo */}
        <Link
          href={
            isEditor
              ? `/editor/${subdomain}?page=${homeSlug}`
              : `/site/${subdomain}`
          }
          className="font-[family-name:var(--site-heading-font)] text-sm sm:text-lg font-extrabold text-white hover:opacity-90 transition truncate max-w-[220px] sm:max-w-none"
        >
          {collegeName}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex flex-wrap items-center gap-1">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug;
            const targetHref = isEditor
              ? `/editor/${subdomain}?page=${page.slug}`
              : page.slug === homeSlug
                ? `/site/${subdomain}`
                : `/site/${subdomain}/${page.slug}`;

            return (
              <Link
                key={page.id}
                href={targetHref}
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "text-[var(--site-dark)] shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "var(--site-accent)" }
                    : undefined
                }
              >
                {page.title}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition active:scale-95 shrink-0"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Slide-Down Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 pb-2 border-t border-white/10 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug;
            const targetHref = isEditor
              ? `/editor/${subdomain}?page=${page.slug}`
              : page.slug === homeSlug
                ? `/site/${subdomain}`
                : `/site/${subdomain}/${page.slug}`;

            return (
              <Link
                key={page.id}
                href={targetHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center justify-between ${
                  isActive
                    ? "text-[var(--site-dark)] shadow-xs"
                    : "text-white/90 hover:bg-white/10"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "var(--site-accent)" }
                    : undefined
                }
              >
                <span>{page.title}</span>
                {isActive && <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">• Active</span>}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
