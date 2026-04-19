"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, Terminal, Clock, User, 
  FileText, Loader2, Database, ArrowRight, Eye, ShieldCheck, Search
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

const OVERSIGHT_ROLES = ["HOD", "DEAN", "DEPARTMENT ADMIN", "DEPT ADMIN", "SYSTEM ADMIN"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userRole, setUserRole] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [isOversight, setIsOversight] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLogsAndVerify() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: currentUser } = await supabase
        .from('profiles')
        .select('*, departments(name)')
        .eq('id', session.user.id)
        .single();

      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      const role = (currentUser.role || "").toUpperCase();
      setUserRole(role);
      
      // Safely extract department name
      const deptArray = currentUser.departments;
      setDepartmentName(Array.isArray(deptArray) ? deptArray[0]?.name : deptArray?.name);

      const hasOversight = OVERSIGHT_ROLES.includes(role);
      setIsOversight(hasOversight);

      // Map profiles for name resolution
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, department_id');
      const tempMap: Record<string, string> = {};
      const myDeptIds: string[] = [];

      if (profiles) {
        profiles.forEach(p => {
          tempMap[p.id] = p.full_name;
          if (p.department_id === currentUser.department_id) myDeptIds.push(p.id);
        });
        setUserMap(tempMap);
      }

      // ---------------------------------------------------------
      // THE FIX: SECURE SERVER-SIDE FILTERING
      // ---------------------------------------------------------
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:profiles!fk_audit_logs_performed_by(full_name, role, departments(name)),
          documents:documents!fk_audit_logs_document_id(title, tracking_id, sender_id, recipient_id)
        `)
        .order('created_at', { ascending: false });

      if (role === 'SYSTEM ADMIN') {
        // SysAdmins fetch everything.
      } 
      else if (hasOversight) {
        // HODs: Fetch docs related to their department, then fetch those logs.
        const { data: deptDocs } = await supabase
          .from('documents')
          .select('id')
          .or(`sender_id.in.(${myDeptIds.join(',')}),recipient_id.in.(${myDeptIds.join(',')})`);
          
        const deptDocIds = deptDocs?.map(d => d.id) || [];
        
        if (deptDocIds.length > 0) {
          query = query.or(`performed_by.in.(${myDeptIds.join(',')}),document_id.in.(${deptDocIds.join(',')})`);
        } else {
          query = query.in('performed_by', myDeptIds);
        }
      } 
      else {
        // STAFF: Fetch their personal docs, then strictly query logs for those docs or actions.
        const { data: myDocs } = await supabase
          .from('documents')
          .select('id')
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);
          
        const myDocIds = myDocs?.map(d => d.id) || [];
        
        if (myDocIds.length > 0) {
          query = query.or(`performed_by.eq.${currentUser.id},document_id.in.(${myDocIds.join(',')})`);
        } else {
          query = query.eq('performed_by', currentUser.id);
        }
      }

      const { data: finalLogs, error } = await query;
      
      if (error) {
        console.error("Secure query failed:", error);
      } else if (finalLogs) {
        setLogs(finalLogs);
      }

      setIsLoading(false);
    }

    fetchLogsAndVerify();

    const auditChannel = supabase
      .channel('live-audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        fetchLogsAndVerify(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(auditChannel);
    };
  }, []);

  const filteredLogs = logs.filter(rawLog => {
    // Safely handle Supabase returning related data as arrays
    const doc = Array.isArray(rawLog.documents) ? rawLog.documents[0] : rawLog.documents;
    
    return (
      (doc && doc.tracking_id && doc.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc && doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rawLog.action && rawLog.action.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center font-rare">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 font-rare pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            {isOversight ? <Eye className="w-8 h-8 text-emerald-500" /> : <ShieldCheck className="w-8 h-8 text-blue-500" />}
            {isOversight ? "Department Oversight" : "Personal Audit Ledger"}
          </h2>
          <p className="text-zinc-400 font-light">
            {isOversight 
              ? <>Monitoring all inbound and outbound traffic for <span className="text-emerald-400 font-bold">{departmentName || "All Departments"}</span>.</>
              : "A secure, immutable record of interactions with your documents."
            }
          </p>
        </div>
        
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl px-5 py-2.5 flex items-center gap-3 shadow-lg relative overflow-hidden">
          <div className="absolute left-0 top-0 w-full h-full bg-emerald-500/5 animate-pulse"></div>
          <Database className={`w-4 h-4 relative z-10 ${isOversight ? 'text-emerald-500' : 'text-blue-500'}`} />
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest relative z-10">
            {isOversight ? 'OVERSIGHT_ACTIVE' : 'PERSONAL_LEDGER_SECURE'}
          </span>
          <span className="relative z-10 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-500" />
            <h3 className="text-sm font-mono text-zinc-400">docutrack_audit_ledger.log</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search tracking ID or action..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-[#0C0D0E] border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] border-b border-zinc-800/80 text-zinc-500 font-mono text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 font-medium">Timestamp</th>
                <th className="px-6 py-5 font-medium">System Action</th>
                <th className="px-6 py-5 font-medium">Document & Routing Flow</th>
                <th className="px-6 py-5 font-medium">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-500">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/30 flex items-center justify-center mx-auto mb-4 border border-zinc-800/50">
                      <FileText className="w-6 h-6 text-zinc-600" />
                    </div>
                    No log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  // Safely handle array wrappers
                  const doc = Array.isArray(log.documents) ? log.documents[0] : log.documents;
                  const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                  const dept = profile?.departments;
                  const profileDeptName = Array.isArray(dept) ? dept[0]?.name : dept?.name;

                  const senderName = doc ? userMap[doc.sender_id] : "Unknown";
                  const recipientName = doc ? userMap[doc.recipient_id] : "Unknown";

                  return (
                    <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors animate-in fade-in duration-500">
                      <td className="px-6 py-5 whitespace-nowrap text-zinc-500 align-top">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          log.action.includes('Accepted') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                          log.action.includes('Rejected') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          log.action.includes('Dispatched') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-zinc-300 align-top">
                        {doc ? (
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2 text-zinc-100 font-bold font-rare tracking-wide">
                              <FileText className="w-4 h-4 text-zinc-500" />
                              {doc.tracking_id}
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-[#09090b] px-2 py-1.5 rounded-lg border border-zinc-800/80 inline-flex w-fit">
                              <span className="truncate max-w-[120px]">{senderName}</span>
                              <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                              <span className="truncate max-w-[120px] text-zinc-200">{recipientName}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded">SYSTEM_FILE</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-zinc-400 align-top">
                        {profile ? (
                          <div className="flex flex-col">
                            <span className="text-zinc-200 flex items-center gap-1.5 font-bold font-rare">
                              <User className="w-3.5 h-3.5 text-zinc-500" /> {profile.full_name}
                            </span>
                            <span className="text-[10px] text-zinc-500 mt-1 uppercase">
                              {profile.role} • {profileDeptName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">AUTOMATED_PROCESS</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}