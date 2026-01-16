"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamMemberForm } from "./team-member-form";
import { TeamMemberFormData } from "@/lib/validations/team";
import { TeamMember } from "@/hooks/use-team";

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamMemberFormData) => Promise<void>;
  defaultValues?: Partial<TeamMember>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function TeamMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isLoading,
  mode = "create",
}: TeamMemberDialogProps) {
  const handleSubmit = async (data: TeamMemberFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-[#E5E5E5]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#171717]">
            {mode === "create" ? "Add New Team Member" : "Edit Team Member"}
          </DialogTitle>
        </DialogHeader>

        <TeamMemberForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
