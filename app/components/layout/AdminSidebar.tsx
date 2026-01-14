"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Newspaper, BarChart3, UserCog, LogOut } from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
        { name: "Newsletters", href: "/admin/newsletters", icon: <Newspaper size={20} /> },
        { name: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={20} /> },
        { name: "Profile", href: "/admin/profile", icon: <UserCog size={20} /> },
    ];

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-neutral-800">
                <Link href="/admin" className="text-2xl font-serif font-bold text-white tracking-wide">
                    NewsEcho <span className="text-xs font-sans font-normal text-indigo-400 block mt-1 tracking-widest uppercase">Admin</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-indigo-900/20 text-indigo-400 border border-indigo-900/50"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
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
                    className="flex w-full items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
