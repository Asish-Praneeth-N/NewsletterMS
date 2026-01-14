"use client";

import { Loader2, BarChart3, ArrowUp, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminAnalytics() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalViews: 12543,
        subscribers: 892,
        readRatio: "68%"
    });

    // Guard handled by layout/middleware effectively, but good to have
    if (!loading && role !== "admin" && role !== "super_admin") {
        return null;
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="p-10 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-serif mb-2">Analytics</h1>
            <p className="text-neutral-500 mb-10">Performance metrics for your publication.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Total Views</span>
                        <BarChart3 size={20} className="text-indigo-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.totalViews.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-emerald-400 gap-1">
                        <ArrowUp size={12} /> 12% increase
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Subscribers</span>
                        <Users size={20} className="text-pink-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.subscribers}</div>
                    <div className="flex items-center text-xs text-emerald-400 gap-1">
                        <ArrowUp size={12} /> 5 new today
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Avg. Read Ratio</span>
                        <BookOpen size={20} className="text-blue-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.readRatio}</div>
                    <div className="flex items-center text-xs text-neutral-500 gap-1">
                        Based on scroll depth
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-12 text-center">
                <p className="text-neutral-500 italic">Detailed engagement charts coming soon.</p>
            </div>
        </div>
    );
}
