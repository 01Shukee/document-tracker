"use client";

import { useState } from "react";
import { 
  Shield, 
  ArrowRight, 
  Terminal,
  Mail,
  Key,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// FIXED PATH: Went up 3 levels to account for the (auth) folder!
import { supabase } from "../../../lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // 1. Authenticate with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Invalid credentials or access revoked.");
      setIsLoading(false);
      return;
    }

    // 2. Success! Teleport to the Command Center
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-zinc-100 selection:bg-emerald-500/30 font-rare flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Import our premium fonts just for this layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-rare { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
      `}} />

      {/* Atmospheric Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-150 h-100 bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen -translate-y-1/4" />
        <div className="absolute w-100 h-75 bg-teal-600/10 blur-[100px] rounded-full mix-blend-screen translate-y-1/4" />
      </div>

      <div className="w-full max-w-md bg-[#131517]/90 backdrop-blur-xl border border-zinc-800/80 rounded-4xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Shield className="text-emerald-500 w-6 h-6 stroke-[1.5px]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Secure Authentication</h1>
          <div className="flex items-center gap-2 text-xs font-code text-zinc-500 bg-[#0C0D0E] px-3 py-1 rounded-md border border-zinc-800">
            <Terminal className="w-3 h-3" /> DOCUTRACK_GATEWAY
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-code text-center animate-in fade-in slide-in-from-top-2">
            ERR: {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider ml-1">Institutional Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-zinc-600" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0C0D0E] border border-zinc-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-rare placeholder:text-zinc-600"
                placeholder="name@institution.edu"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider">Secure Password</label>
              <Link href="#" className="text-[11px] font-rare text-emerald-500/70 hover:text-emerald-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Key className="absolute left-3 w-4 h-4 text-zinc-600" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0C0D0E] border border-zinc-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-rare placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="font-code text-xs animate-pulse">VERIFYING_CREDENTIALS...</span>
            ) : (
              <>Authenticate <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-sm text-zinc-400">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors border-b border-transparent hover:border-emerald-300 ml-1">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}