"use client";

import AdminNavbar from "@/app/components/layout/AdminNavbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <AdminNavbar />
            <main className="relative">
                {children}
            </main>
        </div>
    );
}
