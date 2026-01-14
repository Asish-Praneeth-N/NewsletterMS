"use client";

import { useEffect, useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, User as UserIcon, Check, ShieldAlert } from "lucide-react";

interface UserData {
    uid: string;
    email: string;
    role: Role;
    adminRequest?: boolean;
    createdAt?: any;
}

export default function SuperAdminUsers() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push("/login");
            else if (role !== "super_admin") router.push("/dashboard");
        }
    }, [authLoading, user, role, router]);

    useEffect(() => {
        if (role === "super_admin") {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedUsers: UserData[] = [];
                snapshot.forEach((doc) => {
                    fetchedUsers.push(doc.data() as UserData);
                });
                setUsers(fetchedUsers);
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

    const handleRoleUpdate = async (uid: string, targetRole: Role, email: string) => {
        if (!confirm(`Are you sure you want to change ${email}'s role to ${targetRole}?`)) return;

        try {
            await updateDoc(doc(db, "users", uid), {
                role: targetRole,
                adminRequest: false
            });
            await logAudit("ROLE_CHANGE", `Changed role of ${email} (${uid}) to ${targetRole}`);
            alert(`User role updated to ${targetRole}`);
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (role !== "super_admin") return null;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-900 rounded-lg">
                        <UserIcon className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif">Users Registry</h1>
                        <p className="text-neutral-500">Manage all users and their permissions.</p>
                    </div>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-900 text-neutral-400 font-medium border-b border-neutral-800">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {users.map((u) => (
                                <tr key={u.uid} className="hover:bg-neutral-900/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{u.email}</div>
                                        <div className="text-xs text-neutral-500 font-mono">{u.uid}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide border 
                                            ${u.role === 'super_admin' ? 'bg-red-950/50 text-red-500 border-red-900' :
                                                u.role === 'admin' ? 'bg-indigo-950/50 text-indigo-400 border-indigo-900' :
                                                    'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-400">
                                        {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {u.role === "user" && (
                                                <button
                                                    onClick={() => handleRoleUpdate(u.uid, "admin", u.email)}
                                                    className="px-3 py-1.5 text-xs font-medium border border-neutral-700 hover:border-white hover:text-white text-neutral-400 rounded transition-colors"
                                                >
                                                    Promote to Admin
                                                </button>
                                            )}
                                            {u.role === "admin" && (
                                                <>
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.uid, "user", u.email)}
                                                        className="px-3 py-1.5 text-xs font-medium border border-neutral-700 hover:border-white hover:text-white text-neutral-400 rounded transition-colors"
                                                    >
                                                        Demote
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.uid, "super_admin", u.email)}
                                                        className="px-3 py-1.5 text-xs font-medium border border-red-900 text-red-500 hover:bg-red-950 rounded transition-colors"
                                                    >
                                                        Make Super Admin
                                                    </button>
                                                </>
                                            )}
                                            {u.role === "super_admin" && (
                                                <span className="text-xs text-neutral-600 italic px-2">Protected</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
