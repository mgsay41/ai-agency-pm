"use client";

import { Briefcase, FolderKanban, AlertCircle, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import type { DashboardStats } from "@/lib/services/dashboard.service";

interface DashboardClientProps {
  initialStats: DashboardStats | null;
}

export function DashboardClient({ initialStats }: DashboardClientProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Projects"
          value={initialStats?.activeProjects || 0}
          icon={Briefcase}
        />
        <StatsCard
          title="Projects in Planning"
          value={initialStats?.planningProjects || 0}
          icon={FolderKanban}
        />
        <StatsCard
          title="Overdue Projects"
          value={initialStats?.overdueProjects || 0}
          icon={AlertCircle}
          className={initialStats?.overdueProjects ? "border-[#FEE2E2] bg-[#FEF2F2]/30" : ""}
        />
        <StatsCard
          title="Team Members Active"
          value={initialStats?.activeTeamMembers || 0}
          icon={Users}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-1">
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
}
