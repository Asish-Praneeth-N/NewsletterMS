"use client";

import { useEffect, useState } from "react";
import { UserNavbar } from "../components/layout/UserNavbar";
import { useAuth } from "../../context/AuthContext";
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Loader2, MessageSquare, Send, User, Clock } from "lucide-react";

interface Post {
    id: string;
    content: string;
    authorName: string;
    authorId: string;
    createdAt: any;
    newsletterId?: string; // Optional: link to a newsletter
}

export default function CommunityPage() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Post[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Post);
            });
            setPosts(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !user) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "community_posts"), {
                content: newPost,
                authorId: user.uid,
                authorName: user.displayName || "Anonymous Reader",
                createdAt: serverTimestamp(),
            });
            setNewPost("");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            <UserNavbar />

            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold mb-4">Community Discussions</h1>
                    <p className="text-neutral-400">Join the conversation with other NewsEcho readers.</p>
                </div>

                {/* Create Post */}
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 mb-10 shadow-lg">
                    <form onSubmit={handlePost}>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center shrink-0">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full bg-transparent border-none text-white placeholder-neutral-500 focus:ring-0 resize-none h-24 text-lg"
                                />
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-800/50">
                                    <span className="text-xs text-neutral-600">Markdown supported</span>
                                    <button
                                        type="submit"
                                        disabled={submitting || !newPost.trim()}
                                        className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
                            <MessageSquare className="mx-auto text-neutral-600 mb-3" size={32} />
                            <p className="text-neutral-500">No discussions yet. Be the first to post!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 hover:bg-neutral-900/40 transition-colors group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                                            {post.authorName[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white text-sm">{post.authorName}</div>
                                            <div className="text-xs text-neutral-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : "Just now"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap pl-11">
                                    {post.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
