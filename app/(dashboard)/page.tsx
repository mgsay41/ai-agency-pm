"use client";

import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name || "User"}`}
        action={
          <Button className="bg-[#18181B] hover:bg-[#27272A]">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      {/* Stats Cards */}
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
            <p className="text-2xl font-semibold text-[#DC2626]">0</p>
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

      {/* Getting Started Card */}
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#171717]">
            Phase 3 Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#525252]">
            Core UI Components & Layout implementation in progress
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#525252]">
              ✅ Dashboard layout with sidebar and header
            </p>
            <p className="text-sm text-[#525252]">
              ✅ Navigation components
            </p>
            <p className="text-sm text-[#525252]">
              ✅ Reusable UI components (LoadingSpinner, EmptyState, PageHeader)
            </p>
            <p className="text-sm text-[#A3A3A3] mt-4">
              Next: Phase 4 - Projects API & Backend Logic
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
