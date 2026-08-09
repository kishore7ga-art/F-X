import Link from "next/link";
import { Edit3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen w-full flex flex-col items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
      <Link
        href="/editor/mec"
        className="p-[4px] relative inline-block group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl animate-pulse" />
        <div className="px-10 py-5 bg-black rounded-[14px] relative group transition duration-200 text-white font-bold text-xl hover:bg-transparent flex items-center justify-center gap-3 shadow-2xl">
          <Edit3 className="w-6 h-6 text-blue-400" />
          <span>Edit Page</span>
          <span className="text-blue-400 group-hover:translate-x-1.5 transition-transform">→</span>
        </div>
      </Link>
    </main>
  );
}


