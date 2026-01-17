"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingUser } from "./PendingUsersTable";

const approvalSchema = z.object({
  role: z.enum(["ADMIN", "TEAM_MEMBER", "SALES"]),
  createTeamMember: z.boolean(),
  fullName: z.string().optional(),
  roleTitle: z.string().optional(),
  department: z
    .enum([
      "DEVELOPMENT",
      "DESIGN",
      "QA",
      "DEVOPS",
      "MANAGEMENT",
      "CONSULTING",
      "OTHER",
    ])
    .optional(),
  hourlyRate: z.number().optional(),
  projectIds: z.array(z.string()).optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApproveUserDialogProps {
  user: PendingUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, data: ApprovalFormData) => Promise<void>;
  projects: Array<{ id: string; projectName: string }>;
}

export function ApproveUserDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
  projects,
}: ApproveUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [createTeamMember, setCreateTeamMember] = useState(true);

  const form = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      role: "TEAM_MEMBER",
      createTeamMember: true,
      fullName: user?.name || "",
      roleTitle: "",
      department: "DEVELOPMENT",
      projectIds: [],
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        role: "TEAM_MEMBER",
        createTeamMember: true,
        fullName: user.name,
        roleTitle: "",
        department: "DEVELOPMENT",
        projectIds: [],
      });
      setSelectedProjects([]);
      setCreateTeamMember(true);
    }
  }, [user, form]);

  const handleSubmit = async (data: ApprovalFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const submitData = {
        role: data.role,
        projectIds: selectedProjects,
        ...(createTeamMember && {
          teamInfo: {
            fullName: data.fullName || user.name,
            roleTitle: data.roleTitle || "Team Member",
            department: data.department || "DEVELOPMENT",
            hourlyRate: data.hourlyRate,
          },
        }),
      };

      await onSubmit(user.id, submitData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to approve user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#E5E5E5]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#171717]">
            Approve User: {user.name}
          </DialogTitle>
          <DialogDescription className="text-[#525252]">
            Set the user's role and optionally create a team member profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#171717]">
              User Role
            </Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) =>
                form.setValue("role", value as "ADMIN" | "TEAM_MEMBER" | "SALES")
              }
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Team Member */}
          <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
            <Checkbox
              id="createTeamMember"
              checked={createTeamMember}
              onCheckedChange={(checked) =>
                setCreateTeamMember(checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="createTeamMember"
                className="text-[#171717] cursor-pointer"
              >
                Create Team Member Profile
              </Label>
              <p className="text-xs text-[#525252]">
                This allows the user to be assigned to projects and tracked as a
                team resource.
              </p>
            </div>
          </div>

          {/* Team Member Details */}
          {createTeamMember && (
            <div className="space-y-4 p-4 border border-[#E5E5E5] rounded-lg">
              <h3 className="text-sm font-medium text-[#171717]">
                Team Member Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[#171717]">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    className="border-[#E5E5E5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleTitle" className="text-[#171717]">
                    Role Title
                  </Label>
                  <Input
                    id="roleTitle"
                    {...form.register("roleTitle")}
                    placeholder="e.g., Senior Developer"
                    className="border-[#E5E5E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[#171717]">
                    Department
                  </Label>
                  <Select
                    value={form.watch("department")}
                    onValueChange={(value) =>
                      form.setValue(
                        "department",
                        value as
                          | "DEVELOPMENT"
                          | "DESIGN"
                          | "QA"
                          | "DEVOPS"
                          | "MANAGEMENT"
                          | "CONSULTING"
                          | "OTHER"
                      )
                    }
                  >
                    <SelectTrigger className="border-[#E5E5E5]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEVELOPMENT">Development</SelectItem>
                      <SelectItem value="DESIGN">Design</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="DEVOPS">DevOps</SelectItem>
                      <SelectItem value="MANAGEMENT">Management</SelectItem>
                      <SelectItem value="CONSULTING">Consulting</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-[#171717]">
                    Hourly Rate (Optional)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    {...form.register("hourlyRate", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="border-[#E5E5E5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Project Assignment */}
          {createTeamMember && projects.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[#171717]">
                Assign to Projects (Optional)
              </Label>
              <div className="border border-[#E5E5E5] rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <Label
                      htmlFor={`project-${project.id}`}
                      className="text-sm text-[#171717] cursor-pointer"
                    >
                      {project.projectName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-[#E5E5E5]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white"
            >
              {isLoading ? "Approving..." : "Approve User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
