"use client"

import { useUser, useAuth, useClerk } from "@clerk/nextjs";

// Clerk-compatible session hook that mimics the old better-auth interface
export function useSession() {
   const { user, isLoaded } = useUser();
   const { isSignedIn } = useAuth();

   const sessionData = user ? {
      user: {
         id: user.id,
         name: user.fullName || user.firstName || 'User',
         email: user.primaryEmailAddress?.emailAddress || '',
         image: user.imageUrl,
      }
   } : null;

   return {
      data: sessionData,
      isPending: !isLoaded,
      error: null,
      refetch: () => { }, // Clerk handles this automatically
   };
}

// Auth client for compatibility with existing code
export const authClient = {
   signOut: async () => {
      // This will be handled by Clerk's signOut in components
      return { error: null };
   },
   signIn: {
      email: async () => {
         // Handled by Clerk's useSignIn hook in LoginPage
         return { error: null, data: null };
      }
   },
   signUp: {
      email: async () => {
         // Handled by Clerk's useSignUp hook in RegisterPage
         return { error: null, data: null };
      }
   },
   $ERROR_CODES: {
      USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
   }
};

// Export Clerk hooks for direct usage
export { useUser, useAuth, useClerk };