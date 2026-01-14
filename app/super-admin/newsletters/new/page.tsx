"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Loader2, Upload, Save, ArrowLeft, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function SuperAdminCreateNewsletter() {
    const { user, role } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"draft" | "published">("draft");

    // Guard Handled by Middleware

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (!slug) {
            setSlug(generateSlug(e.target.value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let heroImageUrl = "";
            if (imageFile) {
                heroImageUrl = await uploadToCloudinary(imageFile);
            }

            await addDoc(collection(db, "newsletters"), {
                title,
                slug,
                content,
                heroImageUrl,
                status,
                authorId: user?.uid,
                authorEmail: user?.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                publishedAt: status === "published" ? serverTimestamp() : null
            });

            router.push("/super-admin/newsletters");
        } catch (error) {
            console.error("Error creating newsletter:", error);
            alert("Failed to create. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (role !== "super_admin") return null;

    return (
        <div className="min-h-screen bg-black text-white">
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-screen overflow-hidden">

                {/* LEFT: Editor Area */}
                <div className="flex-1 flex flex-col h-full overflow-y-auto border-r border-neutral-800">

                    {/* Toolbar */}
                    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/super-admin/newsletters" className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <span className="text-sm font-medium text-neutral-500">Super Admin Editor</span>
                        </div>
                    </div>

                    <div className="p-8 max-w-3xl mx-auto w-full">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Post Title"
                            className="w-full bg-transparent text-4xl font-serif font-bold text-white placeholder-neutral-700 outline-none mb-6"
                            required
                        />

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your story..."
                            className="w-full h-[calc(100vh-300px)] bg-transparent text-lg text-neutral-300 placeholder-neutral-700 outline-none resize-none leading-relaxed font-serif"
                            required
                        />
                    </div>
                </div>

                {/* RIGHT: Settings Sidebar */}
                <div className="w-full lg:w-96 bg-neutral-900/30 h-full overflow-y-auto p-6 flex flex-col gap-8">

                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Publishing</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-black p-3 rounded-lg border border-neutral-800">
                                <span className="text-sm text-neutral-300">Status</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                                    className="bg-neutral-900 text-white text-sm border-none outline-none rounded focus:ring-0 cursor-pointer"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${status === 'published'
                                    ? 'bg-red-600 hover:bg-red-500 text-white' // Red for Super Admin
                                    : 'bg-white text-black hover:bg-neutral-200'
                                    }`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {status === 'published' ? 'Publish Now' : 'Save Draft'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Post Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">URL Slug</label>
                                <div className="flex bg-black border border-neutral-800 rounded-lg overflow-hidden">
                                    <span className="bg-neutral-900 text-neutral-500 px-3 py-2 text-xs border-r border-neutral-800 flex items-center">/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full bg-transparent px-3 py-2 text-sm text-neutral-300 outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Featured Image</h3>
                        <div className="border-2 border-dashed border-neutral-800 rounded-xl p-4 text-center hover:border-neutral-600 transition-colors relative group bg-black/50">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {previewUrl ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-white bg-black/80 px-2 py-1 rounded">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-neutral-500">
                                    <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Upload Hero Image</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
