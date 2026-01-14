"use client";

import { UserNavbar } from "../components/layout/UserNavbar";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, User, ArrowRight, BookOpen } from "lucide-react";

interface Newsletter {
    id: string;
    title: string;
    slug: string;
    heroImageUrl?: string;
    publishedAt: any;
    authorEmail?: string;
}

export default function NewslettersPage() {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "newsletters"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Newsletter[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Newsletter);
            });
            setNewsletters(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <UserNavbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 border-b border-neutral-800 pb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Library</h1>
                    <p className="text-xl text-neutral-400">Explore our collection of thoughts, stories, and insights.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {newsletters.map((post) => (
                            <Link key={post.id} href={`/newsletter/${post.slug}`} className="group flex flex-col h-full focus:outline-none">
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all duration-300 transform group-hover:-translate-y-1 shadow-2xl shadow-black">
                                    <div className="aspect-[16/9] relative overflow-hidden bg-neutral-800">
                                        {post.heroImageUrl ? (
                                            <img
                                                src={post.heroImageUrl}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                <BookOpen size={48} opacity={0.2} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                                            <span className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1 rounded text-neutral-300">
                                                <Calendar size={12} />
                                                {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : "Unknown"}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-indigo-300 transition-colors">
                                            {post.title}
                                        </h2>

                                        <div className="mt-auto pt-4 flex items-center justify-between text-sm border-t border-neutral-800/50">
                                            <span className="text-neutral-500 font-medium group-hover:text-white transition-colors">Read Story</span>
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {newsletters.length === 0 && (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-600">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">No stories yet</h3>
                                <p className="text-neutral-500">Check back later for new content.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
