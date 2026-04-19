"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Clock, LogOut, Terminal } from "lucide-react";

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkClearance() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session || error) {
        router.push("/landing");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select('*')
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      setIsLoading(false);
    }
    
    checkClearance();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/landing");
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0D0E] flex flex-col items-center justify-center font-code text-emerald-500">
        <Terminal className="w-8 h-8 animate-pulse mb-4" />
        <p className="text-sm tracking-widest">VERIFYING_CLEARANCE...</p>
      </div>
    );
  }

  // --- LOCKED STATE (PENDING APPROVAL) ---
  if (profile?.status === "Pending") {
    return (
      <div className="min-h-screen bg-[#0C0D0E] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-[#131517]/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="text-amber-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Clearance Pending</h1>
          <p className="text-sm text-zinc-400 mb-8">
            Your identity has been verified, but your system access request is currently under review by a central administrator.
          </p>

          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-colors border border-zinc-700/50">
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE STATE: RENDER YOUR LAYOUT ---
  return <>{children}</>;
}