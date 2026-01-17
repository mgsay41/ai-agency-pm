"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectAssignmentSchema, type ProjectAssignmentInput } from "@/lib/validations/project";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateForInput } from "@/lib/date-utils";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  roleTitle: string | null;
}

interface TeamAssignmentDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamAssignmentDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: TeamAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const form = useForm<ProjectAssignmentInput>({
    resolver: zodResolver(projectAssignmentSchema),
    defaultValues: {
      memberId: "",
      roleInProject: "",
      allocationPercentage: 100,
      startDate: null,
      endDate: null,
      notes: "",
    },
  });

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch("/api/team?status=ACTIVE&limit=100");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.teamMembers) {
            setTeamMembers(data.data.teamMembers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch team members", error);
        toast.error("Failed to load team members");
      } finally {
        setLoadingMembers(false);
      }
    }

    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const handleSubmit = async (data: ProjectAssignmentInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign team member");
      }

      toast.success("Team member assigned successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign team member";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>
            Add a team member to this project with their role and allocation percentage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Team Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="memberId">
              Team Member <span className="text-[#DC2626]">*</span>
            </Label>
            <Select
              value={form.watch("memberId")}
              onValueChange={(value) => form.setValue("memberId", value)}
              disabled={loadingMembers}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex flex-col">
                      <span>{member.fullName}</span>
                      {member.roleTitle && (
                        <span className="text-xs text-[#A3A3A3]">{member.roleTitle}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.memberId && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.memberId.message}
              </p>
            )}
          </div>

          {/* Role in Project */}
          <div className="space-y-2">
            <Label htmlFor="roleInProject">
              Role in Project <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="roleInProject"
              {...form.register("roleInProject")}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="e.g., Lead Developer, Project Manager"
            />
            {form.formState.errors.roleInProject && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.roleInProject.message}
              </p>
            )}
          </div>

          {/* Allocation Percentage */}
          <div className="space-y-2">
            <Label htmlFor="allocationPercentage">
              Allocation Percentage <span className="text-[#DC2626]">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="allocationPercentage"
                type="number"
                min="0"
                max="100"
                step="1"
                {...form.register("allocationPercentage", { valueAsNumber: true })}
                className="border-[#E5E5E5] focus:border-[#18181B]"
                placeholder="100"
              />
              <span className="text-[#525252]">%</span>
            </div>
            <p className="text-xs text-[#A3A3A3]">
              Percentage of time this member will dedicate to the project (0-100%)
            </p>
            {form.formState.errors.allocationPercentage && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.allocationPercentage.message}
              </p>
            )}
          </div>

          {/* Date Range (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value) : null;
                  form.setValue("startDate", dateValue);
                }}
                className="border-[#E5E5E5] focus:border-[#18181B]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value) : null;
                  form.setValue("endDate", dateValue);
                }}
                className="border-[#E5E5E5] focus:border-[#18181B]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="border-[#E5E5E5] focus:border-[#18181B] min-h-[80px]"
              placeholder="Additional notes about this assignment (optional)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#18181B] hover:bg-[#27272A] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Team Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
