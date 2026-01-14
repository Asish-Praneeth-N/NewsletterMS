"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2, Users, FileText, Shield, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SuperAdminAnalytics() {
    const { role } = useAuth();
    const [stats, setStats] = useState({
        userCount: 0,
        newsletterCount: 0,
        subCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const [usersSnap, newslettersSnap, subsSnap] = await Promise.all([
                    getCountFromServer(collection(db, "users")),
                    getCountFromServer(collection(db, "newsletters")),
                    getCountFromServer(collection(db, "subscriptions"))
                ]);

                setStats({
                    userCount: usersSnap.data().count,
                    newsletterCount: newslettersSnap.data().count,
                    subCount: subsSnap.data().count
                });
            } catch (error) {
                console.error("Error fetching super admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (role === "super_admin") {
            fetchSystemStats();
        }
    }, [role]);

    // Guard handled by Middleware but strict check here too
    if (role !== "super_admin" && !loading) return null;

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-500" /></div>
    }

    const chartData = [
        { name: 'Users', count: stats.userCount },
        { name: 'Newsletters', count: stats.newsletterCount },
        { name: 'Subs', count: stats.subCount },
    ];

    return (
        <div className="p-8 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-serif mb-2">Platform Analytics</h1>
            <p className="text-neutral-500 mb-8">System-wide performance metrics.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Real Data Cards */}
                <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Users size={20} />
                        </div>
                        <span className="text-sm text-neutral-400">Total Users</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.userCount}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                        Registered accounts
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <FileText size={20} />
                        </div>
                        <span className="text-sm text-neutral-400">Total Newsletters</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.newsletterCount}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                        Across all accounts
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                            <Calendar size={20} />
                        </div>
                        <span className="text-sm text-neutral-400">Total Subscriptions</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.subCount}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                        Global engagement
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl opacity-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                            <Shield size={20} />
                        </div>
                        <span className="text-sm text-neutral-400">System Health</span>
                    </div>
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-xs text-neutral-500 mt-1">
                        Uptime (Static)
                    </div>
                </div>
            </div>

            <div className="p-8 border border-neutral-800 rounded-2xl bg-neutral-900/20">
                <h3 className="text-lg font-medium text-neutral-300 mb-6">Platform Scale</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: '#333', opacity: 0.2 }}
                                contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
