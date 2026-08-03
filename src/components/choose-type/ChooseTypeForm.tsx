"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { COLLEGE_TYPES } from "@/lib/college-types";

const TYPE_ICONS: Record<string, string> = {
  engineering: "⚙️",
  arts_science: "🎨",
  medical: "🏥",
  management: "📊",
  law: "⚖️",
};

export function ChooseTypeForm() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("engineering");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/editor/greenfield");
    }, 600);
  }

  const selectedLabel = COLLEGE_TYPES.find((t) => t.value === selectedType)?.label || "Engineering";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8 text-left">
      {/* Category Grid (Matches Screenshot 1 Card Layout Exactly) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {COLLEGE_TYPES.map((type) => {
          const isSelected = selectedType === type.value;
          return (
            <div
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`group relative p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-[#09142b]/90 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.3)] ring-1 ring-blue-500/50"
                  : "bg-[#090d16]/80 border-blue-900/30 hover:border-blue-700/60 hover:bg-[#0b1222]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0e172a] border border-blue-900/40 text-xl group-hover:scale-105 transition-transform shadow-inner">
                    {TYPE_ICONS[type.value] ?? "🏫"}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-black transition-colors ${isSelected ? "text-white" : "text-neutral-200"}`}>
                      {type.label}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed truncate font-medium">
                      {type.hint}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_10px_#2563eb]">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-neutral-600 group-hover:text-neutral-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button (Matches Screenshot 1 Glowing Gradient CTA) */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-[0_0_35px_rgba(37,99,235,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <span>Saving your selection...</span>
        ) : (
          <>
            <span>Continue with {selectedLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
