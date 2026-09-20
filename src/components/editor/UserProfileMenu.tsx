"use client";

import { useState, useRef, useEffect } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const initial = (collegeName || "C").trim().charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-slate-600"
      >
        <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-[11px] shadow-xs">
          {initial}
        </div>
        <span className="max-w-[130px] truncate hidden sm:inline text-slate-200">{collegeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-1.5 z-50 text-slate-200 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-white font-bold">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">{collegeName}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate font-mono">{userEmail}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings("domain");
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Account Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings("security");
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security & Roles</span>
            </button>
          </div>

          <div className="pt-1 border-t border-slate-800/80">
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
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 flex items-center gap-2.5 text-rose-400 font-bold transition cursor-pointer"
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
