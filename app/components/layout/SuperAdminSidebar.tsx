"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Users, Shield, LogOut } from "lucide-react";

export default function SuperAdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: "Overview", href: "/super-admin", icon: <LayoutDashboard size={20} /> },
        { name: "Users", href: "/super-admin/users", icon: <Users size={20} /> },
        { name: "Roles & Permissions", href: "/super-admin/roles", icon: <Shield size={20} /> },
    ];

    return (
        <aside className="w-64 bg-black border-r border-neutral-800 min-h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-neutral-800 bg-red-950/10">
                <Link href="/super-admin" className="text-2xl font-serif font-bold text-white tracking-wide">
                    NewsEcho <span className="text-xs font-sans font-normal text-red-500 block mt-1 tracking-widest uppercase">Super Admin</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/super-admin");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-red-900/20 text-red-500 border border-red-900/50"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-neutral-800">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
