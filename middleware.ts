import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Using a lightweight internal fetch to get the role since Admin SDK isn't available in Edge Middleware,
// and Client SDK shouldn't be used here. 
// Alternatively, we trusted the client with the cookie, but for production security, we should ideally verify.
// For this architecture, since we are syncing `authToken` cookie which is a valid Firebase ID token,
// we can decode it if we had a library, or use a custom claim. 
// However, strictly following the prompt's request for `getUserRoleFromFirestore`, 
// we'll implement a helper that effectively checks the public claims or relies on a basic check 
// if we can't run full Firestore SDK in Edge.
//
// CRITICAL NOTE: Reading Firestore directly in Edge Middleware is hard without the REST API.
// To keep it robust and follow the prompt exactly, we will assume we can decode the token or
// simply rely on the token presence for generic auth, and Client-Side protection for granular roles
// IF we cannot easily fetch Firestore here. 
//
// BUT, the prompt explicitly asked for `getUserRoleFromFirestore`. 
// To make this work in a "Senior" way without complex Edge adapters, we'll try to use the 
// Firebase Auth REST API "Get User Data" to verify the token and get custom claims (if set),
// OR just rely on the token presence + strict client-side checks as a fallback 
// if we don't want to expose API keys.
//
// LET'S DO THIS: We will interpret "getUserRoleFromFirestore" as a logical requirement.
// Since we don't have Custom Claims set up in a Cloud Function (which is the BEST way),
// AND we can't use `firebase-admin` in Middleware (Node.js runtime only),
// AND `firebase/firestore` JS SDK is heavy/not edge-friendly:
//
// PLAN: We will decode the JWT (authToken) to check for expiration.
// Authenticated user check is easy. 
// For Role-Based checking in Middleware without Custom Claims:
// Use a secure pattern: 
// 1. Check if authToken exists.
// 2. If exists, we assume logged in.
// 3. To get the ROLE specifically, typically you'd hit an API route. 
//    For now, we will perform a fetch to Firestore REST API using the ID Token for auth.

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
        // This confirms validity and gets us the UID
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

        const authRes = await fetch(authUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token })
        });

        if (!authRes.ok) {
            console.error("Middleware Auth Check Failed:", authRes.status, await authRes.text());
            return null;
        }

        const authData = await authRes.json();
        const uid = authData.users[0].localId;

        // 2. Fetch User Document from Firestore REST API
        // https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/users/{uid}
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;

        // We can use the SAME token to authenticate the Firestore request if rules allow it!
        const firestoreRes = await fetch(firestoreUrl, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!firestoreRes.ok) {
            console.error("Middleware Firestore Check Failed:", firestoreRes.status); // likely 403 or 404
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
        if (token && path !== "/") {
            // Optimization: If already logged in, maybe redirect to dashboard? 
            // Keeping it simple as per prompt instructions to strictly follow guard logic
        }
        return NextResponse.next();
    }

    // 2. Protected Routes: Require Token
    if (!token) {
        // Redirect to login with return url could be nice, but stick to simple
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 3. Role-Based Access Control
    // We fetch the role using the helper
    const role = await getUserRoleFromFirestore(token);

    if (!role) {
        // Token invalid or session expired during check
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin Guard
    if (path.startsWith("/admin") && role !== "admin" && role !== "super_admin") {
        // Note: Super admins generally have implicit admin access in many systems, 
        // but the prompt says STRICT hierarchy: super_admin (only ONE) > admin > user.
        // Prompt logic: "if (path.startsWith("/admin") && role !== "admin")" -> implied strictness.
        // However, usually Super Admin should access Admin. 
        // Let's stick to the prompt's STRICT rules: 
        // "if (path.startsWith("/admin") && role !== "admin") { valid only if logic excludes super_admin? }"
        // Wait, the prompt said "super_admin > admin".
        // So Super Admin SHOULD access admin routes.
        // Let's adjust the logic slightly to be safe for a real app: 
        if (role !== "admin" && role !== "super_admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    // Super Admin Guard
    if (path.startsWith("/super-admin") && role !== "super_admin") {
        // If admin tries to access, go to specific dashboard
        if (role === 'admin') return NextResponse.redirect(new URL("/admin", req.url));
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Dashboard Role Redirects (Prevent high-level roles from seeing basic user dashboard if desired?)
    // Prompt: "if (path === "/dashboard" && role === "admin") -> redirect /admin"
    if (path === "/dashboard") {
        if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public images (svg, png, jpg, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
