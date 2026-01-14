"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { Loader2, ClipboardList, Clock } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    details: string;
    performedBy: string;
    timestamp: any;
}

export default function AuditLogsPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || role !== "super_admin") router.push("/login");
        }
    }, [authLoading, user, role, router]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (role === "super_admin") {
                try {
                    const q = query(
                        collection(db, "auditLogs"),
                        orderBy("timestamp", "desc"),
                        limit(50)
                    );
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AuditLog[];
                    setLogs(data);
                } catch (error) {
                    console.error("Error fetching logs", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchLogs();
    }, [role]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-900 rounded-lg">
                        <ClipboardList className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif">System Audit Logs</h1>
                        <p className="text-neutral-500">Track all critical system actions.</p>
                    </div>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">No logs found.</div>
                    ) : (
                        <div className="divide-y divide-neutral-800">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-neutral-900/50 transition-colors">
                                    <div className="mt-1 text-neutral-500">
                                        <Clock size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-xs text-indigo-400 bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-900/50">
                                                {log.action}
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "Unknown Time"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-300 mb-1">{log.details}</p>
                                        <p className="text-xs text-neutral-600">Performed by: {log.performedBy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
