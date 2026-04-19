"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  ArrowRight, 
  Send, 
  MapPin, 
  Lock, 
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  Terminal
} from "lucide-react";
import Link from "next/link";

// --- CUSTOM ASYMMETRICAL CYPHER COMPONENT ---
const GlitchText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const symbols = "01X$#@*></\\{}[]%&";

  useEffect(() => {
    let animationInterval: NodeJS.Timeout;

    const triggerDecode = () => {
      setIsGlitching(true);
      
      // Give each letter a random "lock-in" limit between 10 and 40 frames
      // This creates the asymmetrical, staggered loading effect
      const lockTimes = Array.from({ length: text.length }).map(() => 
        Math.floor(Math.random() * 30) + 10
      );
      
      let frame = 0;

      animationInterval = setInterval(() => {
        setDisplayText((_) => {
          return text.split("").map((char, index) => {
            // If the character is a space, leave it alone
            if (char === " ") return " ";
            
            // If this specific letter has reached its random lock time, show the real letter
            if (frame >= lockTimes[index]) {
              return char;
            }
            
            // Otherwise, keep scrambling this specific letter
            return symbols[Math.floor(Math.random() * symbols.length)];
          }).join("");
        });

        frame++;

        // Once the longest locking letter is done, end the animation
        if (frame > Math.max(...lockTimes)) {
          clearInterval(animationInterval);
          setIsGlitching(false);
          setDisplayText(text); // Ensure perfect final string
        }
      }, 50); // 50ms per frame = smooth, deliberate speed
    };

    // Initial delay before first trigger
    const initialTimeout = setTimeout(triggerDecode, 1000);

    // Repeat the cypher effect every 12 seconds (between 10 and 15s)
    const mainLoop = setInterval(triggerDecode, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(mainLoop);
      clearInterval(animationInterval);
    };
  }, [text]);

  return (
    <span 
      className={`inline-block min-w-[10ch] font-code tracking-tight transition-all duration-300 ${
        isGlitching 
          ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]' 
          : 'text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]'
      }`}
    >
      {displayText}
    </span>
  );
};
// ------------------------------

