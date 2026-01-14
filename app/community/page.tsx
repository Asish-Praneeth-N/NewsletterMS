"use client";

import { UserNavbar } from "../components/layout/UserNavbar";
import { Users, MessageSquare } from "lucide-react";

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <UserNavbar />

            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <div className="inline-flex p-6 bg-neutral-900/50 rounded-full border border-neutral-800 mb-8">
                    <Users className="text-indigo-500" size={48} />
                </div>

                <h1 className="text-4xl font-serif mb-4">NewsEcho Community</h1>
                <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
                    Connect with other readers, discuss newsletters, and share your thoughts.
                    <br />
                    <span className="text-indigo-400 font-medium text-sm block mt-2">Coming Soon</span>
                </p>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="p-6 border border-neutral-800 rounded-xl bg-neutral-900/30">
                        <MessageSquare className="text-neutral-500 mb-4" size={24} />
                        <h3 className="text-lg font-medium text-white mb-2">Discussion Boards</h3>
                        <p className="text-neutral-500">Engage in threaded conversations about your favorite topics.</p>
                    </div>
                    <div className="p-6 border border-neutral-800 rounded-xl bg-neutral-900/30">
                        <Users className="text-neutral-500 mb-4" size={24} />
                        <h3 className="text-lg font-medium text-white mb-2">Reader Networking</h3>
                        <p className="text-neutral-500">Find people with similar interests and build your circle.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
