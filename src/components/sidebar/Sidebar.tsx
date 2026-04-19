"use client";

import { Home, FileText, Send, CheckSquare, Users, Settings, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // <-- THE GPS HOOK

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Dispatch", href: "/dispatch", icon: Send },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Directory", href: "/directory", icon: Users },
  { name: "Audit Trail", href: "/audit", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname(); // <-- Get current URL

  return (
    // Notice the md:hover:w-64 here. This prevents annoying mobile text expansion!
    <aside className="group fixed left-0 top-0 h-screen w-16 md:hover:w-64 transition-[width] duration-300 ease-in-out border-r border-zinc-800/50 bg-[#09090b] z-50 flex flex-col py-6 px-3 overflow-hidden shadow-2xl">
      
      {/* Brand Logo Area */}
      <div className="flex items-center gap-4 px-1 mb-10 overflow-hidden whitespace-nowrap">
        <div className="h-8 w-8 min-w-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-500/20">
          <FileText className="text-emerald-500 w-5 h-5 stroke-[1.5px]" />
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          DocuTrack
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // STRICT ACTIVE CHECK: If we are on Home "/", only match exactly "/". Otherwise, check if URL starts with the href.
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-2 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" // ACTIVE STATE
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 border border-transparent" // INACTIVE STATE
              }`}
            >
              <Icon className={`w-5 h-5 min-w-5 stroke-[1.5px] shrink-0 ${isActive ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""}`} />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}