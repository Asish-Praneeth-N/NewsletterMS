"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Newsletter {
    id: string;
    title: string;
    status: "draft" | "published" | "scheduled";
    publishedAt?: any;
    createdAt?: any;
    heroImageUrl?: string;
}

export default function NewsletterList() {
    const { role } = useAuth();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);

    if (role !== "admin" && role !== "super_admin") return null;

    useEffect(() => {
        const q = query(collection(db, "newsletters"), orderBy("updatedAt", "desc"));
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

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this newsletter?")) {
            await deleteDoc(doc(db, "newsletters", id));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif">Newsletters</h1>
                        <p className="text-neutral-500">Manage your publication content.</p>
                    </div>
                    <Link
                        href="/admin/newsletters/new"
                        className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} /> New Post
                    </Link>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {newsletters.map((post) => (
                        <div key={post.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                            <div className="flex items-center gap-6">
                                {post.heroImageUrl ? (
                                    <img src={post.heroImageUrl} alt="" className="w-16 h-16 object-cover rounded bg-neutral-800" />
                                ) : (
                                    <div className="w-16 h-16 bg-neutral-800 rounded flex items-center justify-center text-neutral-600">
                                        <FileText size={24} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-lg text-white mb-1 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500 uppercase tracking-wide">
                                        <span className={`px-2 py-0.5 rounded border ${post.status === 'published' ? 'bg-emerald-950/50 text-emerald-500 border-emerald-900' :
                                                'bg-neutral-800 text-neutral-400 border-neutral-700'
                                            }`}>
                                            {post.status}
                                        </span>
                                        {post.publishedAt && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(post.publishedAt.seconds * 1000).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* <Link href={`/newsletter/${post.slug}`} target="_blank" className="p-2 text-neutral-500 hover:text-white transition-colors" title="View">
                                    <Eye size={18} />
                                </Link> */}
                                {/* Link to view page later */}

                                <button className="p-2 text-neutral-500 hover:text-white transition-colors" title="Edit">
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {newsletters.length === 0 && !loading && (
                        <div className="text-center py-24 text-neutral-500">
                            No newsletters found. Start writing today.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
