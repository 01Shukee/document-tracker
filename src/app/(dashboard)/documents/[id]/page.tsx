"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Download, CheckCircle2, 
  Clock, ShieldCheck, AlertCircle, Loader2, Calendar 
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      // 1. Get the Current User's ID for the "Perspective Check"
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      // 2. Fetch the document using the tracking_id from the URL
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('tracking_id', params.id)
        .maybeSingle();

      // Fallback just in case the URL used the database UUID instead
      if (!data) {
        const { data: fallbackData } = await supabase
          .from('documents')
          .select('*')
          .eq('id', params.id)
          .maybeSingle();
          
        if (fallbackData) setDoc(fallbackData);
      } else {
        setDoc(data);
      }
      
      setIsLoading(false);
    }

    if (params.id) fetchDocument();
  }, [params.id]);

  // Action to change status
  const handleAcceptDocument = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('documents')
      .update({ status: 'Accepted' })
      .eq('id', doc.id);

    setIsUpdating(false);

    if (error) {
      alert("Failed to update status.");
    } else {
      // Update local state to reflect the change instantly
      setDoc({ ...doc, status: 'Accepted' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 font-rare">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        <p className="tracking-widest text-sm uppercase">Decrypting payload...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-24 font-rare">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">Record Not Found</h2>
        <p className="text-zinc-400 mt-2">The requested tracking ID does not exist or you lack clearance.</p>
        <button onClick={() => router.back()} className="text-emerald-500 mt-6 inline-block hover:text-emerald-400 transition-colors font-medium border-b border-emerald-500/30 hover:border-emerald-400">
          Return to Command Center
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 font-rare">
      
      {/* Back Button & Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-6 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">{doc.title}</h1>
              {doc.status === 'Dispatched' && <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">Action Required</span>}
              {doc.status === 'Accepted' && <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-3 h-3 inline mr-1" />Accepted</span>}
            </div>
            <p className="text-zinc-500 font-mono text-sm tracking-wider">ID: <span className="text-zinc-400">{doc.tracking_id}</span></p>
          </div>

          {/* THE PERSPECTIVE CHECK (Dynamic Action UI) */}
          <div className="flex-shrink-0">
            {doc.status === 'Dispatched' && currentUserId === doc.recipient_id && (
              <button 
                onClick={handleAcceptDocument}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 stroke-[2.5px]" />}
                Acknowledge & Sign
              </button>
            )}

            {doc.status === 'Dispatched' && currentUserId === doc.sender_id && (
              <div className="flex items-center gap-2 bg-[#131517] border border-amber-500/30 text-amber-500 font-bold px-5 py-3 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 animate-pulse" />
                Awaiting Recipient
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131517] p-8 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/80 pb-3">Document Description</h3>
            <p className="text-zinc-300 whitespace-pre-wrap text-base leading-relaxed">{doc.description}</p>
            
            {doc.additional_notes && (
              <div className="mt-8 p-5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest mb-2">Sender's Additional Notes</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{doc.additional_notes}</p>
              </div>
            )}
          </div>

          {/* File Attachment Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131517] p-8 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/80 pb-3">Attached Secure File</h3>
            {doc.file_url ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-zinc-800 bg-[#09090b] gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <FileText className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100">Encrypted Payload</p>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">{doc.type} Upload</p>
                  </div>
                </div>
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors border border-zinc-700 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" /> Extract File
                </a>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic p-4 bg-[#09090b] rounded-xl border border-zinc-800 text-center">No file attached to this record.</p>
            )}
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131517] p-6 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/80 pb-3">Routing Details</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Priority Level</p>
                <p className={`text-sm font-bold ${doc.priority === 'High' ? 'text-red-400 bg-red-500/10 inline-block px-2 py-0.5 rounded border border-red-500/20' : 'text-zinc-100'}`}>
                  {doc.priority || 'Standard'}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Classification</p>
                <p className="text-sm font-medium text-zinc-100">{doc.category || 'General'}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Required Action</p>
                <p className="text-sm font-medium text-zinc-100">{doc.expected_action || 'Review'}</p>
              </div>

              {doc.due_date && (
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-sm font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 inline-block px-2 py-1 rounded border border-amber-500/20">
                    <Calendar className="w-3.5 h-3.5 inline" />
                    {new Date(doc.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-[#131517] p-6 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800/80 pb-3">Authentication</h3>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Sender Digital Signature</p>
              <p className="text-sm font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-lg break-all">
                {doc.sender_signature}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}