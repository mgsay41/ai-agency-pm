"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Extended user type with our custom fields
type ExtendedUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive?: boolean;
  phone?: string;
};

// Helper function to check if user is authenticated
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  return {
    user: session?.user as ExtendedUser | undefined,
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
    error,
  };
}

// Helper function to check if user has a specific role
export function useRole(requiredRole: string) {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    hasRole: user?.role === requiredRole,
    isLoading,
    isAuthenticated,
  };
}

// Helper function to check if user is admin
export function useIsAdmin() {
  const { hasRole, isLoading, isAuthenticated } = useRole("ADMIN");

  return {
    isAdmin: hasRole,
    isLoading,
    isAuthenticated,
  };
}
