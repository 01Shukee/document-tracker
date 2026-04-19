"use client";

import { useEffect, useState } from "react";
import { 
  Users, ShieldAlert, Check, X, Loader2, 
  Search, Building, ShieldCheck, Shield 
} from "lucide-react";
// FIXED IMPORT PATH (3 levels up)
import { supabase } from "../../../lib/supabase"; 
import Link from "next/link";

const AUTHORIZED_ROLES = ["HOD", "DEAN", "DEPARTMENT ADMIN", "DEPT ADMIN", "SYSTEM ADMIN"];

export default function DirectoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departmentName, setDepartmentName] = useState("");
  
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDirectory() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 1. Identify current user safely
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, departments(name)')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser(profile);
          
          if (profile.departments) {
            const deptInfo: any = profile.departments;
            setDepartmentName(Array.isArray(deptInfo) ? deptInfo[0]?.name : deptInfo?.name);
          }

          const userRole = (profile.role || "").toUpperCase();
          
          // 2. Security Check: Are they authorized?
          if (AUTHORIZED_ROLES.includes(userRole)) {
            setIsAuthorized(true);

            // 3. Fetch ONLY users for THEIR department (or all if System Admin)
            let query = supabase.from('profiles').select('*, departments(name)').order('full_name', { ascending: true });
            
            if (userRole !== 'SYSTEM ADMIN') {
              query = query.eq('department_id', profile.department_id);
            }

            const { data: allProfiles } = await query;

            if (allProfiles) {
              setActiveUsers(allProfiles.filter(p => p.status === 'Active'));
              
              // 4. Your Hierarchical Approval Logic!
              const pending = allProfiles.filter(p => p.status === 'Pending');
              let actionablePending: any[] = [];

              if (userRole === 'SYSTEM ADMIN') {
                actionablePending = pending.filter(p => p.role === 'HOD' || p.role === 'Dean');
              } else if (userRole === 'HOD' || userRole === 'DEAN') {
                actionablePending = pending.filter(p => p.role === 'Department Admin' || p.role === 'Dept Admin');
              } else if (userRole === 'DEPARTMENT ADMIN' || userRole === 'DEPT ADMIN') {
                actionablePending = pending.filter(p => p.role === 'Staff' || p.role === 'Admin');
              } else {
                // Fallback catch-all for department admins if names vary slightly
                actionablePending = pending; 
              }

              setPendingUsers(actionablePending);
            }
          }
        }
      }
      setIsLoading(false);
    }
    loadDirectory();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Active' }) // Simplified for now since approved_by might not exist in your schema yet
      .eq('id', userId);

    if (error) {
      alert("Failed to approve user: " + error.message);
    } else {
      // Move from pending to active instantly in UI
      const approvedUser = pendingUsers.find(p => p.id === userId);
      setPendingUsers(prev => prev.filter(p => p.id !== userId));
      if (approvedUser) {
        setActiveUsers(prev => [...prev, { ...approvedUser, status: 'Active' }]);
      }
    }
    setProcessingId(null);
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    const { error } = await supabase.from('profiles').update({ status: 'Rejected' }).eq('id', userId);
    
    if (!error) {
      setPendingUsers(prev => prev.filter(p => p.id !== userId));
    }
    setProcessingId(null);
  };

  const filteredDirectory = activeUsers.filter(user => 
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
      </div>
    );
  }

  // --- UNAUTHORIZED STATE ---
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center font-rare animate-in fade-in zoom-in duration-300">
        <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Clearance Level Too Low</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-8">
          The Department Directory is restricted to HODs, Deans, and Department Admins. Your current role (<span className="text-amber-500">{currentUser?.role || "Staff"}</span>) does not have access.
        </p>
        <Link href="/" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm font-medium border border-zinc-700">
          Return to Command Center
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 font-rare pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Staff Directory</h2>
          <p className="text-zinc-400 font-light">Manage and verify personnel for <span className="text-emerald-400 font-medium">{departmentName}</span>.</p>
        </div>
      </div>

      {/* --- PENDING APPROVALS QUEUE --- */}
      {pendingUsers.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Verification Queue</h2>
              <p className="text-sm text-amber-500/80">{pendingUsers.length} staff member(s) await your approval</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map(user => (
              <div key={user.id} className="rounded-2xl border border-amber-500/20 bg-[#131517] p-6 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                
                <h3 className="font-bold text-lg text-zinc-100 mb-3">{user.full_name || "Unknown User"}</h3>
                
                <div className="text-sm font-mono text-zinc-400 flex flex-col gap-2 mb-6">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-zinc-500" /> 
                    {departmentName || "No Dept"}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zinc-500" /> 
                    Role: <strong className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{user.role}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <button 
                    onClick={() => handleApprove(user.id)} 
                    disabled={processingId === user.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-500 text-sm font-bold py-2.5 rounded-xl border border-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Approve</>}
                  </button>
                  <button 
                    onClick={() => handleReject(user.id)} 
                    disabled={processingId === user.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-500 text-sm font-bold py-2.5 rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ACTIVE STAFF DIRECTORY --- */}
      <div className="bg-[#131517] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-white">Active Personnel</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search personnel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-[#0C0D0E] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] border-b border-zinc-800/50 text-zinc-400 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredDirectory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No active personnel found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDirectory.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 font-bold text-sm">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium text-zinc-100">{user.full_name || "Unnamed User"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {departmentName || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold border border-emerald-500/20 tracking-wider">
                        Active
                      </span>
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