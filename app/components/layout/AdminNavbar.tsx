"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Newspaper, BarChart3, UserCog, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
        { name: "Content", href: "/admin/newsletters", icon: <Newspaper size={18} /> },
        { name: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={18} /> },
    ];

    return (
        <nav className="border-b border-neutral-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <Link href="/admin" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-indigo-900/50 group-hover:scale-105 transition-transform">
                                N
                            </div>
                            <span className="text-xl font-serif font-bold text-white tracking-wide">
                                NewsEcho <span className="text-xs font-sans font-normal text-indigo-400 opacity-80 uppercase tracking-widest ml-1">Admin</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
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

                    {/* Right Side: Profile & Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                                    {user?.email?.[0] || "A"}
                                </div>
                                <span className="text-sm text-neutral-300 max-w-[100px] truncate">{user?.displayName || "Admin"}</span>
                                <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-neutral-800">
                                        <p className="text-xs text-neutral-500 uppercase font-medium">Signed in as</p>
                                        <p className="text-sm text-white truncate font-medium">{user?.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            href="/admin/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <UserCog size={16} /> Profile Settings
                                        </Link>
                                        <button
                                            onClick={() => logout()}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-neutral-400 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-xl">
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                            ? "bg-indigo-900/20 text-indigo-400 border border-indigo-900/50"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="h-px bg-neutral-800 my-2" />
                        <Link
                            href="/admin/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                            <UserCog size={18} /> Profile
                        </Link>
                        <button
                            onClick={() => logout()}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/10"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
