"use client";

import { useEffect, useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Shield, Check, X } from "lucide-react";

interface UserData {
    uid: string;
    email: string;
    role: Role;
    adminRequest?: boolean;
}

export default function SuperAdminRoles() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push("/login");
            else if (role !== "super_admin") router.push("/dashboard");
        }
    }, [authLoading, user, role, router]);

    // Fetch ONLY pending requests
    useEffect(() => {
        if (role === "super_admin") {
            const q = query(
                collection(db, "users"),
                where("adminRequest", "==", true),
                where("role", "==", "user") // Only users asking for promotion
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetched: UserData[] = [];
                snapshot.forEach((doc) => {
                    fetched.push(doc.data() as UserData);
                });
                setRequests(fetched);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [role]);

    const logAudit = async (action: string, details: string) => {
        try {
            await addDoc(collection(db, "auditLogs"), {
                action,
                details,
                performedBy: user?.email,
                performedByUid: user?.uid,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Audit Log Error", e);
        }
    };

    const handleApprove = async (uid: string, email: string) => {
        if (!confirm(`Approve admin access for ${email}?`)) return;
        try {
            await updateDoc(doc(db, "users", uid), {
                role: "admin",
                adminRequest: false
            });
            await logAudit("ADMIN_APPROVED", `Approved admin request for ${email} (${uid})`);
        } catch (e) {
            console.error(e);
            alert("Failed to approve");
        }
    };

    const handleReject = async (uid: string, email: string) => {
        if (!confirm(`Reject request for ${email}?`)) return;
        try {
            await updateDoc(doc(db, "users", uid), {
                adminRequest: false
            });
            await logAudit("ADMIN_REJECTED", `Rejected admin request for ${email} (${uid})`);
        } catch (e) {
            console.error(e);
            alert("Failed to reject");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-900 rounded-lg">
                        <Shield className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif">Roles & Permissions</h1>
                        <p className="text-neutral-500">Review pending access requests.</p>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="p-12 border border-neutral-800 rounded-xl bg-neutral-900/30 text-center">
                        <div className="inline-flex p-4 rounded-full bg-neutral-800 text-neutral-500 mb-4">
                            <Check size={24} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">All Caught Up</h3>
                        <p className="text-neutral-500">There are no pending admin access requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.uid} className="flex items-center justify-between p-6 border border-neutral-800 rounded-xl bg-neutral-900/40">
                                <div>
                                    <h3 className="text-lg font-medium text-white">{req.email}</h3>
                                    <p className="text-sm text-neutral-500 font-mono mt-1">UID: {req.uid}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleApprove(req.uid, req.email)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 rounded-lg hover:bg-emerald-900/40 transition-colors"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.uid, req.email)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition-colors"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
