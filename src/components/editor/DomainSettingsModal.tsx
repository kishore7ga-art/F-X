"use client";

import { useState } from "react";
import { X, Globe, ShieldCheck, Rocket, ExternalLink, Check, Copy } from "lucide-react";

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain?: string;
}

export function DomainSettingsModal({ isOpen, onClose, subdomain = "greenfield" }: DomainSettingsModalProps) {
  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  if (!isOpen) return null;

  const handleSaveDomain = () => {
    setSavedDomain(customDomain);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-extrabold text-white">Custom Domain & Publishing Settings</h2>
              <p className="text-xs text-slate-400">Configure DNS Records, SSL certificates, and 1-Click Production Deploy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Custom Domain Input */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase text-slate-300">Primary Custom Domain</label>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL Active & Connected</span>
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. college.edu.in"
            />
            <button
              onClick={handleSaveDomain}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Save Domain
            </button>
          </div>
        </div>

        {/* DNS Configuration Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase">DNS Records Configuration</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 text-[11px]">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2.5">TYPE</th>
                  <th className="p-2.5">HOST/NAME</th>
                  <th className="p-2.5">TARGET VALUE</th>
                  <th className="p-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2.5 font-bold text-blue-400">A</td>
                  <td className="p-2.5">@</td>
                  <td className="p-2.5">76.76.21.21</td>
                  <td className="p-2.5 text-emerald-400 font-bold">Active</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-blue-400">CNAME</td>
                  <td className="p-2.5">www</td>
                  <td className="p-2.5">cname.xite.co.in</td>
                  <td className="p-2.5 text-emerald-400 font-bold">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* One-Click Production Deploy */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">Production Live Status</span>
            <span className="text-[11px] text-slate-400">Target URL: <span className="font-mono text-blue-400">https://{savedDomain}</span></span>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>{publishing ? "Publishing..." : published ? "Published Live ✓" : "Publish to Production"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
