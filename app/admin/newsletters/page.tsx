"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Edit, Trash2, Calendar, FileText, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Newsletter {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "scheduled";
    publishedAt?: any;
    updatedAt?: any;
    heroImageUrl?: string;
    authorEmail?: string;
}

export default function NewsletterList() {
    const { role } = useAuth();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");

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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link click if nested
        if (confirm("Are you sure you want to delete this newsletter?")) {
            await deleteDoc(doc(db, "newsletters", id));
        }
    };

    const filteredNewsletters = newsletters.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || post.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">Content Library</h1>
                        <p className="text-neutral-500">Manage all your newsletters and drafts.</p>
                    </div>
                    <Link
                        href="/admin/newsletters/new"
                        className="bg-white text-black px-5 py-2.5 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 self-start md:self-auto shadow-lg shadow-white/10"
                    >
                        <Plus size={20} /> New Newsletter
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-8 bg-neutral-900/30 p-2 rounded-xl border border-neutral-800 w-full md:w-auto self-start inline-flex">
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white pl-10 pr-4 py-2 text-sm placeholder-neutral-600"
                        />
                    </div>
                    <div className="h-6 w-px bg-neutral-800" />
                    <div className="flex items-center gap-2 px-3">
                        <Filter size={14} className="text-neutral-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-transparent border-none outline-none text-sm text-neutral-300 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                </div>

                {/* List View */}
                <div className="space-y-3">
                    {filteredNewsletters.map((post) => (
                        <div key={post.id} className="group flex items-center p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:bg-neutral-900/60 hover:border-neutral-700 transition-all">

                            {/* Image */}
                            <div className="flex-shrink-0 w-24 h-16 mr-6 relative overflow-hidden rounded bg-neutral-800">
                                {post.heroImageUrl ? (
                                    <img src={post.heroImageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                        <FileText size={20} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 mr-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                                        <Link href={`/admin/newsletters/${post.id}`}>{post.title || "Untitled Draft"}</Link>
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${post.status === 'published' ? 'bg-emerald-950/50 text-emerald-500 border-emerald-900/50' :
                                            'bg-neutral-800 text-neutral-400 border-neutral-700'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono">{post.slug}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/admin/newsletters/${post.id}`}
                                    className="p-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={(e) => handleDelete(post.id, e)}
                                    className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800/50 hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredNewsletters.length === 0 && !loading && (
                        <div className="text-center py-24 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/10">
                            <p className="text-neutral-500 text-lg mb-2">No newsletters found.</p>
                            <Link href="/admin/newsletters/new" className="text-indigo-400 hover:underline">
                                Create your first post
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
