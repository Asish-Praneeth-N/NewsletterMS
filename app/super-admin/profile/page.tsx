"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, Mail, User, Lock, ExternalLink, ShieldCheck, Key, LogOut } from "lucide-react";
import Link from "next/link";

export default function SuperAdminProfile() {
    const { user, role, loading, logout } = useAuth();

    if (loading) return null;
    if (role !== "super_admin") return null;

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">

            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-4xl mx-auto mt-10 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-900 to-black border border-red-900/50 flex items-center justify-center text-red-500 shadow-2xl relative z-10">
                                <ShieldAlert size={40} className="drop-shadow-lg" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black uppercase tracking-wider">
                                System Owner
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-white mb-2">
                                Super Administrator
                            </h1>
                            <p className="text-neutral-500 flex items-center justify-center md:justify-start gap-2 text-sm">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Secured Session Active
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-900/50 hover:bg-red-950/30 border border-neutral-800 hover:border-red-900/30 text-neutral-400 hover:text-red-400 rounded-full transition-all group backdrop-blur-md"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Terminate Session</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Identity Card */}
                    <div className="group p-8 rounded-3xl bg-neutral-900/20 border border-neutral-800 backdrop-blur-xl relative overflow-hidden transition-all hover:border-neutral-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                                <User size={20} />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-200">Identity Verification</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest block mb-2">Authenticated As</label>
                                <div className="text-xl font-medium text-white break-all">
                                    {user?.email}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest block mb-2">Unique Identifier (UID)</label>
                                <div className="font-mono text-sm text-neutral-400 break-all bg-black/50 p-3 rounded-lg border border-neutral-900">
                                    {user?.uid}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Level Card */}
                    <div className="group p-8 rounded-3xl bg-neutral-900/20 border border-neutral-800 backdrop-blur-xl relative overflow-hidden transition-all hover:border-red-900/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-950/30 rounded-lg text-red-500">
                                <Lock size={20} />
                            </div>
                            <h3 className="text-lg font-medium text-red-100">Clearance Level 0 (Apex)</h3>
                        </div>

                        <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl mb-6">
                            <p className="text-red-200/80 text-sm leading-relaxed">
                                You hold the highest privilege level. This account can bypass standard restriction protocols, modify core role assignments, and access total system audit logs.
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-neutral-500 border-t border-neutral-800 pt-4 mt-4">
                            <span className="flex items-center gap-2">
                                <Key size={14} /> 2FA Suggested
                            </span>
                            <span className="text-emerald-500 flex items-center gap-1">
                                <ShieldCheck size={14} /> Secure
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Metadata / Footer */}
                <div className="mt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600">
                    <p>Last login: {new Date().toLocaleString()}</p>
                    <p className="mt-2 md:mt-0">NewsEcho Systems v2.1.0 • <span className="text-neutral-500">Encrypted Connection</span></p>
                </div>

            </div>
        </div>
    );
}
