"use client";

import { useState, useEffect } from "react";
import { 
  Shield, ArrowRight, Send, MapPin, Lock, 
  CheckCircle, FileText, Search, Terminal
} from "lucide-react";
import Link from "next/link";

const GlitchText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const symbols = "01X$#@*></\\{}[]%&";

  useEffect(() => {
    let animationInterval: NodeJS.Timeout;

    const triggerDecode = () => {
      setIsGlitching(true);
      const lockTimes = Array.from({ length: text.length }).map(() => Math.floor(Math.random() * 30) + 10);
      let frame = 0;

      animationInterval = setInterval(() => {
        setDisplayText((_) => {
          return text.split("").map((char, index) => {
            if (char === " ") return " ";
            if (frame >= lockTimes[index]) return char;
            return symbols[Math.floor(Math.random() * symbols.length)];
          }).join("");
        });
        frame++;
        if (frame > Math.max(...lockTimes)) {
          clearInterval(animationInterval);
          setIsGlitching(false);
          setDisplayText(text);
        }
      }, 50);
    };

    const initialTimeout = setTimeout(triggerDecode, 1000);
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

export default function LandingPage() {
  const features = [
    { id: "dispatch", title: "Smart Dispatch", desc: "Assign documents to specific staff members across departments with full traceability. No more physical files lost in transit.", icon: Send, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "tracking", title: "Real-Time Tracking", desc: "Monitor document movement from sender to receiver. View precise timestamps and current holding locations instantly.", icon: MapPin, color: "text-teal-400", bg: "bg-teal-500/10" },
    { id: "access", title: "Controlled Access", desc: "Documents remain strictly restricted until formally accepted by the recipient. Enforce university hierarchy seamlessly.", icon: Lock, color: "text-zinc-300", bg: "bg-zinc-500/10" },
    { id: "proof", title: "Proof of Delivery", desc: "Upload visual verification for physical documents upon receipt. Eliminate disputes with an immutable system ledger.", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-600/10" }
  ];

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-zinc-100 selection:bg-emerald-500/30 font-rare">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-rare { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
      `}} />

      {/* FLOATING NAVBAR */}
      <div className="fixed top-6 md:top-10 w-full z-50 flex justify-center px-6 pointer-events-none">
        <nav className="pointer-events-auto bg-[#131517]/80 backdrop-blur-xl border border-white/5 rounded-full px-4 py-2 flex items-center justify-between w-full max-w-4xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div className="flex items-center gap-3 pl-4">
            <Shield className="text-emerald-500 w-6 h-6 stroke-[2px]" />
            <span className="text-base font-bold tracking-tight text-white">DocuTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          </div>
          <Link href="/login" className="px-6 py-2.5 text-sm font-semibold bg-emerald-500 text-emerald-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            Log In
          </Link>
        </nav>
      </div>

      {/* HERO SECTION - FORCED 5XL MAX-WIDTH FOR MASSIVE EDGE WHITESPACE */}
      <main className="relative pt-48 md:pt-80 pb-32 md:pb-64 px-6 md:px-16 lg:px-32 xl:px-48 flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-200 bg-emerald-600/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-150 h-100 bg-teal-600/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-code font-semibold text-emerald-400 mb-10 md:mb-14 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <Terminal className="w-4 h-4" /> SYS_VER_1.0_LIVE
        </div>

        <h1 className="text-5xl md:text-[5.5rem] lg:text-8xl font-bold tracking-tighter max-w-5xl mb-8 leading-[1.05] text-white">
          Secure document flow. <br className="hidden md:block"/>
          <GlitchText text="Automated." />
        </h1>
        
        <p className="text-lg md:text-2xl lg:text-3xl text-zinc-400 max-w-3xl mb-16 md:mb-20 leading-relaxed font-light tracking-wide">
          The centralized platform designed to track, verify, and deliver administrative documents across university departments.
        </p>

        <div className="flex items-center w-full max-w-lg bg-[#131517] border border-white/5 rounded-full p-2 pl-6 mb-32 md:mb-48 shadow-2xl backdrop-blur-md focus-within:border-emerald-500/50 transition-colors z-10">
          <Search className="w-6 h-6 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Track document ID..." 
            className="flex-1 bg-transparent border-none text-base md:text-lg text-white focus:outline-none focus:ring-0 px-4 placeholder:text-zinc-600 font-code"
            disabled
          />
          <Link href="/login" className="px-8 py-4 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 text-base md:text-lg font-bold transition-colors flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Access <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Elevated Dashboard Mockup - Constrained to max-w-5xl */}
        <div className="w-full max-w-5xl rounded-3xl md:rounded-[2.5rem] border border-zinc-800 bg-[#131517]/90 backdrop-blur-xl p-6 lg:p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden z-10">
           <div className="flex items-center gap-2.5 mb-6 px-2">
             <div className="w-4 h-4 rounded-full bg-zinc-700" />
             <div className="w-4 h-4 rounded-full bg-zinc-700" />
             <div className="w-4 h-4 rounded-full bg-zinc-700" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-100 lg:h-125">
             <div className="hidden md:flex col-span-1 border-r border-white/5 flex-col gap-6 pr-6">
                <div className="h-10 w-full bg-zinc-800/50 rounded-xl" />
                <div className="h-10 w-3/4 bg-zinc-800/50 rounded-xl" />
                <div className="h-10 w-5/6 bg-zinc-800/50 rounded-xl" />
             </div>
             <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
               <div className="flex justify-between items-center mb-2">
                 <div className="h-8 w-48 lg:w-64 bg-zinc-800/80 rounded-lg" />
                 <div className="h-10 w-28 lg:w-32 bg-emerald-500/20 border border-emerald-500/30 rounded-xl" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                  <div className="h-32 lg:h-40 bg-[#1C1F22] rounded-2xl border border-white/5" />
                  <div className="h-32 lg:h-40 bg-[#1C1F22] rounded-2xl border border-white/5" />
                  <div className="hidden md:block h-32 lg:h-40 bg-[#1C1F22] rounded-2xl border border-white/5" />
               </div>
               <div className="flex-1 bg-[#1C1F22] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                  <div className="h-12 lg:h-16 w-full bg-[#131517] rounded-xl flex items-center px-6"><div className="h-3 w-3 rounded-full bg-emerald-500" /></div>
                  <div className="h-12 lg:h-16 w-full bg-[#131517] rounded-xl flex items-center px-6"><div className="h-3 w-3 rounded-full bg-zinc-500" /></div>
               </div>
             </div>
           </div>
        </div>
      </main>

      {/* CARD STACKING SECTION - CLAMPED TO 5XL, MASSIVE GAP-32 BETWEEN COLUMNS */}
      <section id="workflow" className="relative pt-40 md:pt-64 pb-48 md:pb-64 px-6 md:px-16 lg:px-32 xl:px-48 border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-32 relative">
          
          <div className="w-full lg:w-5/12 lg:sticky top-48 pt-10 z-0">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Built for Controlled Document Flow.
            </h2>
            <p className="text-lg md:text-2xl text-zinc-400 mb-12 font-light tracking-wide leading-relaxed">
              Every document is tracked, verified, and accounted for from creation to delivery. Leave nothing to chance.
            </p>
            <div className="inline-flex items-center gap-3 text-base text-emerald-400 font-code bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-500/20">
              <span className="animate-bounce">↓</span> Keep scrolling
            </div>
          </div>

          <div className="w-full lg:w-7/12 flex flex-col z-10 relative">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.id} 
                  className="sticky w-full min-h-75 md:min-h-125 bg-[#131517] border-t border-x border-zinc-800 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 shadow-[0_-25px_60px_-15px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden"
                  style={{ 
                    top: `calc(10rem + ${index * 2}rem)`, 
                    zIndex: index + 10,
                    marginBottom: index === features.length - 1 ? '0' : '40vh' 
                  }}
                >
                  <div className={`absolute -right-32 -top-32 w-96 h-96 blur-[120px] rounded-full opacity-10 pointer-events-none ${feature.bg}`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-12 border transition-colors duration-500 ${feature.bg} border-white/5`}>
                      <Icon className={`w-8 h-8 md:w-10 md:h-10 ${feature.color}`} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="mt-10 w-full bg-[#0C0D0E] border border-zinc-800/50 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-center min-h-30 md:min-h-45 z-10">
                    {index === 0 && (
                      <div className="flex flex-col gap-3 font-code text-[10px] md:text-sm text-zinc-500">
                        <div className="flex items-center gap-4 bg-[#131517] p-4 rounded-xl border border-zinc-800 w-full md:w-2/3"><div className="w-8 h-8 rounded-lg bg-zinc-800" /> [SRC: REGISTRY]</div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 ml-10 rotate-90" />
                        <div className="flex items-center gap-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 w-full md:w-2/3 md:self-end"><div className="w-8 h-8 rounded-lg bg-emerald-500/20" /> [DEST: SEET]</div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="relative h-full w-full border-l-2 border-teal-500/30 pl-8 flex flex-col justify-center gap-8 py-6 font-code text-xs md:text-sm">
                        <div className="absolute w-4 h-4 bg-teal-500 rounded-full -left-2.25 top-6 shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                        <div className="absolute w-4 h-4 bg-zinc-700 rounded-full -left-2.25 bottom-6" />
                        <div className="text-teal-400">14:03:22 - IN_TRANSIT</div>
                        <div className="text-zinc-600">PENDING_ACCEPTANCE</div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6 font-code">
                        <Lock className="w-10 h-10 md:w-14 md:h-14 text-zinc-600 mb-5" />
                        <div className="text-xs md:text-sm text-zinc-500 mb-2">AUTH_REQUIRED</div>
                        <div className="text-[10px] md:text-xs text-zinc-700">RESTRICTED_PAYLOAD</div>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="w-full h-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col items-center justify-center py-8 font-code">
                        <CheckCircle className="w-10 h-10 md:w-14 md:h-14 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4" />
                        <span className="text-xs md:text-sm text-emerald-500/80">VERIFIED_IMMUTABLE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THREE-COLUMN FEATURES - CLAMPED TO 5XL */}
      <section id="benefits" className="py-32 md:py-56 px-6 md:px-16 lg:px-32 xl:px-48 relative border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
            <div className="bg-[#131517] border border-zinc-800/80 rounded-3xl md:rounded-[2.5rem] p-8 md:p-14 hover:bg-[#1A1D21] transition-colors group shadow-xl">
              <FileText className="text-zinc-500 w-10 h-10 md:w-12 md:h-12 mb-8 group-hover:text-emerald-400 transition-colors" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight">Centralized Records</h3>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light">
                Every dispatched file is logged. Generate instant reports for HODs and administrative panels.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-3xl md:rounded-[2.5rem] p-8 md:p-14 hover:bg-[#1A1D21] transition-colors group shadow-xl">
              <Shield className="text-zinc-500 w-10 h-10 md:w-12 md:h-12 mb-8 group-hover:text-teal-400 transition-colors" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight">Immutable Ledger</h3>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light">
                The database acts as a black box. Actions cannot be erased or altered, ensuring total accountability.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-3xl md:rounded-[2.5rem] p-8 md:p-14 hover:bg-[#1A1D21] transition-colors group shadow-xl">
              <Search className="text-zinc-500 w-10 h-10 md:w-12 md:h-12 mb-8 group-hover:text-zinc-300 transition-colors" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight">Instant Search</h3>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light">
                Locate any document via ID, sender, or date. Reduce physical archive searching to milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-16 pb-12 px-6 md:px-16 lg:px-32 xl:px-48 text-center text-sm md:text-base text-zinc-600 font-code">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-6 md:mb-0 text-zinc-500">
            <Terminal className="w-5 h-5" /> DocuTrack FUTO
          </div>
          <div className="bg-[#131517] px-4 py-2 rounded-lg border border-zinc-800 text-xs md:text-sm">INTERNAL ADMINISTRATIVE USE ONLY</div>
        </div>
      </footer>
    </div>
  );
}