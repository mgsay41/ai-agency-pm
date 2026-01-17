"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-[#FEF2F2] text-[#DC2626]";
    case "MEDIUM":
      return "bg-[#FFF7ED] text-[#EA580C]";
    case "LOW":
      return "bg-[#F4F4F5] text-[#71717A]";
    default:
      return "bg-[#F4F4F5] text-[#71717A]";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-[#F0FDF4] text-[#16A34A]";
    case "PLANNING":
      return "bg-[#EFF6FF] text-[#2563EB]";
    case "ON_HOLD":
      return "bg-[#FFF7ED] text-[#EA580C]";
    default:
      return "bg-[#F4F4F5] text-[#71717A]";
  }
};

export function UpcomingDeadlines() {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#525252]">Loading deadlines...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.upcomingDeadlines.length === 0) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-[#D4D4D4] mb-3" />
            <p className="text-sm text-[#525252]">No upcoming deadlines</p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Projects ending in the next 7 days will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5] rounded-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#171717] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
          <span className="text-xs text-[#A3A3A3]">
            Next 7 days
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.upcomingDeadlines.map((project, index) => {
          const daysUntilDeadline = Math.ceil(
            (new Date(project.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const isUrgent = daysUntilDeadline <= 2;

          return (
            <div key={project.id} className="group">
              <Link
                href={`/projects/${project.id}`}
                className="block p-4 hover:bg-[#FAFAFA] rounded-lg transition-all duration-150 border border-[#E5E5E5] hover:border-[#D4D4D4]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {isUrgent && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FEF2F2]">
                          <AlertCircle className="h-3.5 w-3.5 text-[#DC2626] flex-shrink-0" />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm text-[#171717] truncate group-hover:text-[#18181B]">
                        {project.projectName}
                      </h4>
                    </div>
                    <p className="text-xs text-[#525252] mb-3">
                      {project.clientName}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`text-xs rounded-md px-2 py-0.5 font-medium ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </Badge>
                      <Badge
                        className={`text-xs rounded-md px-2 py-0.5 font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`px-3 py-2 rounded-lg ${
                      isUrgent ? 'bg-[#FEF2F2]' : 'bg-[#F4F4F5]'
                    }`}>
                      <p
                        className={`text-sm font-semibold ${
                          isUrgent ? "text-[#DC2626]" : "text-[#171717]"
                        }`}
                      >
                        {format(new Date(project.endDate), "MMM d")}
                      </p>
                      <p
                        className={`text-xs ${
                          isUrgent ? "text-[#DC2626]" : "text-[#A3A3A3]"
                        }`}
                      >
                        {daysUntilDeadline === 0
                          ? "Today"
                          : daysUntilDeadline === 1
                          ? "Tomorrow"
                          : `${daysUntilDeadline} days`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
