"use client";

import { useAuth } from "@/context/AuthContext";
import { UserNavbar } from "@/app/components/layout/UserNavbar"; // We can reuse logic or make a clean profile
import { Loader2, ShieldAlert, Mail, User, Lock } from "lucide-react";

export default function SuperAdminProfile() {
    const { user, role, loading, logout } = useAuth();

    if (loading) return null;
    if (role !== "super_admin") return null;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto mt-12 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-800">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-900 to-black border-2 border-red-800 flex items-center justify-center text-red-500 shadow-2xl">
                        <ShieldAlert size={40} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-medium">Super Administrator</h1>
                        <p className="text-neutral-500">System Owner</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">Account Email</label>
                        <div className="flex items-center gap-3 p-4 bg-black border border-neutral-800 rounded-lg text-neutral-300">
                            <Mail size={18} className="text-neutral-600" />
                            {user?.email}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">User ID</label>
                        <div className="flex items-center gap-3 p-4 bg-black border border-neutral-800 rounded-lg text-neutral-300 font-mono text-sm">
                            <User size={18} className="text-neutral-600" />
                            {user?.uid}
                        </div>
                    </div>

                    <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-start gap-4 mt-8">
                        <Lock className="text-red-500 mt-1" size={20} />
                        <div>
                            <h3 className="text-red-400 font-medium mb-1">Security Clearance: Level 1</h3>
                            <p className="text-sm text-red-900/80">
                                You have full read/write access to the entire database. Your actions are logged in the System Audit Ledger.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={() => logout()}
                            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Sign Out Securely
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