export default function LandingPage() {
  
  const features = [
    {
      id: "dispatch",
      title: "Smart Dispatch",
      desc: "Assign documents to specific staff members across departments with full traceability. No more physical files lost in transit.",
      icon: Send,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      id: "tracking",
      title: "Real-Time Tracking",
      desc: "Monitor document movement from sender to receiver. View precise timestamps and current holding locations instantly.",
      icon: MapPin,
      color: "text-teal-400",
      bg: "bg-teal-500/10"
    },
    {
      id: "access",
      title: "Controlled Access",
      desc: "Documents remain strictly restricted until formally accepted by the recipient. Enforce university hierarchy seamlessly.",
      icon: Lock,
      color: "text-zinc-300",
      bg: "bg-zinc-500/10"
    },
    {
      id: "proof",
      title: "Proof of Delivery",
      desc: "Upload visual verification for physical documents upon receipt. Eliminate disputes with an immutable system ledger.",
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-600/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-zinc-100 selection:bg-emerald-500/30 font-rare">
      
      {/* INJECTING RARE PREMIUM FONTS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-rare { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
      `}} />

      {/* 1. FLOATING NAVBAR */}
      <div className="fixed top-6 w-full z-50 flex justify-center px-6 pointer-events-none">
        <nav className="pointer-events-auto bg-[#131517]/80 backdrop-blur-xl border border-white/5 rounded-full px-4 py-2 flex items-center justify-between w-full max-w-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div className="flex items-center gap-2 pl-2">
            <Shield className="text-emerald-500 w-5 h-5 stroke-[2px]" />
            <span className="text-sm font-bold tracking-tight text-white">DocuTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          </div>
          <Link href="/login" className="px-5 py-2 text-sm font-semibold bg-emerald-500 text-emerald-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Log In
          </Link>
        </nav>
      </div>

      {/* 2. HERO SECTION */}
      <main className="relative pt-48 pb-20 px-6 flex flex-col items-center text-center">
        {/* Supabase Emerald Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-emerald-600/10 blur-[130px] rounded-full mix-blend-screen" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-100 h-75 bg-teal-600/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-code font-semibold text-emerald-400 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Terminal className="w-3.5 h-3.5" /> SYS_VER_1.0_LIVE
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 leading-[1.05] text-white">
          Secure document flow. <br className="hidden md:block"/>
          <GlitchText text="Automated." />
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light tracking-wide">
          The centralized platform designed to track, verify, and deliver administrative documents across university departments.
        </p>

        <div className="flex items-center w-full max-w-md bg-[#131517] border border-white/5 rounded-full p-1.5 pl-5 mb-24 shadow-2xl backdrop-blur-md focus-within:border-emerald-500/50 transition-colors z-10">
          <Search className="w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Track document ID..." 
            className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 px-3 placeholder:text-zinc-600 font-code"
            disabled
          />
          <Link href="/login" className="px-6 py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Access <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Elevated Dashboard Mockup */}
        <div className="w-full max-w-5xl rounded-4xl border border-zinc-800 bg-[#131517]/90 backdrop-blur-xl p-4 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden z-10">
           <div className="flex items-center gap-2 mb-4 px-2">
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
           </div>
           
           <div className="grid grid-cols-4 gap-4 h-100">
             <div className="col-span-1 border-r border-white/5 flex flex-col gap-4 pr-4">
                <div className="h-8 w-full bg-zinc-800/50 rounded-lg" />
                <div className="h-8 w-3/4 bg-zinc-800/50 rounded-lg" />
                <div className="h-8 w-5/6 bg-zinc-800/50 rounded-lg" />
             </div>
             <div className="col-span-3 flex flex-col gap-4">
               <div className="flex justify-between items-center mb-4">
                 <div className="h-6 w-48 bg-zinc-800/80 rounded" />
                 <div className="h-8 w-24 bg-emerald-500/20 border border-emerald-500/30 rounded-lg" />
               </div>
               <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="h-24 bg-[#1C1F22] rounded-xl border border-white/5" />
                  <div className="h-24 bg-[#1C1F22] rounded-xl border border-white/5" />
                  <div className="h-24 bg-[#1C1F22] rounded-xl border border-white/5" />
               </div>
               <div className="flex-1 bg-[#1C1F22] rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                  <div className="h-10 w-full bg-[#131517] rounded flex items-center px-4"><div className="h-2 w-2 rounded-full bg-emerald-500" /></div>
                  <div className="h-10 w-full bg-[#131517] rounded flex items-center px-4"><div className="h-2 w-2 rounded-full bg-zinc-500" /></div>
               </div>
             </div>
           </div>
        </div>
      </main>

      {/* 3. CARD STACKING SECTION */}
      <section id="workflow" className="relative pt-32 pb-48 px-6 border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16 relative">
          
          <div className="w-full md:w-5/12 md:sticky top-40 pt-10 z-0">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Built for Controlled Document Flow.
            </h2>
            <p className="text-lg text-zinc-400 mb-8 font-light tracking-wide">
              Every document is tracked, verified, and accounted for from creation to delivery. Leave nothing to chance.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-emerald-400 font-code bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="animate-bounce">↓</span> Keep scrolling
            </div>
          </div>

          <div className="w-full md:w-7/12 flex flex-col z-10 relative">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.id} 
                  className="sticky w-full min-h-112.5 bg-[#131517] border-t border-x border-zinc-800 rounded-4xl p-8 md:p-12 shadow-[0_-25px_50px_-12px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden"
                  style={{ 
                    top: `calc(8rem + ${index * 1.5}rem)`, 
                    zIndex: index + 10,
                    marginBottom: index === features.length - 1 ? '0' : '40vh' 
                  }}
                >
                  <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[100px] rounded-full opacity-10 pointer-events-none ${feature.bg}`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-colors duration-500 ${feature.bg} border-white/5`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="mt-8 w-full bg-[#0C0D0E] border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-40 z-10">
                    {index === 0 && (
                      <div className="flex flex-col gap-2 font-code text-xs text-zinc-500">
                        <div className="flex items-center gap-3 bg-[#131517] p-3 rounded-lg border border-zinc-800 w-2/3"><div className="w-6 h-6 rounded bg-zinc-800" /> [SRC: REGISTRY]</div>
                        <ArrowRight className="w-4 h-4 text-emerald-500 ml-8 rotate-90" />
                        <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 w-2/3 self-end"><div className="w-6 h-6 rounded bg-emerald-500/20" /> [DEST: SEET]</div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="relative h-full w-full border-l-2 border-teal-500/30 pl-6 flex flex-col justify-center gap-6 py-4 font-code text-xs">
                        <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-1.75 top-4 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                        <div className="absolute w-3 h-3 bg-zinc-700 rounded-full -left-1.75 bottom-4" />
                        <div className="text-teal-400">14:03:22 - IN_TRANSIT</div>
                        <div className="text-zinc-600">PENDING_ACCEPTANCE</div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-4 font-code">
                        <Lock className="w-10 h-10 text-zinc-600 mb-4" />
                        <div className="text-xs text-zinc-500 mb-1">AUTH_REQUIRED</div>
                        <div className="text-[10px] text-zinc-700">RESTRICTED_PAYLOAD</div>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="w-full h-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col items-center justify-center py-6 font-code">
                        <CheckCircle className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-3" />
                        <span className="text-xs text-emerald-500/80">VERIFIED_IMMUTABLE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. THREE-COLUMN FEATURES */}
      <section id="benefits" className="py-24 px-6 relative border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#131517] border border-zinc-800/80 rounded-4xl p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <FileText className="text-zinc-500 w-8 h-8 mb-6 group-hover:text-emerald-400 transition-colors" />
              <h3 className="text-xl font-bold mb-3 text-white tracking-tight">Centralized Records</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Every dispatched file is logged. Generate instant reports for HODs and administrative panels.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-4xl p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <Shield className="text-zinc-500 w-8 h-8 mb-6 group-hover:text-teal-400 transition-colors" />
              <h3 className="text-xl font-bold mb-3 text-white tracking-tight">Immutable Ledger</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                The database acts as a black box. Actions cannot be erased or altered, ensuring total accountability.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-4xl p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <Search className="text-zinc-500 w-8 h-8 mb-6 group-hover:text-zinc-300 transition-colors" />
              <h3 className="text-xl font-bold mb-3 text-white tracking-tight">Instant Search</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Locate any document via ID, sender, or date. Reduce physical archive searching to milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-white/5 pt-12 pb-8 px-6 text-center text-sm text-zinc-600 font-code">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0 text-zinc-500">
            <Terminal className="w-4 h-4" /> DocuTrack FUTO
          </div>
          <div className="bg-[#131517] px-3 py-1 rounded-md border border-zinc-800 text-xs">INTERNAL ADMINISTRATIVE USE ONLY</div>
        </div>
      </footer>
    </div>
  );
}