"use client";

import { useState } from "react";
import { User, LogOut, Shield, ChevronDown, Building2 } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface UserProfileMenuProps {
  userEmail?: string;
  collegeName?: string;
  onOpenSettings?: (tab: string) => void;
}

export function UserProfileMenu({
  userEmail = "admin@greenfield.edu.in",
  collegeName = "Greenfield University",
  onOpenSettings,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-full py-1.5 px-3 text-xs font-semibold text-white transition-all cursor-pointer shadow-lg"
      >
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
          {collegeName.charAt(0)}
        </div>
        <span className="max-w-[120px] truncate">{collegeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-extrabold">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="truncate">{collegeName}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{userEmail}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings("domain");
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Account Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings("security");
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security & Roles</span>
            </button>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <button
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch {}
                try {
                  document.cookie = "xite_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                  document.cookie = "xite_user_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                  localStorage.clear();
                  sessionStorage.clear();
                } catch {}
                window.location.href = "/";
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 flex items-center gap-2 text-red-400 font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
