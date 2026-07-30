"use client";

import { useState } from "react";
import {
  FolderOpen,
  Image as ImageIcon,
  Video,
  Shield,
  MousePointer,
  FileText,
  Plus,
  Copy,
  Check,
  Search,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export type AssetCategory = "images" | "videos" | "logos" | "buttons" | "documents";

export type MediaAsset = {
  id: string;
  name: string;
  category: AssetCategory;
  url: string;
  previewUrl?: string;
  size?: string;
  aspect?: string;
};

export const INITIAL_ASSETS: MediaAsset[] = [
  // Images
  {
    id: "img-1",
    name: "Main Campus Building",
    category: "images",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
    size: "1.2 MB",
  },
  {
    id: "img-2",
    name: "Engineering Library",
    category: "images",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80",
    size: "890 KB",
  },
  {
    id: "img-3",
    name: "Science Innovation Lab",
    category: "images",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
    size: "1.4 MB",
  },

  // Logos
  {
    id: "logo-1",
    name: "College Emblem (Dark)",
    category: "logos",
    url: "/xite-logo.png",
    previewUrl: "/xite-logo.png",
    size: "45 KB",
  },
  {
    id: "logo-2",
    name: "NAAC A+ Accreditation",
    category: "logos",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    size: "62 KB",
  },

  // Videos
  {
    id: "vid-1",
    name: "Campus Tour 2026",
    category: "videos",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    previewUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80",
    size: "MP4 Video",
  },
  {
    id: "vid-2",
    name: "Annual Placement Highlights",
    category: "videos",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    previewUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    size: "HD Video",
  },

  // Buttons & CTAs
  {
    id: "btn-1",
    name: "Apply Now (Primary)",
    category: "buttons",
    url: "/admissions",
    size: "Button Preset",
  },
  {
    id: "btn-2",
    name: "Download Prospectus 2026",
    category: "buttons",
    url: "/prospectus.pdf",
    size: "Button Preset",
  },
  {
    id: "btn-3",
    name: "Virtual 360° Tour",
    category: "buttons",
    url: "/facilities",
    size: "Button Preset",
  },

  // Documents
  {
    id: "doc-1",
    name: "Academic Calendar 2026-27",
    category: "documents",
    url: "/academic-calendar.pdf",
    size: "PDF (2.1 MB)",
  },
  {
    id: "doc-2",
    name: "Fees & Scholarship Guide",
    category: "documents",
    url: "/fees-structure.pdf",
    size: "PDF (1.5 MB)",
  },
];

export function AssetsMediaPanel({ onClose }: { onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("images");
  const [assetsList, setAssetsList] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAsset = () => {
    const name = prompt("Enter Asset Name (e.g., Campus Library Photo):");
    if (!name) return;
    const url = prompt("Enter Asset URL or Path (e.g., https://... or /image.jpg):");
    if (!url) return;

    const newAsset: MediaAsset = {
      id: `custom-${Date.now()}`,
      name,
      category: activeCategory,
      url,
      previewUrl: url,
      size: "Custom Asset",
    };

    setAssetsList((prev) => [newAsset, ...prev]);
  };

  const filteredAssets = assetsList.filter(
    (item) =>
      item.category === activeCategory &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 280 }}
      exit={{ opacity: 0, x: -10, width: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="z-30 flex w-[280px] shrink-0 flex-col justify-between border-r border-[#1F1F23] bg-[#0B0B0C] p-4 overflow-hidden select-none"
    >
      <div className="flex flex-col gap-3.5 overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-black font-bold">
              <FolderOpen className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">Assets & Media</h2>
              <p className="text-[10px] text-neutral-400 font-mono">Store images, videos, logos & buttons</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-[#17171A] hover:text-white transition"
            title="Close Panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 rounded-xl bg-[#111113] p-1 border border-[#26272B] shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategory("images")}
            title="Images"
            className={cn(
              "flex items-center justify-center rounded-lg py-1.5 transition text-xs font-bold",
              activeCategory === "images"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("videos")}
            title="Videos"
            className={cn(
              "flex items-center justify-center rounded-lg py-1.5 transition text-xs font-bold",
              activeCategory === "videos"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Video className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("logos")}
            title="Logos & Badges"
            className={cn(
              "flex items-center justify-center rounded-lg py-1.5 transition text-xs font-bold",
              activeCategory === "logos"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("buttons")}
            title="Buttons & CTAs"
            className={cn(
              "flex items-center justify-center rounded-lg py-1.5 transition text-xs font-bold",
              activeCategory === "buttons"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <MousePointer className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("documents")}
            title="Documents & PDFs"
            className={cn(
              "flex items-center justify-center rounded-lg py-1.5 transition text-xs font-bold",
              activeCategory === "documents"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder={`Search ${activeCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[38px] w-full rounded-[10px] border border-[#26272B] bg-[#111113] pl-8 pr-2 text-xs font-medium text-white placeholder-neutral-500 outline-none transition focus:border-white"
          />
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {activeCategory.toUpperCase()} ({filteredAssets.length})
            </span>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group rounded-2xl border border-[#26272B] bg-[#111113] p-2.5 transition hover:border-neutral-500 hover:bg-[#17171A]"
                >
                  {/* Thumbnail / Visual for Images, Logos, Videos */}
                  {(asset.category === "images" || asset.category === "logos" || asset.category === "videos") && (
                    <div className="relative mb-2 h-24 w-full overflow-hidden rounded-xl bg-black border border-neutral-800 flex items-center justify-center">
                      {asset.previewUrl ? (
                        <img
                          src={asset.previewUrl}
                          alt={asset.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-neutral-500">
                          {asset.category === "videos" ? <Video className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                        </div>
                      )}
                      {asset.category === "videos" && (
                        <span className="absolute rounded-full bg-black/80 p-2 text-white shadow-lg">
                          <Video className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  )}

                  {/* Button Preview Component */}
                  {asset.category === "buttons" && (
                    <div className="mb-2 flex items-center justify-center rounded-xl bg-[#09090B] p-3 border border-[#26272B]">
                      <span className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-md hover:bg-neutral-200 transition">
                        {asset.name}
                      </span>
                    </div>
                  )}

                  {/* Document Preview Component */}
                  {asset.category === "documents" && (
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#09090B] p-3 border border-[#26272B]">
                      <FileText className="h-6 w-6 text-white shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{asset.size}</p>
                      </div>
                    </div>
                  )}

                  {/* Asset Details & Copy Actions */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono truncate">{asset.size}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.id, asset.url)}
                      title="Copy URL"
                      className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-[#26272B] bg-[#09090B] px-2 text-[10px] font-bold text-neutral-300 transition hover:bg-white hover:text-black"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-neutral-500">
              <FolderOpen className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
              <p className="text-xs font-medium">No {activeCategory} found</p>
              <p className="text-[10px] text-neutral-600 mt-1">Click below to upload or store one.</p>
            </div>
          )}
        </div>

        {/* Add / Upload Asset Button */}
        <div className="pt-3 border-t border-[#1F1F23] shrink-0">
          <button
            type="button"
            onClick={handleAddAsset}
            className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#26272B] bg-[#111113] text-xs font-semibold text-neutral-200 transition-colors hover:border-white hover:bg-white hover:text-black group"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black transition-colors" />
            <span>+ Add {activeCategory.slice(0, -1).toUpperCase()}</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
