"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "./project-form";
import type { CreateProjectInput } from "@/lib/validations/project";
import type { Project } from "@/hooks/use-projects";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  project?: Project | null;
  isLoading?: boolean;
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
  isLoading,
}: ProjectDialogProps) {
  const isEditing = !!project;

  const defaultValues: Partial<CreateProjectInput> | undefined = project
    ? {
        projectName: project.project_name,
        projectType: project.project_type as any,
        status: project.status as any,
        priority: project.priority as any,
        description: project.description || "",
        internalNotes: project.internal_notes || "",
        startDate: new Date(project.start_date),
        endDate: new Date(project.end_date),
        budgetAmount: project.budget_amount || undefined,
        currency: project.budget_currency || "USD",
        clientId: project.client_id,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] shrink-0">
          <DialogTitle className="text-2xl font-semibold text-[#171717]">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4 scrollbar-thin scrollbar-thumb-[#E5E5E5] scrollbar-track-transparent hover:scrollbar-thumb-[#D4D4D4]">
          <ProjectForm
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            defaultValues={defaultValues}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
