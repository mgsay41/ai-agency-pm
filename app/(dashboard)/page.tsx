"use client";

import { useAuth, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <p className="text-[#525252]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#171717]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#525252]">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-[#E5E5E5]"
          >
            Sign out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Total Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#171717]">0</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Projects in Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#171717]">0</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Overdue Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#171717]">0</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Team Members Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#171717]">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-[#E5E5E5]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#171717]">
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#525252]">
              Welcome to the AI Agency Project Management System. Phase 2 (Authentication) is complete!
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-[#525252]">
                ✅ User Authentication with Better Auth
              </p>
              <p className="text-sm text-[#525252]">
                ✅ Protected routes with middleware
              </p>
              <p className="text-sm text-[#525252]">
                ✅ Login and registration pages
              </p>
              <p className="text-sm text-[#A3A3A3] mt-4">
                Next: Phase 3 - Core UI Components
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
