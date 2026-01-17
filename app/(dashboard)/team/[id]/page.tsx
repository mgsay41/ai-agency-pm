"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberDialog } from "@/components/team/team-member-dialog";
import { useTeam, TeamMember } from "@/hooks/use-team";
import { TeamMemberFormData } from "@/lib/validations/team";
import {
  DEPARTMENT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/validations/team";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Github,
  Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { logger } from "@/lib/logger";

type PageProps = {
  params: Promise<{ id: string }>;
};

interface ProjectAssignment {
  id: string;
  roleInProject: string;
  allocationPercentage: number;
  Project: {
    id: string;
    projectName: string;
    Client?: {
      companyName: string;
    };
  };
}

export default function TeamMemberDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { fetchTeamMember, updateTeamMember, isLoading } = useTeam();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resolvedId, setResolvedId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  const loadMember = async () => {
    if (!resolvedId) return;

    try {
      const data = await fetchTeamMember(resolvedId);
      setMember(data);
    } catch (error) {
      logger.error("Failed to load team member", error, { action: "fetch_team_member_detail" });
      toast({
        title: "Error",
        description: "Failed to load team member details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (resolvedId) {
      loadMember();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedId]);

  const handleUpdate = async (data: TeamMemberFormData) => {
    if (!resolvedId) return;

    try {
      await updateTeamMember(resolvedId, data);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      setIsDialogOpen(false);
      loadMember();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update team member";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading || !member) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#525252]">Loading team member...</div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-[#F0FDF4] text-[#16A34A]",
    ON_LEAVE: "bg-[#FFF7ED] text-[#EA580C]",
    INACTIVE: "bg-[#F4F4F5] text-[#71717A]",
  };

  const initials = member.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/team")}
            className="hover:bg-[#FAFAFA]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#171717]">
              {member.fullName}
            </h1>
            <p className="text-sm text-[#525252] mt-1">{member.roleTitle}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Member Info */}
        <div className="col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium"
                  style={{ backgroundColor: member.avatarColor || "#18181B" }}
                >
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#171717]">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-[#525252]">{member.roleTitle}</p>
                </div>
                <Badge
                  className={`${
                    statusColors[member.status] || "bg-[#F4F4F5] text-[#71717A]"
                  } rounded`}
                >
                  {STATUS_LABELS[member.status] || member.status}
                </Badge>
              </div>

              <div className="mt-6 space-y-3">
                {member.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-[#525252]" />
                    <a
                      href={`mailto:${member.email}`}
                      className="text-[#171717] hover:underline"
                    >
                      {member.email}
                    </a>
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-[#525252]" />
                    <a
                      href={`tel:${member.phone}`}
                      className="text-[#171717] hover:underline"
                    >
                      {member.phone}
                    </a>
                  </div>
                )}

                {member.linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-[#525252]" />
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#171717] hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}

                {member.githubUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <Github className="h-4 w-4 text-[#525252]" />
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#171717] hover:underline"
                    >
                      GitHub
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#171717]">
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-[#525252] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#A3A3A3]">Department</p>
                  <p className="text-sm text-[#171717]">
                    {DEPARTMENT_LABELS[member.department] || member.department}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-[#525252] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#A3A3A3]">Employment Type</p>
                  <p className="text-sm text-[#171717]">
                    {EMPLOYMENT_TYPE_LABELS[member.employmentType] ||
                      member.employmentType}
                  </p>
                </div>
              </div>

              {member.hourlyRate && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-[#525252] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#A3A3A3]">Hourly Rate</p>
                    <p className="text-sm text-[#171717]">
                      {member.currency} {Number(member.hourlyRate).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {member.startDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#525252] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#A3A3A3]">Start Date</p>
                    <p className="text-sm text-[#171717]">
                      {new Date(member.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="col-span-2 space-y-6">
          {/* Bio */}
          {member.bio && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#171717]">
                  Bio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#525252] whitespace-pre-wrap">{member.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Specialization */}
          {member.specialization && member.specialization.length > 0 && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#171717]">
                  Specialization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {member.specialization.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="bg-[#F4F4F5] text-[#171717] rounded"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {member.skills && member.skills.length > 0 && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#171717]">
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-[#EFF6FF] text-[#2563EB] rounded"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Projects */}
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#171717]">
                Assigned Projects ({member._count?.ProjectAssignment || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.ProjectAssignment && member.ProjectAssignment.length > 0 ? (
                <div className="space-y-4">
                  {member.ProjectAssignment.map((assignment: ProjectAssignment) => (
                    <Link
                      key={assignment.id}
                      href={`/projects/${assignment.Project.id}`}
                      className="block p-4 border border-[#E5E5E5] rounded-lg hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#171717]">
                            {assignment.Project.projectName}
                          </h4>
                          <p className="text-sm text-[#525252] mt-1">
                            {assignment.Project.Client?.companyName}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              variant="secondary"
                              className="bg-[#F4F4F5] text-[#525252] text-xs rounded"
                            >
                              {assignment.roleInProject}
                            </Badge>
                            <span className="text-xs text-[#A3A3A3]">
                              {assignment.allocationPercentage}% allocated
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[#525252] text-center py-8">
                  No active project assignments
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <TeamMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleUpdate}
        defaultValues={member}
        isLoading={isLoading}
        mode="edit"
      />
    </div>
  );
}
