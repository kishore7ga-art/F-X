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
          className="font-[family-name:var(--site-heading-font)] text-base sm:text-lg font-bold text-white hover:opacity-90 transition truncate max-w-[220px] sm:max-w-none"
        >
          {collegeName}
        </Link>

        {/* Desktop Navigation */}
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

        {/* Mobile Horizontally Scrollable Bar / Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Scrollable pill bar on mobile */}
          <nav className="flex items-center gap-1 overflow-x-auto max-w-[220px] sm:max-w-xs scrollbar-none py-0.5">
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
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    isActive
                      ? "text-[var(--site-dark)]"
                      : "text-white/85 hover:text-white bg-white/10"
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
        </div>
      </div>
    </header>
  );
}
