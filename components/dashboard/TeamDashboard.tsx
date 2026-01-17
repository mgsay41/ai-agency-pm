"use client";

import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckSquare,
  Calendar,
  AlertCircle,
  MapPin,
  Video,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamDashboardData } from "@/lib/dashboard/team-dashboard";
import { format } from "date-fns";

interface TeamDashboardProps {
  data: TeamDashboardData;
}

export function TeamDashboard({ data }: TeamDashboardProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Projects"
          value={data.assignedProjects}
          subtitle={`${data.activeProjects} active`}
          icon={Briefcase}
        />
        <StatsCard
          title="Assigned Actions"
          value={data.assignedActions}
          subtitle={`${data.pendingActions} pending`}
          icon={CheckSquare}
        />
        <StatsCard
          title="Upcoming Meetings"
          value={data.upcomingMeetings}
          subtitle="Next 30 days"
          icon={Calendar}
        />
        <StatsCard
          title="Actions Status"
          value={data.actionsByStatus.reduce((sum, item) => sum + item.count, 0)}
          subtitle="Total actions"
          icon={AlertCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Projects */}
        <Card className="border-[#E5E5E5]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#171717]">
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.myProjects.length === 0 ? (
                <p className="text-sm text-[#A3A3A3] text-center py-4">
                  No assigned projects
                </p>
              ) : (
                data.myProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between p-3 bg-[#FAFAFA] rounded hover:bg-[#F5F5F5] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#171717] truncate">
                        {project.projectName}
                      </p>
                      <p className="text-xs text-[#A3A3A3] truncate">
                        Client: {project.Client.companyName}
                      </p>
                      {project.progressPercentage !== null && (
                        <p className="text-xs text-[#16A34A] mt-1">
                          {project.progressPercentage}% complete
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-3 gap-1">
                      <Badge
                        className={
                          project.status === "ACTIVE"
                            ? "bg-[#F0FDF4] text-[#16A34A]"
                            : "bg-[#FAFAFA] text-[#525252]"
                        }
                      >
                        {project.status}
                      </Badge>
                      <Badge
                        className={
                          project.priority === "HIGH"
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : project.priority === "MEDIUM"
                            ? "bg-[#FFF7ED] text-[#EA580C]"
                            : "bg-[#FAFAFA] text-[#525252]"
                        }
                      >
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions by Status */}
        <Card className="border-[#E5E5E5]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#171717]">
              Actions by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.actionsByStatus.length === 0 ? (
                <p className="text-sm text-[#A3A3A3] text-center py-4">
                  No assigned actions
                </p>
              ) : (
                data.actionsByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded"
                  >
                    <span className="text-sm text-[#525252]">
                      {item.status}
                    </span>
                    <Badge
                      className={
                        item.status === "COMPLETED"
                          ? "bg-[#F0FDF4] text-[#16A34A]"
                          : item.status === "IN_PROGRESS"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#FAFAFA] text-[#525252]"
                      }
                    >
                      {item.count}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Actions */}
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#171717]">
            My Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.myActions.length === 0 ? (
              <p className="text-sm text-[#A3A3A3] text-center py-4">
                No assigned actions
              </p>
            ) : (
              data.myActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between p-3 bg-[#FAFAFA] rounded hover:bg-[#F5F5F5] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#171717] line-clamp-2">
                      {action.description}
                    </p>
                    <p className="text-xs text-[#A3A3A3] truncate mt-1">
                      {action.Project.projectName}
                    </p>
                    {action.dueDate && (
                      <p className="text-xs text-[#525252] mt-1">
                        Due: {format(new Date(action.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      action.status === "COMPLETED"
                        ? "bg-[#F0FDF4] text-[#16A34A]"
                        : action.status === "IN_PROGRESS"
                        ? "bg-[#EFF6FF] text-[#2563EB]"
                        : "bg-[#FAFAFA] text-[#525252]"
                    }
                  >
                    {action.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#171717]">
              Upcoming Meetings
            </CardTitle>
            <Badge className="bg-[#EFF6FF] text-[#2563EB]">
              {data.upcomingMeetingsList.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data.upcomingMeetingsList.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-sm text-[#A3A3A3]">No upcoming meetings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingMeetingsList.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => router.push(`/meetings/${meeting.id}`)}
                  className="p-3 bg-[#FAFAFA] rounded hover:bg-[#F5F5F5] transition-colors border border-[#E5E5E5] cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[#2563EB]" />
                        <p className="text-sm font-medium text-[#171717]">
                          {format(new Date(meeting.meetingDate), "EEEE, MMM d")}
                        </p>
                      </div>
                      <p className="text-xs text-[#A3A3A3] ml-6">
                        {format(new Date(meeting.meetingDate), "h:mm a")}
                        {meeting.durationMinutes && ` • ${meeting.durationMinutes} min`}
                      </p>
                    </div>
                    <Badge
                      className={
                        meeting.meetingType === "CLIENT_MEETING"
                          ? "bg-[#F0FDF4] text-[#16A34A]"
                          : meeting.meetingType === "INTERNAL"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#FFF7ED] text-[#EA580C]"
                      }
                    >
                      {meeting.meetingType.replace("_", " ")}
                    </Badge>
                  </div>

                  {meeting.project && (
                    <div className="flex items-center gap-2 ml-6 mb-2">
                      <Briefcase className="h-3 w-3 text-[#A3A3A3]" />
                      <p className="text-xs text-[#525252]">
                        {meeting.project.projectName}
                      </p>
                    </div>
                  )}

                  {meeting.locationPlatform && (
                    <div className="flex items-center gap-2 ml-6 mb-2">
                      {meeting.locationPlatform.toLowerCase().includes("zoom") ||
                      meeting.locationPlatform.toLowerCase().includes("meet") ||
                      meeting.locationPlatform.toLowerCase().includes("teams") ? (
                        <Video className="h-3 w-3 text-[#A3A3A3]" />
                      ) : (
                        <MapPin className="h-3 w-3 text-[#A3A3A3]" />
                      )}
                      <p className="text-xs text-[#525252]">
                        {meeting.locationPlatform}
                      </p>
                    </div>
                  )}

                  {meeting.agenda && (
                    <p className="text-xs text-[#A3A3A3] ml-6 line-clamp-2">
                      {meeting.agenda}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
