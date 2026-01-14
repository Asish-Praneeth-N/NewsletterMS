import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to fetch user role from Firestore via REST API
// This allows strict role-based guarding at the Edge.
async function getUserRoleFromFirestore(token: string): Promise<string | null> {
    if (!token) return null;

    try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!apiKey || !projectId) {
            console.error("Middleware Error: Missing Environment Variables");
            return null;
        }

        // 1. Verify token with Firebase Auth REST API (User Data) 
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

        const authRes = await fetch(authUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token })
        });

        if (!authRes.ok) {
            return null;
        }

        const authData = await authRes.json();
        const uid = authData.users[0].localId;

        // 2. Fetch User Document from Firestore REST API
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;

        const firestoreRes = await fetch(firestoreUrl, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!firestoreRes.ok) {
            return null;
        }

        const firestoreData = await firestoreRes.json();
        // Firestore REST API structure: { fields: { role: { stringValue: "admin" } } }
        const role = firestoreData.fields?.role?.stringValue;

        return role || "user";

    } catch (error) {
        console.error("Middleware Exception", error);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value;
    const path = req.nextUrl.pathname;

    // 1. Public Routes: Always allow
    if (path === "/login" || path === "/signup" || path === "/") {
        return NextResponse.next();
    }

    // 2. Protected Routes: Require Token
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 3. Role-Based Access Control
    const role = await getUserRoleFromFirestore(token);

    if (!role) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin Guard (Strict: Admin ONLY)
    if (path.startsWith("/admin") && role !== "admin") {
        if (role === 'super_admin') return NextResponse.redirect(new URL("/super-admin", req.url));
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Super Admin Guard
    if (path.startsWith("/super-admin") && role !== "super_admin") {
        if (role === 'admin') return NextResponse.redirect(new URL("/admin", req.url));
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Dashboard Role Redirects
    if (path === "/dashboard") {
        if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
