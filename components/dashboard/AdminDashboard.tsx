"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  DollarSign,
  Building2,
  Calendar,
  TrendingUp,
  ChevronDown,
  MapPin,
  Video,
  CheckCircle2,
  CircleDashed,
  PauseCircle,
  PlayCircle,
  Archive,
  ArrowRight,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminDashboardData } from "@/lib/dashboard/admin-dashboard";
import { format } from "date-fns";

interface AdminDashboardProps {
  data: AdminDashboardData;
}

// Helper function to get status color and icon
const getStatusConfig = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        color: "text-[#16A34A]",
        bgColor: "bg-[#F0FDF4]",
        borderColor: "border-[#86EFAC]",
        label: "Completed",
      };
    case "PLANNING":
      return {
        icon: CircleDashed,
        color: "text-[#6366F1]",
        bgColor: "bg-[#EEF2FF]",
        borderColor: "border-[#C7D2FE]",
        label: "Planning",
      };
    case "ON_HOLD":
      return {
        icon: PauseCircle,
        color: "text-[#F59E0B]",
        bgColor: "bg-[#FFFBEB]",
        borderColor: "border-[#FCD34D]",
        label: "On Hold",
      };
    case "ACTIVE":
      return {
        icon: PlayCircle,
        color: "text-[#10B981]",
        bgColor: "bg-[#ECFDF5]",
        borderColor: "border-[#6EE7B7]",
        label: "Active",
      };
    case "ARCHIVED":
      return {
        icon: Archive,
        color: "text-[#6B7280]",
        bgColor: "bg-[#F9FAFB]",
        borderColor: "border-[#D1D5DB]",
        label: "Archived",
      };
    default:
      return {
        icon: CircleDashed,
        color: "text-[#6B7280]",
        bgColor: "bg-[#F9FAFB]",
        borderColor: "border-[#D1D5DB]",
        label: status,
      };
  }
};

