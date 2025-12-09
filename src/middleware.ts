import { clerkMiddleware } from "@clerk/nextjs/server";

// Temporarily keep Clerk middleware minimal to avoid redirect loops on pages.
// Page-level protection is handled inside components (e.g. AppLayout) for now.
export default clerkMiddleware();

export const config = {
    matcher: [
        // Only run Clerk middleware for API routes while debugging auth flow
        "/(api|trpc)(.*)",
    ],
};
