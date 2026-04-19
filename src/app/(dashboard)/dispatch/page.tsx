"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, FileText, CheckCircle2, Loader2, 
  UploadCloud, ShieldCheck, MapPin, Search, User 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
// REMOVED the broken "next/dist/api/error" import!

export default function DispatchPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // Search Logic States
  const [recipientSearch, setRecipientSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Physical");
  const [category, setCategory] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [destDept, setDestDept] = useState("");
  const [recipient, setRecipient] = useState(""); // This stores the UUID
  const [recipientName, setRecipientName] = useState(""); // This stores the Display Name
  
  const [priority, setPriority] = useState("Medium");
  const [expectedAction, setExpectedAction] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [signature, setSignature] = useState("");
  const [confirmed, setConfirmed] = useState(false);

useEffect(() => {
    async function fetchData() {
      // 1. Grab the current user's session ID
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: depts } = await supabase.from('departments').select('id, name');
      if (depts) setDepartments(depts);

      if (session) {
        setCurrentUserId(session.user.id); // <--- Save your ID here!
        
        // 2. Fetch Active users, but EXCLUDE the current user's ID
        const { data: users, error: dbError } = await supabase
          .from('profiles')
          .select('id, full_name, role, department_id')
          .eq('status', 'Active')
          .neq('id', session.user.id); // <--- This line hides YOU from the list

        console.log("Database Raw Users (Excluding Self):", users);
        console.log("Database Error (if any):", dbError);
        
        if (users) setAllUsers(users);
      }
    }
    fetchData();
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on Department AND Search Query
  useEffect(() => {
    if (destDept) {
      const filtered = allUsers.filter(user => 
        user.department_id === destDept && 
        user.full_name.toLowerCase().includes(recipientSearch.toLowerCase())
      );
      console.log("Selected Dept ID:", destDept);
      console.log("Filtered Users matching Dept & Search:", filtered);
      
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [destDept, recipientSearch, allUsers]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert(`Please upload a ${type === 'Digital' ? 'file' : 'proof image'} before dispatching.`);
      return;
    }
    if (!recipient) {
      alert("Please select a valid recipient from the list.");
      return;
    }
    if (!signature || !confirmed) {
      alert("You must sign and confirm before dispatching.");
      return;
    }

    setIsSubmitting(true);
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase();
    const trackingId = `DOC-2026-${randomHex}`;
    let fileUrl = "";

    try {
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${trackingId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('document-uploads')
        .upload(safeFileName, file);

      if (uploadError) throw new Error("File upload failed: " + uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('document-uploads')
        .getPublicUrl(safeFileName);
        
      fileUrl = publicUrlData.publicUrl;

    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
      return;
    }

const { error: dbError } = await supabase.from('documents').insert([
      {
        tracking_id: trackingId,
        title,
        description,
        type,
        category,
        dest_dept_id: destDept,
        sender_id: currentUserId, // <--- THE MISSING PIECE
        recipient_id: recipient,
        priority,
        expected_action: expectedAction,
        due_date: dueDate || null,
        file_url: fileUrl,
        additional_notes: additionalNotes,
        sender_signature: signature,
        status: 'Dispatched'
      }
    ]);
    setIsSubmitting(false);

    if (dbError) {
      alert("Failed to save document details: " + dbError.message);
    } else {
      setSuccess(true);
      setTimeout(() => window.location.reload(), 2500);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-medium text-zinc-100">Document Dispatched Securely</h3>
        <p className="text-zinc-400 mt-2">The recipient has been notified and the audit log updated.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12 font-rare">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">New Document Dispatch</h1>
        <p className="text-zinc-500 text-sm mt-1">Initialize a secure routing path for university records.</p>
      </div>

      <form onSubmit={handleDispatch} className="flex flex-col gap-6">
        
        {/* SECTION A: Document Details */}
        <div className="rounded-xl border border-zinc-800/50 bg-[#131517] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/50 pb-4">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-medium text-zinc-100">Section A: Document Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Document Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50" placeholder="e.g. Q4 Financial Audit Report" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Document Type *</label>
              <select required value={type} onChange={(e) => { setType(e.target.value); setFile(null); }} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50">
                <option value="Physical">Physical (Hard Copy)</option>
                <option value="Digital">Digital (PDF/Doc)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50">
                <option value="">Select Category...</option>
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Finance">Financial</option>
                <option value="Student Record">Student Record</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Brief Summary *</label>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 resize-none" placeholder="What is this document about?" />
            </div>
          </div>
        </div>

        {/* SECTION B: File Upload */}
        <div className="rounded-xl border border-zinc-800/50 bg-[#131517] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/50 pb-4">
            <UploadCloud className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-medium text-zinc-100">Section B: File / Proof Upload</h2>
          </div>

          <div className="space-y-6">
            <input type="file" ref={fileInputRef} className="hidden" accept={type === 'Digital' ? '.pdf,.doc,.docx' : 'image/*'} onChange={(e) => e.target.files && setFile(e.target.files[0])} />

            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-zinc-800 bg-[#09090b] hover:border-zinc-700'}`} 
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className={`w-8 h-8 mx-auto mb-3 ${file ? 'text-emerald-500' : 'text-zinc-500'}`} />
              <p className="text-sm text-zinc-300">
                {file ? <span className="text-emerald-400 font-medium">READY: {file.name}</span> : `Upload ${type === 'Digital' ? 'Electronic File' : 'Photo of Hardcopy'} *`}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION C: Dispatch Path */}
        <div className="rounded-xl border border-zinc-800/50 bg-[#131517] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/50 pb-4">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-medium text-zinc-100">Section C: Dispatch Path</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Destination Department *</label>
              <select required value={destDept} onChange={(e) => setDestDept(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50">
                <option value="">Choose Department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* SEARCHABLE RECIPIENT DROPDOWN */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-medium text-zinc-400">Search Recipient *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  disabled={!destDept}
                  placeholder={destDept ? "Type staff name..." : "Select department first"}
                  value={recipientName || recipientSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setRecipientSearch(e.target.value);
                    setRecipient(""); // Clear UUID if they start typing again
                    setRecipientName("");
                    setIsDropdownOpen(true);
                  }}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500/50 disabled:opacity-40 outline-none"
                />
              </div>

              {isDropdownOpen && destDept && (
                <div className="absolute z-50 w-full mt-1 bg-[#131517] border border-zinc-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setRecipient(user.id);
                          setRecipientName(user.full_name);
                          setRecipientSearch("");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 transition-colors flex items-center justify-between group border-b border-zinc-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                          <span className="text-sm text-zinc-200">{user.full_name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
                          {user.role}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-zinc-500 italic">No active staff found in this department</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Priority Level</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50">
                <option value="Low">Low (Routine)</option>
                <option value="Medium">Medium (Regular)</option>
                <option value="High">High (Urgent)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Deadline (Optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 scheme-dark" />
            </div>
          </div>
        </div>

        {/* SECTION D: Authentication */}
        <div className="rounded-xl border border-zinc-800/50 bg-[#131517] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/50 pb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-medium text-zinc-100">Section D: Authentication</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Digital Signature *</label>
              <input type="text" required value={signature} onChange={(e) => setSignature(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 focus:border-emerald-500/50" placeholder="Type your full name to sign" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-zinc-800 bg-[#09090b] text-emerald-500 focus:ring-emerald-500/50" />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300">
                I attest that this document is authentic and I authorize its secure transmission to the specified recipient.
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3.5 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Dispatch Document</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}