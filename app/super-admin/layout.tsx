"use client";

import SuperAdminNavbar from "@/app/components/layout/SuperAdminNavbar";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <SuperAdminNavbar />
            <main className="relative">
                {children}
            </main>
        </div>
    );
}
