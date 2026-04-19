"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Search, Filter, Clock, CheckCircle2, 
  AlertCircle, FileDigit, ShieldCheck, Loader2 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMySecureDocuments() {
      // 1. Get current logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // 2. THE SECURITY LOCK: Only fetch docs sent BY them or TO them
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
      } else if (data) {
        setDocuments(data);
      }
      setIsLoading(false);
    }

    fetchMySecureDocuments();
  }, []);

  // Filter logic for the search bar
  const filteredDocs = documents.filter(doc => 
    (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.tracking_id && doc.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function for Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dispatched':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-bold uppercase tracking-wider border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Dispatched</span>;
      case 'Accepted':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'Delivered':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-500/20"><ShieldCheck className="w-3.5 h-3.5" /> Delivered</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-[11px] font-bold uppercase tracking-wider border border-zinc-500/20"><AlertCircle className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-2 font-rare pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Document Ledger</h1>
          <p className="text-zinc-400 font-light">Monitor the live status of your secure inbound and outbound traffic.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search ID or Title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-[#131517] border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#131517] hover:bg-zinc-800 text-zinc-300 font-bold text-sm px-5 py-2.5 rounded-xl border border-zinc-800/80 transition-all shadow-lg">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#131517] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] border-b border-zinc-800/80 text-zinc-500 font-mono text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 font-medium">Tracking ID</th>
                <th className="px-6 py-5 font-medium">Document Title</th>
                <th className="px-6 py-5 font-medium">Format</th>
                <th className="px-6 py-5 font-medium">Timestamp</th>
                <th className="px-6 py-5 font-medium">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-emerald-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <span className="font-mono text-xs tracking-widest uppercase">Syncing Ledger...</span>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/30 flex items-center justify-center mx-auto mb-4 border border-zinc-800/50">
                      <FileText className="w-6 h-6 text-zinc-600" />
                    </div>
                    No documents found in your personal ledger.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr 
                    key={doc.id} 
                    // Use Next.js router instead of window.location for seamless, instant transitions
                    onClick={() => router.push(`/documents/${doc.tracking_id || doc.id}`)}
                    className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5 whitespace-nowrap font-mono text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors">
                      {doc.tracking_id}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-zinc-100 group-hover:text-white transition-colors">{doc.title}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-[250px] mt-1">{doc.description}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs bg-[#09090b] px-3 py-1.5 rounded-lg border border-zinc-800/80 inline-flex">
                        {doc.type === 'Digital' ? <FileDigit className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
                        {doc.type}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap font-mono text-xs text-zinc-500">
                      {new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}