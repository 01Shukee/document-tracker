"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  ArrowRight, 
  Terminal,
  User,
  Mail,
  Building,
  Briefcase,
  Key,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

// Define our standard roles. We will filter this list based on DB checks.
const ALL_ROLES = ["Staff", "HOD", "Dean", "Department Admin"];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  
  // Real departments fetched from DB
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Dynamic Role State
  const [availableRoles, setAvailableRoles] = useState<string[]>(ALL_ROLES);
  const [isCheckingRoles, setIsCheckingRoles] = useState(false);

  // Fetch true UUIDs on load
  useEffect(() => {
    async function fetchDepartments() {
      const { data } = await supabase.from('departments').select('id, name').order('name');
      if (data) setDepartments(data);
    }
    fetchDepartments();
  }, []);

  // --- THE ROLE SCANNER ---
  // Triggers every time the user selects a new Department
  useEffect(() => {
    async function scanDepartmentRoles() {
      if (!departmentId) {
        setAvailableRoles(ALL_ROLES);
        return;
      }

      setIsCheckingRoles(true);
      
      // Look for anyone in this department who is NOT rejected
      const { data: existingStaff } = await supabase
        .from('profiles')
        .select('role')
        .eq('department_id', departmentId)
        .neq('status', 'Rejected');

      if (existingStaff) {
        // Create an array of roles that are currently taken (convert to uppercase for safe matching)
        const takenRoles = existingStaff.map(staff => (staff.role || "").toUpperCase());
        
        // Filter our master list
        const filteredRoles = ALL_ROLES.filter(r => {
          if (r === "Staff") return true; // Staff is infinite, always keep it
          return !takenRoles.includes(r.toUpperCase()); // Keep it only if it's NOT in the taken list
        });
        
        setAvailableRoles(filteredRoles);
        
        // If the user previously selected "HOD", but then switched to a department 
        // where HOD is taken, we must clear their selection to prevent bypassing.
        if (role && !filteredRoles.includes(role)) {
          setRole("");
        }
      }
      setIsCheckingRoles(false);
    }
    
    scanDepartmentRoles();
  }, [departmentId]);
  // ------------------------

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // 1. Send the data to Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          department_id: departmentId,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    // 2. Success! Show the success UI, then seamlessly push to login
    setSuccessMsg(true);
    
    // Wait 2.5 seconds so they can read the success message, then teleport them
    setTimeout(() => {
      router.push("/login");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-zinc-100 selection:bg-emerald-500/30 font-rare flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-rare { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
      `}} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-150 h-100 bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen -translate-y-1/4" />
        <div className="absolute w-100 h-75 bg-teal-600/10 blur-[100px] rounded-full mix-blend-screen translate-y-1/4" />
      </div>

      <div className="w-full max-w-md bg-[#131517]/90 backdrop-blur-xl border border-zinc-800/80 rounded-4xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Shield className="text-emerald-500 w-6 h-6 stroke-[1.5px]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Request System Access</h1>
          <div className="flex items-center gap-2 text-xs font-code text-zinc-500 bg-[#0C0D0E] px-3 py-1 rounded-md border border-zinc-800">
            <Terminal className="w-3 h-3" /> DOCUTRACK_AUTH
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-code text-center">
            ERR: {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
               <CheckCircle className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Profile Initialized</h3>
             <p className="text-sm text-zinc-400 font-light mb-6">
               Your access request has been securely logged. <br/>
               <span className="text-emerald-400 animate-pulse mt-2 inline-block">Redirecting to secure portal...</span>
             </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0C0D0E] border border-zinc-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-rare placeholder:text-zinc-600"
                  placeholder="e.g. Dr. John Doe"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider ml-1">Department</label>
                <div className="relative flex items-center">
                  <Building className="absolute left-3 w-4 h-4 text-zinc-600 pointer-events-none" />
                  <select 
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-[#0C0D0E] border border-zinc-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-rare appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-zinc-600">Select...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option> 
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider ml-1 flex justify-between">
                  <span>System Role</span>
                  {isCheckingRoles && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3 w-4 h-4 text-zinc-600 pointer-events-none" />
                  <select 
                    required
                    disabled={!departmentId || isCheckingRoles}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0C0D0E] border border-zinc-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-rare appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled className="text-zinc-600">
                      {!departmentId ? "Select Dept First" : "Select Role..."}
                    </option>
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-code text-zinc-400 uppercase tracking-wider ml-1">Secure Password</label>
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
              disabled={isLoading || departments.length === 0}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="font-code text-xs animate-pulse">GENERATING_KEYS...</span>
              ) : (
                <>Initialize Profile <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-sm text-zinc-500 font-light">
            Already have clearance?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors border-b border-transparent hover:border-emerald-300">
              Authenticate here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}