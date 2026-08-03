"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
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
    // Simulate brief save transition then redirect to home dashboard
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Category Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {COLLEGE_TYPES.map((type) => {
          const isSelected = selectedType === type.value;
          return (
            <div
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`group relative p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl group-hover:scale-110 transition-transform">
                    {TYPE_ICONS[type.value] ?? "🏫"}
                  </span>
                  <div>
                    <h3 className={`text-base font-extrabold transition-colors ${isSelected ? "text-blue-400" : "text-white"}`}>
                      {type.label}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {type.hint}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-slate-700 group-hover:border-slate-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 px-6 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span>Saving your selection...</span>
        ) : (
          <>
            <span>Continue with {COLLEGE_TYPES.find((t) => t.value === selectedType)?.label}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
