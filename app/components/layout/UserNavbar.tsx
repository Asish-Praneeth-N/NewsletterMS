"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Newspaper, Users, Bookmark, User, LogOut } from "lucide-react";

export default function UserNavbar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
        { name: "Newsletters", href: "/newsletters", icon: <Newspaper size={20} /> },
        { name: "Community", href: "/community", icon: <Users size={20} /> },
        { name: "Subscriptions", href: "/subscriptions", icon: <Bookmark size={20} /> },
        { name: "Profile", href: "/profile", icon: <User size={20} /> },
    ];

    return (
        <nav className="border-b border-neutral-800 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="text-xl font-serif font-bold text-white tracking-wide">
                            NewsEcho
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${isActive
                                                ? "bg-white/10 text-white"
                                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="p-2 text-neutral-400 hover:text-white transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Nav (Simple Bottom Bar for now) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-2 flex justify-around z-50">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${isActive
                                    ? "text-white bg-white/10"
                                    : "text-neutral-500"
                                }`}
                        >
                            {item.icon}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
