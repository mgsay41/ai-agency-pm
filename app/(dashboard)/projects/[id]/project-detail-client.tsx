"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { MeetingsGrid } from "@/components/meetings/meetings-grid";
import { MeetingDialog } from "@/components/meetings/meeting-dialog";
import { ArrowLeft, Pencil, Calendar, DollarSign, Users, FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMeetings } from "@/hooks/use-meetings";
import type { Project } from "@/hooks/use-projects";
import type { CreateProjectInput } from "@/lib/validations/project";

const statusColors: Record<string, string> = {
  PLANNING: "bg-[#EFF6FF] text-[#2563EB]",
  ACTIVE: "bg-[#F0FDF4] text-[#16A34A]",
  ON_HOLD: "bg-[#FFF7ED] text-[#EA580C]",
  COMPLETED: "bg-[#FAFAFA] text-[#525252]",
  ARCHIVED: "bg-[#F5F5F5] text-[#737373]",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-[#FEF2F2] text-[#DC2626]",
  MEDIUM: "bg-[#FFF7ED] text-[#EA580C]",
  LOW: "bg-[#F0FDF4] text-[#16A34A]",
};

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  const { meetings, isLoading: meetingsLoading, fetchMeetings, deleteMeeting } =
    useMeetings({ projectId: project.id });

  useEffect(() => {
    fetchMeetings();
  }, [project.id]);

  const handleUpdateProject = async (data: CreateProjectInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      toast.success("Project updated successfully");
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="mb-4 -ml-4 text-[#525252] hover:text-[#171717] hover:bg-[#FAFAFA]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-[#171717]">
                {project.project_name}
              </h1>
              <Badge
                className={`${statusColors[project.status] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
              >
                {project.status.replace("_", " ")}
              </Badge>
              <Badge
                className={`${priorityColors[project.priority] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
              >
                {project.priority}
              </Badge>
            </div>
            <p className="text-sm text-[#A3A3A3]">{project.project_code}</p>
          </div>

          <Button
            onClick={() => setIsEditDialogOpen(true)}
            className="bg-[#18181B] hover:bg-[#27272A] text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#FAFAFA]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline Card */}
            <Card className="border-[#E5E5E5]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#525252] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A3A3A3]">Start Date</p>
                    <p className="text-sm font-medium text-[#171717]">
                      {format(new Date(project.start_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A3A3A3]">End Date</p>
                    <p className="text-sm font-medium text-[#171717]">
                      {format(new Date(project.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Card */}
            <Card className="border-[#E5E5E5]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#525252] flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A3A3A3]">Amount</p>
                    <p className="text-sm font-medium text-[#171717]">
                      {project.budget_amount
                        ? `${project.budget_currency || "USD"} ${project.budget_amount.toLocaleString()}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card className="border-[#E5E5E5]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#525252] flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-[#171717]">
                  {project.assignments?.length || 0} assigned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {project.description && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#525252] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#171717] whitespace-pre-wrap">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Details */}
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-[#A3A3A3]">Project Type</dt>
                  <dd className="text-sm font-medium text-[#171717] mt-1">
                    {project.project_type.replace("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3]">Created</dt>
                  <dd className="text-sm font-medium text-[#171717] mt-1">
                    {format(new Date(project.created_at), "MMM d, yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3]">Last Updated</dt>
                  <dd className="text-sm font-medium text-[#171717] mt-1">
                    {format(new Date(project.updated_at), "MMM d, yyyy")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Tab */}
        <TabsContent value="client">
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.client ? (
                <div>
                  <p className="text-lg font-semibold text-[#171717]">
                    {project.client.company_name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#A3A3A3]">No client assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.assignments && project.assignments.length > 0 ? (
                <div className="space-y-4">
                  {project.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#18181B] text-white flex items-center justify-center text-sm font-medium">
                          {assignment.member.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#171717]">
                            {assignment.member.full_name}
                          </p>
                          <p className="text-xs text-[#A3A3A3]">
                            {assignment.role_in_project}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-[#525252]">
                        {assignment.allocation_percentage}% allocated
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#A3A3A3]">No team members assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#171717]">Project Meetings</h3>
              <p className="text-sm text-[#525252] mt-1">
                View and manage all meetings for this project
              </p>
            </div>
            <Button
              onClick={() => setIsMeetingDialogOpen(true)}
              className="bg-[#18181B] hover:bg-[#27272A]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Meeting
            </Button>
          </div>

          <MeetingsGrid
            meetings={meetings}
            onEdit={(id) => {
              setIsMeetingDialogOpen(true);
            }}
            onDelete={deleteMeeting}
            onView={(id) => router.push(`/meetings/${id}`)}
            isLoading={meetingsLoading}
          />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#525252]">
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.internal_notes ? (
                <p className="text-sm text-[#171717] whitespace-pre-wrap">
                  {project.internal_notes}
                </p>
              ) : (
                <p className="text-sm text-[#A3A3A3]">No internal notes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Dialog */}
      <MeetingDialog
        projectId={project.id}
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        onSuccess={fetchMeetings}
      />

      {/* Edit Dialog */}
      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProject}
        project={project}
        isLoading={isLoading}
      />
    </div>
  );
}
