"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield, Mail, User, LogOut } from "lucide-react";

export default function AdminProfile() {
    const { user, role, loading, logout } = useAuth();

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-white" /></div>;

    // Authorization Check
    if (role !== "admin" && role !== "super_admin") return null;

    return (
        <div className="p-10 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-serif mb-8">Admin Profile</h1>

            <div className="max-w-2xl bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-8 border-b border-neutral-800 pb-8">
                    <div className="w-20 h-20 bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-900/50">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-medium">{user?.displayName || "Administrator"}</h2>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-900/30 text-indigo-400 border border-indigo-900/50 rounded text-xs font-medium uppercase tracking-wide">
                            {role === 'super_admin' ? 'Super Admin (Viewing as Admin)' : 'System Administrator'}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-1">Email</label>
                        <div className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-lg text-neutral-300">
                            <Mail size={16} className="text-neutral-600" />
                            {user?.email}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-1">System ID</label>
                        <div className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-lg text-neutral-300 font-mono text-sm">
                            <User size={16} className="text-neutral-600" />
                            {user?.uid}
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-neutral-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
