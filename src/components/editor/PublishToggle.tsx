"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Link2,
  RefreshCw,
  Copy,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
import { setPublishStatus } from "@/app/actions/publish";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

/** Draft / Published switch in the editor with shareable URL generator modal. */
export function PublishToggle({
  collegeId,
  subdomain,
  status,
  compact = false,
}: {
  collegeId: string;
  subdomain?: string;
  status: string;
  compact?: boolean;
}) {
  const isPublished = status === "PUBLISHED";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Construct full public share URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://xite-platform.com";
  const publicShareUrl = subdomain ? `${origin}/site/${subdomain}` : origin;

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        const nextPublishedState = !isPublished;
        await setPublishStatus({ collegeId, publish: nextPublishedState });
        if (nextPublishedState) {
          setShowShareModal(true);
        }
      } catch {
        setError("Could not change publish status");
      }
    });
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <AnimatePresence>
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 select-none my-auto"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Celebration Banner Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-inner">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Your Site is Live &amp; Shareable!
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Anyone with this generated URL can view your live published website.
                </p>
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Generated Share Link
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 pl-3 shadow-2xs">
                  <span className="flex-1 truncate text-xs font-mono font-semibold text-slate-800">
                    {publicShareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all shadow-2xs cursor-pointer shrink-0",
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2 pt-2">
                <a
                  href={publicShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-2xs"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  <span>Open Live Site</span>
                </a>

                <button
                  type="button"
                  onClick={toggle}
                  disabled={isPending}
                  className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer shrink-0"
                >
                  Unpublish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="group relative flex items-center">
        <button
          type="button"
          onClick={() => {
            if (isPublished) {
              setShowShareModal(true);
            } else {
              toggle();
            }
          }}
          disabled={isPending}
          aria-label={isPublished ? "Site Published - Click to Share Link" : "Publish Site"}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all duration-200 cursor-pointer"
          )}
        >
          {isPending ? (
            <RefreshCw className="h-4.5 w-4.5 animate-spin text-slate-600" />
          ) : (
            <Link2 className="h-4.5 w-4.5" strokeWidth={2.2} />
          )}
        </button>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50">
          {isPending
            ? "Updating..."
            : isPublished
              ? "Live & Published (Click to Get Shareable Link)"
              : "Publish & Generate Shareable URL"}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* Render Modal into document.body to escape parent transforms */}
      {mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}
