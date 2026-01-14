"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, query, where, getCountFromServer, orderBy, limit, getDocs } from "firebase/firestore";
import { Loader2, ShieldAlert, Users, FileText, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    // Stats State
    const [stats, setStats] = useState({
        users: 0,
        admins: 0,
        pendingRequests: 0,
        newsletters: 0
    });
    const [fetching, setFetching] = useState(true);

    // 1. Strict Role Guard
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (role !== "super_admin") {
                if (role === "admin") router.push("/admin");
                else router.push("/dashboard");
            }
        }
    }, [user, role, loading, router]);

    // 2. Fetch High-Level Stats
    useEffect(() => {
        const fetchStats = async () => {
            if (role === "super_admin") {
                try {
                    // Note: getCountFromServer is efficient
                    const usersColl = collection(db, "users");
                    const newslettersColl = collection(db, "newsletters");

                    const usersSnapshot = await getCountFromServer(usersColl);

                    const pendingQ = query(usersColl, where("adminRequest", "==", true));
                    const pendingSnapshot = await getCountFromServer(pendingQ);

                    const adminsQ = query(usersColl, where("role", "==", "admin"));
                    const adminsSnapshot = await getCountFromServer(adminsQ);

                    const postsSnapshot = await getCountFromServer(newslettersColl);

                    setStats({
                        users: usersSnapshot.data().count,
                        admins: adminsSnapshot.data().count,
                        pendingRequests: pendingSnapshot.data().count,
                        newsletters: postsSnapshot.data().count
                    });
                } catch (e) {
                    console.error("Stats Error", e);
                } finally {
                    setFetching(false);
                }
            }
        };

        fetchStats();
    }, [role]);

    if (loading || fetching) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" /> Loading System Overview...
            </div>
        );
    }

    if (role !== "super_admin") return null;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                            <ShieldAlert className="text-red-500" /> System Overview
                        </h1>
                        <p className="text-neutral-500">Real-time platform metrics and alerts.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                        <Activity size={12} className="animate-pulse text-green-500" />
                        System Operational
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KPI 1: Total Users */}
                    <Link href="/super-admin/users" className="group p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                            <Users className="text-indigo-500" size={20} />
                        </div>
                        <div className="text-3xl font-serif font-medium">{stats.users}</div>
                        <div className="text-xs text-neutral-500 mt-2 group-hover:text-white transition-colors flex items-center gap-1">
                            View Registry <ArrowRight size={10} />
                        </div>
                    </Link>

                    {/* KPI 2: Active Admins */}
                    <Link href="/super-admin/users" className="group p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Admins</h3>
                            <ShieldAlert className="text-emerald-500" size={20} />
                        </div>
                        <div className="text-3xl font-serif font-medium">{stats.admins}</div>
                        <div className="text-xs text-neutral-500 mt-2">Active Privileged Accounts</div>
                    </Link>

                    {/* KPI 3: Pending Requests */}
                    <Link href="/super-admin/roles" className="group p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all relative overflow-hidden">
                        {stats.pendingRequests > 0 && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse" />
                        )}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Requests</h3>
                            <Activity className="text-red-500" size={20} />
                        </div>
                        <div className="text-3xl font-serif font-medium">{stats.pendingRequests}</div>
                        <div className="text-xs text-neutral-500 mt-2 group-hover:text-white transition-colors flex items-center gap-1">
                            {stats.pendingRequests > 0 ? "Action Required" : "All Clear"} <ArrowRight size={10} />
                        </div>
                    </Link>

                    {/* KPI 4: Newsletters */}
                    <Link href="/admin/newsletters" className="group p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Content</h3>
                            <FileText className="text-blue-500" size={20} />
                        </div>
                        <div className="text-3xl font-serif font-medium">{stats.newsletters}</div>
                        <div className="text-xs text-neutral-500 mt-2 group-hover:text-white transition-colors flex items-center gap-1">
                            Manage Newsletters <ArrowRight size={10} />
                        </div>
                    </Link>
                </div>

                {/* Quick Actions / Shortcuts */}
                <div className="pt-8 border-t border-neutral-800">
                    <h3 className="text-lg font-medium text-white mb-6">Quick Navigation</h3>
                    <div className="flex gap-4">
                        <Link href="/admin/newsletters/new" className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                            Write Newsletter
                        </Link>
                        <Link href="/super-admin/audit-logs" className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium rounded-lg hover:border-white hover:text-white transition-colors">
                            View Audit Logs
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
