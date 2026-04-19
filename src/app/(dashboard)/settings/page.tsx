"use client";

import { useState, useEffect } from "react";
import { User, Lock, Bell, PenTool, Shield, Save, Loader2, Mail, Smartphone, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    async function loadProfile() {
      // 1. Get current logged-in auth user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Fetch their full profile and department details
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, departments(name)')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({ ...profileData, email: user.email });
          setFullName(profileData.full_name || "");
          // Assuming you add a signature column to profiles later, we mock it here
          setSignature(profileData.full_name || ""); 
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, you would run an UPDATE query to Supabase here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    setIsSaving(false);
    alert("Settings saved successfully!");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Define the tabs based on user role
  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "signature", label: "Digital Signature", icon: PenTool },
  ];

  // Only add Admin tab if the user is actually an Admin
  if (profile?.role === 'Admin' || profile?.role === 'System Admin') {
    tabs.push({ id: "admin", label: "Admin Panel", icon: Shield });
  }

  return (
    <div className="max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">System Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account, preferences, and security configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 rounded-xl border border-zinc-800/50 bg-charcoal p-6 md:p-8 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4">Profile Information</h2>
              <div className="space-y-6 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Email Address (Read Only)</label>
                  <input type="email" value={profile?.email} disabled className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-400">Department</label>
                    <input type="text" value={profile?.departments?.name || "Unassigned"} disabled className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-400">System Role</label>
                    <input type="text" value={profile?.role} disabled className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4">Security Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#09090b] border border-zinc-800">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-100">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Require an extra security step during login.</p>
                    </div>
                    <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded transition-colors">Enable</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURE TAB */}
          {activeTab === "signature" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4">Digital Signature Preference</h2>
              <div className="space-y-6 max-w-xl">
                <p className="text-sm text-zinc-400">Configure the default signature applied to documents you dispatch and approve.</p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Typed Signature</label>
                  <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50" />
                </div>
                
                {/* Signature Preview Box */}
                <div className="mt-8">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Live Preview</label>
                  <div className="h-32 rounded-xl border border-dashed border-zinc-700 bg-[#09090b] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                    <span className="font-mono text-2xl text-emerald-500/80 -rotate-2 relative z-10">{signature || "Type your signature above"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4">Notification Preferences</h2>
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-zinc-100">Email Alerts</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Receive an email when a document requires your action.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/50" />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-zinc-100">In-App Notifications</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Show a red dot in the sidebar for pending approvals.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/50" />
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB */}
          {activeTab === "admin" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Admin Control Center
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg border border-zinc-800 bg-[#09090b] hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <h4 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">User Management</h4>
                  <p className="text-xs text-zinc-500 mt-1">Add users, assign roles, and manage system access.</p>
                </div>
                <div className="p-5 rounded-lg border border-zinc-800 bg-[#09090b] hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <h4 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">Department Registry</h4>
                  <p className="text-xs text-zinc-500 mt-1">Add, rename, or structure organizational departments.</p>
                </div>
                <div className="p-5 rounded-lg border border-zinc-800 bg-[#09090b] hover:border-emerald-500/30 transition-colors cursor-pointer group sm:col-span-2">
                  <h4 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">System Audit Logs</h4>
                  <p className="text-xs text-zinc-500 mt-1">View an immutable history of all document dispatches, acceptances, and system changes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Global Save Button (Hidden on Admin panel) */}
          {activeTab !== "admin" && (
            <div className="mt-10 pt-6 border-t border-zinc-800/50 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-charcoal font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}