"use client";

import { Loader2, BarChart3, ArrowUp, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AdminAnalytics() {
    const { user, role, loading } = useAuth();
    const [stats, setStats] = useState({
        publishedCount: 0,
        draftCount: 0,
        subscriberCount: 0
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoadingData(true);

            try {
                // 1. Fetch Newsletters Stats
                const newslettersQuery = query(collection(db, "newsletters"));
                const newslettersSnap = await getDocs(newslettersQuery);

                let published = 0;
                let drafts = 0;

                newslettersSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'published') published++;
                    else drafts++;
                });

                // 2. Fetch Subscriptions (Total Global Subscriptions for now)
                const subsSnap = await getCountFromServer(collection(db, "subscriptions"));

                setStats({
                    publishedCount: published,
                    draftCount: drafts,
                    subscriberCount: subsSnap.data().count
                });

            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (role === 'admin' || role === 'super_admin') {
            fetchData();
        }
    }, [user, role]);

    const pieData = [
        { name: 'Published', value: stats.publishedCount },
        { name: 'Drafts', value: stats.draftCount },
    ];
    const COLORS = ['#6366f1', '#3b82f6']; // Indigo, Blue

    if (loading || isLoadingData) return <div className="p-8 flex items-center justify-center min-h-screen text-white"><Loader2 className="animate-spin" /></div>;

    if (role !== "admin" && role !== "super_admin") return null;

    return (
        <div className="p-10 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-serif mb-2">Analytics</h1>
            <p className="text-neutral-500 mb-10">Real-time content performance.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Published Stories</span>
                        <BarChart3 size={20} className="text-indigo-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.publishedCount}</div>
                    <div className="text-xs text-neutral-500">
                        Live on platform
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Total Subscribers</span>
                        <Users size={20} className="text-pink-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.subscriberCount}</div>
                    <div className="text-xs text-neutral-500">
                        Active readers
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-400 text-sm font-medium uppercase">Drafts in Progress</span>
                        <BookOpen size={20} className="text-blue-400" />
                    </div>
                    <div className="text-3xl font-medium mb-1">{stats.draftCount}</div>
                    <div className="text-xs text-neutral-500">
                        Not yet published
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-lg font-medium text-neutral-300 mb-6 self-start">Content Status</h3>

                    {stats.publishedCount === 0 && stats.draftCount === 0 ? (
                        <p className="text-neutral-500 italic">No content to visualize yet.</p>
                    ) : (
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 flex items-center justify-center text-center">
                    <div>
                        <p className="text-neutral-500 italic block mb-2">More charts coming soon.</p>
                        <p className="text-xs text-neutral-600">Subscriber growth trends will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
