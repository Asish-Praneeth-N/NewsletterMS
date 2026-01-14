"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle, Clock, Users, Plus, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

interface DashboardStats {
    drafts: number;
    published: number;
    scheduled: number;
    subscribers: number;
}

interface ActivityItem {
    id: string;
    title: string;
    status: string;
    updatedAt: any;
    slug: string;
}

export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        drafts: 0,
        published: 0,
        scheduled: 0,
        subscribers: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [timeGreeting, setTimeGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setTimeGreeting("Good morning");
        else if (hour < 18) setTimeGreeting("Good afternoon");
        else setTimeGreeting("Good evening");
    }, []);

    // 1. Auth & Role Guard
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login"); // Unauthenticated -> Login
            } else if (role !== "admin" && role !== "super_admin") {
                router.push("/dashboard");
            }
        }
    }, [user, role, loading, router]);

    // 2. Data Fetching (Real-time)
    useEffect(() => {
        if (!user || (role !== "admin" && role !== "super_admin")) return;

        // Fetch Newsletters
        const qNewsletters = query(collection(db, "newsletters"), orderBy("updatedAt", "desc"));
        const unsubNewsletters = onSnapshot(qNewsletters, (snapshot) => {
            let d = 0, p = 0, s = 0;
            const activity: ActivityItem[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === "draft") d++;
                else if (data.status === "published") p++;
                else if (data.status === "scheduled") s++;

                if (activity.length < 4) {
                    activity.push({
                        id: doc.id,
                        title: data.title,
                        status: data.status,
                        updatedAt: data.updatedAt,
                        slug: data.slug
                    });
                }
            });

            setStats(prev => ({ ...prev, drafts: d, published: p, scheduled: s }));
            setRecentActivity(activity);

            // Only stop loading if subs match below finishes too, but for simplicity we do it here/there
            // Ideally use Promise.all but snapshot is listener.
            // We'll set partial loading false here and let subscription run
        });

        // Fetch Subscribers
        const qSubs = query(collection(db, "subscriptions"));
        const unsubSubs = onSnapshot(qSubs, (snapshot) => {
            setStats(prev => ({ ...prev, subscribers: snapshot.size }));
            setIsLoadingData(false);
        }, (error) => {
            console.error("Subscription fetch error", error);
            setIsLoadingData(false); // Fail gracefully
        });

        return () => {
            unsubNewsletters();
            unsubSubs();
        };
    }, [user, role]);

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

                {/* Hero / Welcome */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-indigo-400 font-medium mb-2 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-indigo-400 block"></span>
                            Admin Console
                        </p>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
                            {timeGreeting}, <br />
                            <span className="text-neutral-400">{user?.displayName?.split(' ')[0] || "Editor"}.</span>
                        </h1>
                    </div>

                    <Link
                        href="/admin/newsletters/new"
                        className="group flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105"
                    >
                        <Plus size={20} className="transition-transform group-hover:rotate-90" />
                        <span>Create Newsletter</span>
                    </Link>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

                    {/* Subscribers */}
                    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} />
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    <Users size={16} className="text-pink-500" /> Subscribers
                                </div>
                                <div className="text-4xl font-bold text-white mt-2">{stats.subscribers}</div>
                            </div>
                            <div className="flex items-center text-xs text-neutral-500">
                                <TrendingUp size={14} className="mr-1 text-emerald-500" /> Growing audience
                            </div>
                        </div>
                    </div>

                    {/* Published */}
                    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={64} />
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    <CheckCircle size={16} className="text-emerald-500" /> Published
                                </div>
                                <div className="text-4xl font-bold text-white mt-2">{stats.published}</div>
                            </div>
                            <div className="text-xs text-neutral-500">Live posts available to readers</div>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={64} />
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    <FileText size={16} className="text-indigo-400" /> Drafts
                                </div>
                                <div className="text-4xl font-bold text-white mt-2">{stats.drafts}</div>
                            </div>
                            <div className="text-xs text-neutral-500">Works in progress</div>
                        </div>
                    </div>

                    {/* Scheduled */}
                    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock size={64} />
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    <Clock size={16} className="text-amber-500" /> Scheduled
                                </div>
                                <div className="text-4xl font-bold text-white mt-2">{stats.scheduled}</div>
                            </div>
                            <div className="text-xs text-neutral-500">Upcoming releases</div>
                        </div>
                    </div>

                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                            <Activity size={24} className="text-neutral-500" />
                            Recent Activity
                        </h2>

                        <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-neutral-800/50">
                                    {recentActivity.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${item.status === 'published' ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-emerald-400 border border-emerald-900' :
                                                        item.status === 'draft' ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400 border border-neutral-700' :
                                                            'bg-gradient-to-br from-amber-900 to-amber-950 text-amber-400 border border-amber-900'
                                                    }`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg group-hover:text-indigo-400 transition-colors">{item.title || "Untitled"}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                item.status === 'draft' ? 'bg-neutral-500/10 text-neutral-400' :
                                                                    'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                        <span className="text-xs text-neutral-600 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {item.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/admin/newsletters/${item.id}`} className="p-3 bg-neutral-800/50 rounded-full text-neutral-400 hover:text-white hover:bg-indigo-600 transition-all transform hover:scale-110 shadow-lg">
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-600">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-neutral-400 font-medium mb-1">No activity yet</h3>
                                    <p className="text-neutral-600 text-sm">Create your first newsletter to see stats here.</p>
                                </div>
                            )}

                            <div className="p-4 bg-neutral-950/30 border-t border-neutral-800 text-center">
                                <Link href="/admin/newsletters" className="text-sm text-neutral-500 hover:text-white font-medium transition-colors flex items-center justify-center gap-2">
                                    View Full Content Library <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access / Tips */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif font-bold text-white">Quick Actions</h2>
                        <div className="grid gap-4">
                            <Link href="/admin/newsletters/new" className="block p-5 bg-neutral-900/30 border border-neutral-800 rounded-2xl hover:bg-neutral-800/50 hover:border-neutral-700 transition-all group">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="font-bold text-white/90">New Newsletter</h3>
                                </div>
                                <p className="text-sm text-neutral-500 pl-[52px]">Draft a new story from scratch.</p>
                            </Link>

                            <Link href="/admin/analytics" className="block p-5 bg-neutral-900/30 border border-neutral-800 rounded-2xl hover:bg-neutral-800/50 hover:border-neutral-700 transition-all group">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h3 className="font-bold text-white/90">View Insights</h3>
                                </div>
                                <p className="text-sm text-neutral-500 pl-[52px]">Check how your content is performing.</p>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
