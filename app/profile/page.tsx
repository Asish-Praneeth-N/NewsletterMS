"use client";

import { useEffect, useState } from "react";
import { UserNavbar } from "../components/layout/UserNavbar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Loader2, User, Mail, Shield, Clock } from "lucide-react";

export default function ProfilePage() {
    const { user, role, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "rejected">("none");
    const [joinedAt, setJoinedAt] = useState<string>("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.adminRequest) setRequestStatus("pending");
                    else setRequestStatus("none");

                    if (data.createdAt) {
                        setJoinedAt(new Date(data.createdAt.seconds * 1000).toLocaleDateString());
                    }
                }
            });
            return () => unsub();
        }
    }, [user]);

    const handleRequestAdmin = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                adminRequest: true
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <UserNavbar />

            <div className="max-w-2xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-serif mb-8">My Profile</h1>

                {/* Profile Card */}
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 border border-neutral-700">
                            <User size={40} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-medium">{user.displayName || "User"}</h2>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${role === 'admin' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-900' :
                                        role === 'super_admin' ? 'bg-red-900/30 text-red-500 border-red-900' :
                                            'bg-neutral-800 text-neutral-400 border-neutral-700'
                                    }`}>
                                    {role}
                                </span>
                            </div>
                            <p className="text-neutral-500 items-center flex gap-2 text-sm">
                                <Mail size={14} /> {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-lg">
                            <div className="text-sm text-neutral-500">User ID</div>
                            <div className="font-mono text-sm text-neutral-300">{user.uid}</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-lg">
                            <div className="text-sm text-neutral-500">Joined</div>
                            <div className="text-sm text-neutral-300">{joinedAt || "-"}</div>
                        </div>
                    </div>
                </div>

                {/* Account Status / Actions */}
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8">
                    <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-indigo-400" /> Account Status
                    </h3>

                    {role === "user" && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-neutral-200">Publisher Access</h4>
                                <p className="text-sm text-neutral-500 mt-1 max-w-sm">
                                    {requestStatus === "pending"
                                        ? "Your request is currently being reviewed by our administrators."
                                        : "Want to start writing your own newsletters? Request admin access."}
                                </p>
                            </div>

                            {requestStatus === "pending" ? (
                                <span className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 rounded-lg text-sm font-medium">
                                    <Clock size={16} /> Reviewing
                                </span>
                            ) : (
                                <button
                                    onClick={handleRequestAdmin}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium"
                                >
                                    Request Access
                                </button>
                            )}
                        </div>
                    )}

                    {role !== "user" && (
                        <div className="text-sm text-neutral-400 bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-lg">
                            You have active <strong>{role}</strong> privileges. Access your dashboard to manage content.
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-neutral-800">
                        <button
                            onClick={() => logout()}
                            className="w-full py-3 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-sm font-medium"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
