"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Loader2, Upload, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNewsletter() {
    const { user, role } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"draft" | "published">("draft");

    // Guard (Client-side, usually handled by Layout/Middleware too)
    if (role !== "admin" && role !== "super_admin") {
        return null;
    }

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
        setSlug(generateSlug(e.target.value));
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

            router.push("/admin/newsletters");
        } catch (error) {
            console.error("Error creating newsletter:", error);
            alert("Failed to create newsletter. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/newsletters" className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-serif">New Newsletter</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Title & Slug */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-serif"
                                placeholder="Enter newsletter title..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-400 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Hero Image</label>
                        <div className="border-2 border-dashed border-neutral-800 rounded-lg p-8 text-center hover:border-neutral-600 transition-colors relative group">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {previewUrl ? (
                                <div className="relative aspect-video max-w-md mx-auto overflow-hidden rounded-lg">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-neutral-500">
                                    <Upload size={32} className="mb-2" />
                                    <p>Click to upload or drag and drop</p>
                                    <p className="text-xs text-neutral-600 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-96 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-lg leading-relaxed resize-y"
                            placeholder="Start writing your story..."
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-8 border-t border-neutral-800">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                            className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2 outline-none cursor-pointer"
                        >
                            <option value="draft">Save as Draft</option>
                            <option value="published">Publish Immediately</option>
                        </select>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {status === "published" ? "Publish Newsletter" : "Save Draft"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
