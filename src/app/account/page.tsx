"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, Shield, Key, ArrowLeft, Building2, CheckCircle2, RefreshCw, Smartphone } from "lucide-react";

export default function AccountDetailsPage() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      document.cookie = "xite_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/editor/greenfield"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor Studio
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              👑 Owner Account
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Title Heading */}
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Account Details & Session</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal owner profile, active session, and sign in / sign out controls
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-500/20">
                K
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white">Kishore</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Owner
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-medium">kishore@xite.co.in</p>
              </div>
            </div>

            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-extrabold transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              Switch Account
            </Link>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ORGANIZATION</span>
              <p className="text-sm font-extrabold text-white mt-1">Greenfield University</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">SUBDOMAIN</span>
              <p className="text-sm font-extrabold text-blue-400 mt-1">greenfield.xite.co.in</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ACCOUNT STATUS</span>
              <p className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Session
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ROLE</span>
              <p className="text-sm font-extrabold text-white mt-1">Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Session & Action Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">SESSION CONTROLS</span>
            <h3 className="text-lg font-extrabold text-white mt-1">Login & Logout Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Log In / Switch Account */}
            <Link
              href="/login"
              className="p-6 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    Log In to Another Account
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Switch institution or admin profile</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">➔</span>
            </Link>

            {/* Log Out Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-6 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-800 transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-rose-300 group-hover:text-rose-200 transition-colors">
                    {loggingOut ? "Signing Out..." : "Log Out of Account"}
                  </h4>
                  <p className="text-xs text-rose-400/70 mt-0.5">Safely end current active session</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-colors">➔</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
