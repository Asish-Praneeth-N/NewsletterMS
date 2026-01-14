"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowRight, BookOpen, Star, Zap } from "lucide-react";
import { UserNavbar } from "../components/layout/UserNavbar";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

interface Newsletter {
    id: string;
    title: string;
    slug: string;
    heroImageUrl?: string;
    publishedAt: any;
    excerpt?: string; // fallback if body is long
}

export default function UserDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [latestNewsletters, setLatestNewsletters] = useState<Newsletter[]>([]);
    const [fetching, setFetching] = useState(true);

    // Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Fetch Latest Published Newsletters
    useEffect(() => {
        const q = query(
            collection(db, "newsletters"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Newsletter[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Newsletter);
            });
            setLatestNewsletters(items);
            setFetching(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            <UserNavbar />

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Hero / Welcome */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
                        Welcome back, <span className="text-indigo-400">{user.displayName?.split(' ')[0] || "Reader"}</span>.
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Your personalized feed of the latest stories and insights.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Link href="/newsletters" className="group p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all hover:border-neutral-700">
                        <div className="w-12 h-12 bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Browse Library</h3>
                        <p className="text-sm text-neutral-500">Explore all published newsletters and archives.</p>
                    </Link>

                    <Link href="/subscriptions" className="group p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all hover:border-neutral-700">
                        <div className="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                            <Star size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">My Subscriptions</h3>
                        <p className="text-sm text-neutral-500">Manage the content you follow.</p>
                    </Link>

                    <Link href="/community" className="group p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all hover:border-neutral-700">
                        <div className="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Community</h3>
                        <p className="text-sm text-neutral-500">Join discussions and connect with readers.</p>
                    </Link>
                </div>

                {/* Latest Newsletters */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif font-bold">Latest Stories</h2>
                        <Link href="/newsletters" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    {fetching ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-neutral-600" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latestNewsletters.map((post) => (
                                <Link key={post.id} href={`/newsletter/${post.slug}`} className="group block">
                                    <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all h-full flex flex-col">
                                        <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                                            {post.heroImageUrl ? (
                                                <img src={post.heroImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                                    <BookOpen size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-2">
                                                {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : "New"}
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors leading-tight">
                                                {post.title}
                                            </h3>
                                            <div className="mt-auto pt-4 flex items-center text-sm text-neutral-500 font-medium">
                                                Read Article <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {latestNewsletters.length === 0 && (
                                <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-900/20 rounded-2xl border border-dashed border-neutral-800">
                                    No newsletters published yet. Check back soon!
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
