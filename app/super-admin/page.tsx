"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, orderBy, onSnapshot } from "firebase/firestore";
import { Loader2, ShieldAlert, Check, X, Shield, User as UserIcon } from "lucide-react";
import { Role } from "../../context/AuthContext";

interface UserData {
    uid: string;
    email: string;
    role: Role;
    adminRequest?: boolean;
    createdAt?: any;
}

export default function SuperAdminDashboard() {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [fetching, setFetching] = useState(true);

    // 1. Strict Role Guard
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (role !== "super_admin") {
                // If they are admin/user trying to access super-admin, kick them to their correct dash
                if (role === "admin") router.push("/admin");
                else router.push("/dashboard");
            }
        }
    }, [user, role, loading, router]);

    // 2. Real-time User Fetching
    useEffect(() => {
        if (role === "super_admin") {
            const usersRef = collection(db, "users");
            // Fetch all users to manage them
            // In a real large app, you'd paginate this. For now, we list all.
            const q = query(usersRef, orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedUsers: UserData[] = [];
                snapshot.forEach((doc) => {
                    fetchedUsers.push(doc.data() as UserData);
                });
                setUsers(fetchedUsers);
                setFetching(false);
            });

            return () => unsubscribe();
        }
    }, [role]);

    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: "danger" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "info"
    });

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const handleRoleUpdate = (uid: string, newRole: Role) => {
        setConfirmModal({
            isOpen: true,
            title: "Change User Role",
            message: `Are you sure you want to change this user's role to ${newRole}? This will affect their permissions immediately.`,
            type: "info",
            onConfirm: async () => {
                try {
                    const userRef = doc(db, "users", uid);
                    await updateDoc(userRef, {
                        role: newRole,
                        adminRequest: false
                    });
                    setSuccessMsg(`User role updated to ${newRole}`);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    console.error("Failed to update role", error);
                    alert("Error: " + error.message);
                }
            }
        });
    };

    const handleRejectRequest = (uid: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Reject Admin Request",
            message: "Are you sure you want to reject this request? The user will remain a standard user.",
            type: "danger",
            onConfirm: async () => {
                try {
                    const userRef = doc(db, "users", uid);
                    await updateDoc(userRef, {
                        adminRequest: false
                    });
                    setSuccessMsg("Admin request rejected");
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    console.error("Failed to reject request", error);
                    alert("Error: " + error.message);
                }
            }
        });
    };

    if (loading || fetching) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" /> Verified Secure Access...
            </div>
        );
    }

    if (role !== "super_admin") return null;

    const pendingRequests = users.filter(u => u.adminRequest === true && u.role === "user");
    const allUsersList = users;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                            <ShieldAlert className="text-red-500" /> Super Admin Console
                        </h1>
                        <p className="text-neutral-500">Highest clearance level. Manage system access.</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-400 hover:text-white hover:border-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Admin Requests Section */}
                <section>
                    <h2 className="text-xl font-medium mb-4 text-white flex items-center gap-2">
                        <Shield className="text-indigo-400" size={20} /> Pending Admin Requests
                    </h2>

                    {pendingRequests.length === 0 ? (
                        <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900/30 text-center text-neutral-500 italic">
                            No pending requests at this time.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map((req) => (
                                <div key={req.uid} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-900/50">
                                    <div>
                                        <div className="font-medium text-white">{req.email}</div>
                                        <div className="text-xs text-neutral-500">UID: {req.uid}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleRoleUpdate(req.uid, "admin")}
                                            className="px-4 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-900 rounded hover:bg-emerald-900/50 flex items-center gap-2 text-sm transition-colors"
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(req.uid)}
                                            className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-900 rounded hover:bg-red-900/50 flex items-center gap-2 text-sm transition-colors"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* User Management Section */}
                <section>
                    <h2 className="text-xl font-medium mb-4 text-white flex items-center gap-2">
                        <UserIcon className="text-neutral-400" size={20} /> All Users Registry
                    </h2>

                    <div className="border border-neutral-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-900 text-neutral-400 font-medium">
                                <tr>
                                    <th className="p-4">Email / UID</th>
                                    <th className="p-4">Current Role</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {allUsersList.map((u) => (
                                    <tr key={u.uid} className="hover:bg-neutral-900/30 transition-colors">
                                        <td className="p-4">
                                            <div className="text-white font-medium">{u.email}</div>
                                            <div className="text-xs text-neutral-500 font-mono">{u.uid}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide border 
                                                ${u.role === 'super_admin' ? 'bg-red-950 text-red-400 border-red-900' :
                                                    u.role === 'admin' ? 'bg-indigo-950 text-indigo-400 border-indigo-900' :
                                                        'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            {u.role === "user" && (
                                                <button
                                                    onClick={() => handleRoleUpdate(u.uid, "admin")}
                                                    className="text-xs px-3 py-1.5 rounded border border-neutral-700 hover:border-white hover:text-white text-neutral-400 transition-colors"
                                                >
                                                    Promote to Admin
                                                </button>
                                            )}
                                            {u.role === "admin" && (
                                                <>
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.uid, "user")}
                                                        className="text-xs px-3 py-1.5 rounded border border-neutral-700 hover:border-white hover:text-white text-neutral-400 transition-colors"
                                                    >
                                                        Demote
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.uid, "super_admin")}
                                                        className="text-xs px-3 py-1.5 rounded border border-red-900 text-red-500 hover:bg-red-950 transition-colors ml-2"
                                                    >
                                                        Make Super Admin
                                                    </button>
                                                </>
                                            )}
                                            {u.role === "super_admin" && (
                                                <span className="text-xs text-neutral-600 italic">Immutable</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Custom Confirmation Modal */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-serif font-semibold text-white mb-2">{confirmModal.title}</h3>
                            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                                {confirmModal.message}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${confirmModal.type === 'danger'
                                        ? 'bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-900/50'
                                        : 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900 border border-indigo-900/50'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fixed Toast Notification */}
                {successMsg && (
                    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="bg-neutral-900/90 border border-emerald-900/50 text-white pl-4 pr-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 backdrop-blur-lg">
                            <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Check size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-emerald-400 text-sm tracking-wide uppercase">System Update</h4>
                                <p className="text-sm text-neutral-300">{successMsg}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
