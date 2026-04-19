"use client";

import { useEffect, useState } from "react";
import { 
  FileSearch, Clock, Inbox, ArrowRight, 
  Loader2, Filter, AlertCircle 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function ApprovalsInbox() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("Pending"); // Pending or All

  useEffect(() => {
    async function fetchMyInbox() {
      // 1. Get current user
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Fetch documents assigned specifically to THEM
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('recipient_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching inbox:", error);
        } else if (data) {
          setDocuments(data);
        }
      }
      setIsLoading(false);
    }

    fetchMyInbox();
  }, []);

  // Filter logic: 'Pending' shows only Dispatched docs awaiting action.
  const filteredDocs = documents.filter(doc => 
    filter === "All" ? true : doc.status === "Dispatched"
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2 font-rare pb-12">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Action Inbox</h2>
          <p className="text-zinc-400 font-light">Documents securely routed to you for review or authorization.</p>
        </div>

        <div className="flex bg-[#131517] p-1.5 rounded-xl border border-zinc-800/80 shadow-lg">
          <button 
            onClick={() => setFilter("Pending")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${filter === "Pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}`}
          >
            <AlertCircle className="w-4 h-4" /> To Action
          </button>
          <button 
            onClick={() => setFilter("All")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${filter === "All" ? "bg-zinc-800 text-zinc-100 border border-zinc-700" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}`}
          >
            <Clock className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        // Empty State
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center bg-[#131517]/50 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-800">
            <Inbox className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-300 mb-2">Your inbox is clear</h3>
          <p className="text-zinc-500 text-sm max-w-md">
            {filter === "Pending" 
              ? "You have zero documents currently awaiting your authorization or signature." 
              : "You have no historical documents in your personal ledger."}
          </p>
        </div>
      ) : (
        // Document List
        <div className="flex flex-col gap-4">
          {filteredDocs.map((doc) => (
            <Link 
              key={doc.id} 
              // Route to the unique tracking ID page to view/accept the document
              href={`/documents/${doc.tracking_id || doc.id}`} 
              className="group relative rounded-2xl border border-zinc-800/80 bg-[#131517] p-6 hover:border-emerald-500/40 transition-all shadow-lg overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              {/* Dynamic Status Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${doc.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
              
              <div className="flex gap-5">
                <div className={`mt-1 h-12 w-12 rounded-xl flex shrink-0 items-center justify-center border shadow-inner ${doc.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'}`}>
                  <FileSearch className="w-6 h-6" />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{doc.title}</h3>
                    {doc.priority === 'High' && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-400 line-clamp-1 max-w-2xl mb-4">
                    {doc.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-[#0C0D0E] px-3 py-1 rounded-lg border border-zinc-800">
                      <Filter className="w-3.5 h-3.5 text-zinc-400" /> Action: <strong className="text-zinc-300 uppercase tracking-wider">{doc.expected_action || 'Review'}</strong>
                    </span>
                    <span className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      ID: <strong className="text-zinc-400">{doc.tracking_id}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold opacity-0 group-hover:opacity-100 group-hover:translate-x-[-10px] transition-all whitespace-nowrap self-end sm:self-center">
                Open File <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}