export function AdminDashboard({ data }: AdminDashboardProps) {
  const router = useRouter();
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Show only 3 activities initially, or all if button is clicked
  const displayedActivities = showAllActivities
    ? data.recentActivities
    : data.recentActivities.slice(0, 3);

  // Calculate total projects for percentage
  const totalProjects = data.projectsByStatus.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#171717]">Admin Dashboard</h1>
          <p className="text-sm text-[#A3A3A3] mt-1">
            Overview of your agency's performance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={data.totalProjects}
          icon={Briefcase}
          trend={{
            value: 12,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Active Clients"
          value={data.activeClients}
          icon={Building2}
          trend={{
            value: 8,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Total Budget"
          value={`$${(data.totalBudget / 1000).toFixed(1)}k`}
          icon={DollarSign}
          trend={{
            value: 15,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Team Members"
          value={data.teamMembers}
          icon={Users}
          trend={{
            value: 5,
            isPositive: true,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects by Status - Enhanced Design */}
        <Card className="border-[#E5E5E5] lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-[#F5F5F5]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-[#171717]">
                  Projects by Status
                </CardTitle>
                <p className="text-xs text-[#A3A3A3] mt-1">
                  Current distribution across all projects
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/projects")}
                className="text-[#18181B] hover:bg-[#F5F5F5]"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.projectsByStatus.map((item) => {
                const config = getStatusConfig(item.status);
                const Icon = config.icon;
                const percentage =
                  totalProjects > 0
                    ? ((item.count / totalProjects) * 100).toFixed(0)
                    : 0;

                return (
                  <div
                    key={item.status}
                    className={`relative overflow-hidden rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer`}
                    onClick={() => router.push(`/projects?status=${item.status}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-white/80`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${config.color}`}>
                          {item.count}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">
                        {config.label}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {item.count === 1 ? "project" : "projects"}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50">
                      <div
                        className={`h-full ${config.color.replace("text", "bg")} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings This Week */}
        <Card className="border-[#E5E5E5] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F5F5F5]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-[#171717]">
                  Upcoming Meetings
                </CardTitle>
                <p className="text-xs text-[#A3A3A3] mt-1">This week's schedule</p>
              </div>
              <Badge className="bg-[#EFF6FF] text-[#2563EB] border-0">
                {data.upcomingMeetingsDetails.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {data.upcomingMeetingsDetails.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-[#FAFAFA] rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-[#D1D5DB]" />
                </div>
                <p className="text-sm text-[#6B7280] font-medium">
                  No upcoming meetings
                </p>
                <p className="text-xs text-[#A3A3A3] mt-1">
                  Your schedule is clear this week
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {data.upcomingMeetingsDetails.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => router.push(`/meetings/${meeting.id}`)}
                    className="group p-4 bg-gradient-to-r from-[#FAFAFA] to-transparent rounded-lg hover:from-[#F5F5F5] hover:to-transparent transition-all duration-200 border border-[#E5E5E5] hover:border-[#D4D4D4] cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 bg-[#EFF6FF] rounded">
                            <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
                          </div>
                          <p className="text-sm font-semibold text-[#171717]">
                            {format(new Date(meeting.meetingDate), "EEEE, MMM d")}
                          </p>
                        </div>
                        <p className="text-xs text-[#6B7280] ml-7">
                          {format(new Date(meeting.meetingDate), "h:mm a")}
                          {meeting.durationMinutes && ` • ${meeting.durationMinutes} min`}
                        </p>
                      </div>
                      <Badge
                        className={
                          meeting.meetingType === "CLIENT_MEETING"
                            ? "bg-[#F0FDF4] text-[#16A34A] border-0"
                            : meeting.meetingType === "INTERNAL"
                            ? "bg-[#EFF6FF] text-[#2563EB] border-0"
                            : "bg-[#FFF7ED] text-[#EA580C] border-0"
                        }
                      >
                        {meeting.meetingType.replace("_", " ")}
                      </Badge>
                    </div>

                    {meeting.project && (
                      <div className="flex items-center gap-2 ml-7 mb-2">
                        <Briefcase className="h-3 w-3 text-[#6B7280]" />
                        <p className="text-xs text-[#525252] font-medium">
                          {meeting.project.projectName}
                        </p>
                      </div>
                    )}

                    {meeting.locationPlatform && (
                      <div className="flex items-center gap-2 ml-7">
                        {meeting.locationPlatform.toLowerCase().includes("zoom") ||
                        meeting.locationPlatform.toLowerCase().includes("meet") ||
                        meeting.locationPlatform.toLowerCase().includes("teams") ? (
                          <Video className="h-3 w-3 text-[#6B7280]" />
                        ) : (
                          <MapPin className="h-3 w-3 text-[#6B7280]" />
                        )}
                        <p className="text-xs text-[#6B7280]">
                          {meeting.locationPlatform}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="border-[#E5E5E5] shadow-sm">
        <CardHeader className="border-b border-[#F5F5F5]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#171717]">
                Recent Projects
              </CardTitle>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Latest projects in your pipeline
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/projects")}
              className="text-[#18181B] hover:bg-[#F5F5F5]"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentProjects.map((project) => {
              const config = getStatusConfig(project.status);
              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group relative overflow-hidden rounded-lg border border-[#E5E5E5] bg-white p-4 transition-all duration-200 hover:shadow-lg hover:border-[#18181B] cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      className={`${config.bgColor} ${config.color} border-0`}
                    >
                      {config.label}
                    </Badge>
                    {project.budgetAmount && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#171717]">
                          ${(project.budgetAmount / 1000).toFixed(1)}k
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717] mb-1 line-clamp-1 group-hover:text-[#18181B]">
                      {project.projectName}
                    </h4>
                    <p className="text-xs text-[#A3A3A3] mb-3 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {project.client.companyName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(project.startDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase className="h-16 w-16 text-[#18181B]" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Recent Activities */}
        <Card className="border-[#E5E5E5] shadow-sm">
          <CardHeader className="border-b border-[#F5F5F5]">
            <CardTitle className="text-lg font-semibold text-[#171717]">
              Recent Activities
            </CardTitle>
            <p className="text-xs text-[#A3A3A3] mt-1">Latest updates and changes</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#FAFAFA] to-transparent rounded-lg hover:from-[#F5F5F5] hover:to-transparent transition-colors"
                >
                  <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                    <TrendingUp className="h-3.5 w-3.5 text-[#16A34A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#171717]">
                      <span className="font-semibold">
                        {activity.user.name || activity.user.email}
                      </span>{" "}
                      <span className="text-[#6B7280]">
                        {activity.action} {activity.entityType}
                      </span>
                    </p>
                    <p className="text-xs text-[#A3A3A3] flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show More Button */}
              {data.recentActivities.length > 3 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="w-full border-t border-[#E5E5E5] rounded-none hover:bg-[#FAFAFA] mt-3 pt-3"
                >
                  <span className="text-sm text-[#525252]">
                    {showAllActivities
                      ? "Show Less"
                      : `Show ${data.recentActivities.length - 3} More`}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${
                      showAllActivities ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
