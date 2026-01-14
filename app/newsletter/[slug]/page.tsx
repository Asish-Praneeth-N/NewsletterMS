"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { UserNavbar } from "@/app/components/layout/UserNavbar";
import { Loader2, Calendar, User, Clock, Share2, Bookmark, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { notFound, useParams } from "next/navigation";

// Use client-side data fetching for this dynamic route for simplicity in this user flow
export default function NewsletterReader() {
    const params = useParams(); // { slug: string }
    const { user } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        async function fetchPost() {
            if (!params.slug) return;

            try {
                const q = query(
                    collection(db, "newsletters"),
                    where("slug", "==", params.slug),
                    where("status", "==", "published")
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setPost(null);
                } else {
                    const docData = snapshot.docs[0];
                    setPost({ id: docData.id, ...docData.data() });
                }
            } catch (err) {
                console.error("Error fetching post", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [params.slug]);

    useEffect(() => {
        // Check subscription status
        async function checkSub() {
            if (!user || !post) return;
            // Simplified check: usually we'd query the subscriptions collection
            // For now, let's just default to false as we haven't implemented the strict sub check logic here yet
        }
        checkSub();
    }, [user, post]);

    const handleSubscribe = async () => {
        if (!user || !post) return;
        setSubscribing(true);
        // Implement subscription logic
        // For MVP spec, we just simulate or add to 'subscriptions' collection
        try {
            await setDoc(doc(db, "subscriptions", `${user.uid}_${post.id}`), {
                userId: user.uid,
                newsletterId: post.id,
                createdAt: new Date()
            });
            setIsSubscribed(true);
        } catch (e) {
            console.error(e);
        } finally {
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black text-white">
                <UserNavbar />
                <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                    <h1 className="text-3xl font-bold mb-4">Story not found</h1>
                    <p className="text-neutral-400">This newsletter may have been removed or is not yet published.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
            <UserNavbar />

            {/* Content Container */}
            <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">

                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mb-6 uppercase tracking-widest font-medium">
                        <span className="flex items-center gap-2">
                            <Calendar size={14} />
                            {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : ""}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-400">NewsEcho</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight text-white">
                        {post.title}
                    </h1>

                    {/* Author / Actions */}
                    <div className="flex items-center justify-between border-t border-b border-neutral-800 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-serif font-bold text-lg">
                                N
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">NewsEcho Team</div>
                                <div className="text-xs text-neutral-500">Editor</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-neutral-400 hover:text-white transition-colors" title="Bookmark">
                                <Bookmark size={20} />
                            </button>
                            <button className="p-2 text-neutral-400 hover:text-white transition-colors" title="Share">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                {post.heroImageUrl && (
                    <div className="mb-12 rounded-xl overflow-hidden shadow-2xl">
                        <img src={post.heroImageUrl} alt={post.title} className="w-full h-auto object-cover" />
                    </div>
                )}

                {/* Body Content */}
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-neutral-300 prose-p:leading-relaxed prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white prose-blockquote:border-l-indigo-500 prose-blockquote:bg-neutral-900/50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:rounded-r-lg">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Footer / Subscribe CTA */}
                <div className="mt-20 pt-12 border-t border-neutral-800">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 md:p-12 text-center">
                        <h3 className="text-2xl font-serif font-bold mb-4">Enjoyed this story?</h3>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                            Subscribe to NewsEcho to get the latest posts delivered right to your dashboard.
                        </p>

                        <button
                            onClick={handleSubscribe}
                            disabled={subscribing || isSubscribed}
                            className={`px-8 py-3 rounded-full font-medium transition-all ${isSubscribed
                                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-900 cursor-default"
                                    : "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10"
                                }`}
                        >
                            {isSubscribed ? (
                                <span className="flex items-center gap-2"><Check size={18} /> Subscribed</span>
                            ) : (
                                subscribing ? "Subscribing..." : "Subscribe for Updates"
                            )}
                        </button>
                    </div>
                </div>

            </article>
        </div>
    );
}
