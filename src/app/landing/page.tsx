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
      <div className="fixed top-6 w-full z-50 flex justify-center px-6 pointer-events-none">
        <nav className="pointer-events-auto bg-[#131517]/80 backdrop-blur-xl border border-white/5 rounded-full px-4 py-1.5 flex items-center justify-between w-full max-w-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div className="flex items-center gap-2 pl-3">
            <Shield className="text-emerald-500 w-4 h-4 stroke-[2px]" />
            <span className="text-sm font-bold tracking-tight text-white">DocuTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          </div>
          <Link href="/login" className="px-5 py-2 text-xs font-semibold bg-emerald-500 text-emerald-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            Log In
          </Link>
        </nav>
      </div>

      {/* HERO SECTION */}
      <main className="relative pt-32 md:pt-56 pb-24 md:pb-40 px-6 flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center">
          <div className="absolute top-0 w-150 md:w-200 h-100 md:h-150 bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-40 w-100 md:w-150 h-75 md:h-100 bg-teal-600/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] md:text-xs font-code font-semibold text-emerald-400 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10">
          <Terminal className="w-3 h-3" /> SYS_VER_1.0_LIVE
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-[5.5rem] font-bold tracking-tighter max-w-3xl mb-6 leading-[1.05] text-white z-10">
          Secure document flow. <br className="hidden md:block"/>
          <GlitchText text="Automated." />
        </h1>
        
        <p className="text-sm md:text-base lg:text-lg text-zinc-400 max-w-xl mb-12 leading-relaxed font-light tracking-wide z-10">
          The centralized platform designed to track, verify, and deliver administrative documents across university departments.
        </p>

        <div className="flex items-center w-full max-w-sm bg-[#131517] border border-white/5 rounded-full p-1 pl-4 mb-20 md:mb-32 shadow-2xl backdrop-blur-md focus-within:border-emerald-500/50 transition-colors z-10">
          <Search className="w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Track document ID..." 
            className="flex-1 bg-transparent border-none text-xs md:text-sm text-white focus:outline-none focus:ring-0 px-3 placeholder:text-zinc-600 font-code"
            disabled
          />
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 text-xs md:text-sm font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            Access <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mockup scaled down to 4xl */}
        <div className="w-full max-w-4xl rounded-2xl md:rounded-3xl border border-zinc-800 bg-[#131517]/90 backdrop-blur-xl p-4 md:p-5 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden z-10">
           <div className="flex items-center gap-2 mb-4 px-1">
             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-64 lg:h-80">
             <div className="hidden md:flex col-span-1 border-r border-white/5 flex-col gap-3 pr-4">
                <div className="h-6 w-full bg-zinc-800/50 rounded-md" />
                <div className="h-6 w-3/4 bg-zinc-800/50 rounded-md" />
                <div className="h-6 w-5/6 bg-zinc-800/50 rounded-md" />
             </div>
             <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
               <div className="flex justify-between items-center mb-1">
                 <div className="h-5 w-32 md:w-40 bg-zinc-800/80 rounded-md" />
                 <div className="h-7 w-20 bg-emerald-500/20 border border-emerald-500/30 rounded-md" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
                  <div className="h-20 md:h-24 bg-[#1C1F22] rounded-lg border border-white/5" />
                  <div className="h-20 md:h-24 bg-[#1C1F22] rounded-lg border border-white/5" />
                  <div className="hidden md:block h-20 md:h-24 bg-[#1C1F22] rounded-lg border border-white/5" />
               </div>
               <div className="flex-1 bg-[#1C1F22] rounded-lg border border-white/5 p-4 flex flex-col gap-3">
                  <div className="h-8 md:h-10 w-full bg-[#131517] rounded-md flex items-center px-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /></div>
                  <div className="h-8 md:h-10 w-full bg-[#131517] rounded-md flex items-center px-3"><div className="h-1.5 w-1.5 rounded-full bg-zinc-500" /></div>
               </div>
             </div>
           </div>
        </div>
      </main>

      {/* WORKFLOW SECTION */}
      <section id="workflow" className="relative pt-24 md:pt-40 pb-32 md:pb-48 px-6 border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-12 lg:gap-16 relative">
          
          <div className="w-full md:w-5/12 md:sticky top-32 pt-6 z-0">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
              Built for Controlled Document Flow.
            </h2>
            <p className="text-sm md:text-base text-zinc-400 mb-6 font-light tracking-wide leading-relaxed">
              Every document is tracked, verified, and accounted for from creation to delivery. Leave nothing to chance.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-code bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="animate-bounce">↓</span> Keep scrolling
            </div>
          </div>

          <div className="w-full md:w-7/12 flex flex-col z-10 relative">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.id} 
                  className="sticky w-full min-h-56 md:min-h-80 bg-[#131517] border-t border-x border-zinc-800 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-[0_-15px_40px_-10px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden"
                  style={{ 
                    top: `calc(8rem + ${index * 1.5}rem)`, 
                    zIndex: index + 10,
                    marginBottom: index === features.length - 1 ? '0' : '25vh' 
                  }}
                >
                  <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[80px] rounded-full opacity-10 pointer-events-none ${feature.bg}`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-6 border transition-colors duration-500 ${feature.bg} border-white/5`}>
                      <Icon className={`w-6 h-6 md:w-7 md:h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="mt-6 w-full bg-[#0C0D0E] border border-zinc-800/50 rounded-xl md:rounded-[1.25rem] p-4 relative overflow-hidden flex flex-col justify-center min-h-20 md:min-h-24 z-10">
                    {index === 0 && (
                      <div className="flex flex-col gap-2 font-code text-[9px] md:text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2.5 bg-[#131517] p-2.5 rounded border border-zinc-800 w-full md:w-2/3"><div className="w-5 h-5 rounded bg-zinc-800" /> [SRC: REGISTRY]</div>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 ml-6 rotate-90" />
                        <div className="flex items-center gap-2.5 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 w-full md:w-2/3 md:self-end"><div className="w-5 h-5 rounded bg-emerald-500/20" /> [DEST: SEET]</div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="relative h-full w-full border-l-2 border-teal-500/30 pl-5 flex flex-col justify-center gap-5 py-3 font-code text-[9px] md:text-[11px]">
                        <div className="absolute w-2.5 h-2.5 bg-teal-500 rounded-full -left-[5.5px] top-3 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                        <div className="absolute w-2.5 h-2.5 bg-zinc-700 rounded-full -left-[5.5px] bottom-3" />
                        <div className="text-teal-400">14:03:22 - IN_TRANSIT</div>
                        <div className="text-zinc-600">PENDING_ACCEPTANCE</div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-3 font-code">
                        <Lock className="w-7 h-7 md:w-8 md:h-8 text-zinc-600 mb-3" />
                        <div className="text-[9px] md:text-[11px] text-zinc-500 mb-1">AUTH_REQUIRED</div>
                        <div className="text-[8px] md:text-[9px] text-zinc-700">RESTRICTED_PAYLOAD</div>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="w-full h-full bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex flex-col items-center justify-center py-5 font-code">
                        <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] mb-2" />
                        <span className="text-[9px] md:text-[11px] text-emerald-500/80">VERIFIED_IMMUTABLE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-20 md:py-32 px-6 relative border-t border-white/5 bg-[#0C0D0E]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-6 md:p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <FileText className="text-zinc-500 w-8 h-8 mb-5 group-hover:text-emerald-400 transition-colors" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-white tracking-tight">Centralized Records</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
                Every dispatched file is logged. Generate instant reports for HODs and administrative panels.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-6 md:p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <Shield className="text-zinc-500 w-8 h-8 mb-5 group-hover:text-teal-400 transition-colors" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-white tracking-tight">Immutable Ledger</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
                The database acts as a black box. Actions cannot be erased or altered, ensuring total accountability.
              </p>
            </div>
            <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-6 md:p-8 hover:bg-[#1A1D21] transition-colors group shadow-lg">
              <Search className="text-zinc-500 w-8 h-8 mb-5 group-hover:text-zinc-300 transition-colors" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-white tracking-tight">Instant Search</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
                Locate any document via ID, sender, or date. Reduce physical archive searching to milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-10 pb-8 px-6 text-center text-[10px] md:text-xs text-zinc-600 font-code">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-3 md:mb-0 text-zinc-500">
            <Terminal className="w-3.5 h-3.5" /> DocuTrack FUTO
          </div>
          <div className="bg-[#131517] px-2.5 py-1 rounded border border-zinc-800 text-[9px] md:text-[10px]">INTERNAL ADMINISTRATIVE USE ONLY</div>
        </div>
      </footer>
    </div>
  );
}