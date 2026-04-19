"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { 
  Send, Inbox, Activity, Plus, Search, FileText, 
  Loader2, Clock, LogOut, User
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [departmentName, setDepartmentName] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [metrics, setMetrics] = useState({
    outbound: 0,
    inbox: 0,
    accepted: 0
  });

  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const userId = session.user.id;
      const { data: profile } = await supabase.from("profiles").select(`full_name, role, departments ( name )`).eq("id", userId).maybeSingle(); 
      
      if (profile) {
        setUserName(profile.full_name || "Unknown User");
        setUserRole(profile.role || "STAFF");
        if (profile.departments) {
          const deptInfo: any = profile.departments;
          const extractedName = Array.isArray(deptInfo) ? deptInfo[0]?.name : deptInfo?.name;
          if (extractedName) setDepartmentName(extractedName);
        }
      }

      const { data: userDocs } = await supabase
        .from('documents')
        .select('status, created_at, title, tracking_id, sender_id, recipient_id')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
      
      if (userDocs) {
        const safeUserId = String(userId).toLowerCase();
        const sentByMe = userDocs.filter((d: any) => d.sender_id && String(d.sender_id).toLowerCase() === safeUserId);
        const receivedByMe = userDocs.filter((d: any) => d.recipient_id && String(d.recipient_id).toLowerCase() === safeUserId);

        setMetrics({
          outbound: sentByMe.length,
          inbox: receivedByMe.filter((d: any) => {
            const status = String(d.status).toLowerCase();
            return status === 'dispatched' || status === 'pending';
          }).length, 
          accepted: sentByMe.filter((d: any) => String(d.status).toLowerCase() === 'accepted').length 
        });

        const sortedDocs = userDocs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentDocs(sortedDocs.slice(0, 5));
      }
      setIsLoading(false);
    }

    loadDashboardData();

    const dashboardChannel = supabase
      .channel('live-dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        loadDashboardData(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(dashboardChannel); };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/landing");
  };

  const filteredDocs = recentDocs.filter(doc => 
    (doc.tracking_id && doc.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
      </div>
    );
  }

  return (
    // FIX 1: Added px-4 sm:px-6 for safe padding on phone screens
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 font-rare">
      
      {/* Identity Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#131517] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-6 md:mb-8 shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-lg sm:text-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg leading-tight truncate">{userName}</h3>
            <div className="text-[10px] sm:text-xs font-mono text-zinc-500 mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate max-w-[120px] sm:max-w-none">{departmentName}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
              <span className="text-emerald-400 uppercase tracking-wider shrink-0">{userRole}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-xl transition-all text-sm font-medium border border-zinc-800 hover:border-red-500/30 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Secure Sign Out</span>
        </button>
      </div>

      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 md:mb-2">Command Center</h2>
          <p className="text-sm md:text-base text-zinc-400 font-light">Monitor your personal dispatch ledger and pending tasks.</p>
        </div>
        <Link href="/dispatch" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          New Dispatch
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500 tracking-wider">OUTBOUND</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metrics.outbound}</div>
          <div className="text-xs md:text-sm text-zinc-400 font-light">Total Dispatched By You</div>
        </div>

        <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Inbox className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500 tracking-wider">INBOX</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-1 relative z-10">{metrics.inbox}</div>
          <div className="text-xs md:text-sm text-zinc-400 font-light relative z-10">Action Required By You</div>
        </div>

        <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-lg sm:col-span-2 md:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500 tracking-wider">NETWORK</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metrics.accepted}</div>
          <div className="text-xs md:text-sm text-zinc-400 font-light">Total Successful Routes</div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="p-4 md:p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            <h3 className="text-base md:text-lg font-bold text-white">Your Recent Activity</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID..." 
              className="bg-[#0C0D0E] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono w-full"
            />
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {filteredDocs.length === 0 ? (
            <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 md:w-8 md:h-8 text-zinc-600" />
              </div>
              <p className="text-sm md:text-base text-zinc-300 font-medium mb-1">
                {searchQuery ? "No matching documents found" : "Your ledger is empty"}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc, idx) => (
              // FIX 2: Added flex-col on mobile so the date drops below the title gracefully
              <Link key={idx} href={`/documents/${doc.tracking_id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 hover:bg-zinc-800/30 transition-colors group gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto overflow-hidden">
                  <div className={`mt-1 sm:mt-0 w-2 h-2 shrink-0 rounded-full ${String(doc.status).toLowerCase() === 'accepted' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">{doc.title}</p>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-mono mt-1 truncate">{doc.tracking_id} • <span className={String(doc.status).toLowerCase() === 'accepted' ? 'text-emerald-500/70' : 'text-amber-500/70'}>{doc.status}</span></p>
                  </div>
                </div>
                <div className="text-[10px] md:text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors pl-5 sm:pl-0">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}