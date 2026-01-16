"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { Loader2, Plus } from "lucide-react";
import { QuickClientDialog } from "@/components/clients/quick-client-dialog";
import { logger } from "@/lib/logger";
import { formatDateForInput } from "@/lib/date-utils";

interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<CreateProjectInput>;
  isLoading?: boolean;
}

interface Client {
  id: string;
  companyName: string;
}

export function ProjectForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [showClientDialog, setShowClientDialog] = useState(false);

  // Format dates for the form
  const formattedStartDate = formatDateForInput(defaultValues?.startDate);
  const formattedEndDate = formatDateForInput(defaultValues?.endDate);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: defaultValues?.projectName ?? "",
      projectType: defaultValues?.projectType ?? "AI_AGENT",
      status: defaultValues?.status ?? "PLANNING",
      priority: defaultValues?.priority ?? "MEDIUM",
      description: defaultValues?.description ?? "",
      internalNotes: defaultValues?.internalNotes ?? "",
      currency: defaultValues?.currency ?? "USD",
      progressPercentage: defaultValues?.progressPercentage ?? 0,
      startDate: defaultValues?.startDate ?? new Date(),
      endDate: defaultValues?.endDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clientId: defaultValues?.clientId ?? "",
      budgetAmount: defaultValues?.budgetAmount ?? undefined,
      estimatedHours: defaultValues?.estimatedHours ?? undefined,
    },
  });

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const data = await response.json();
          // API returns { success: true, data: [...], pagination: {...} }
          // The clients array is directly in data, not nested
          if (data.success && Array.isArray(data.data)) {
            setClients(data.data);
          } else {
            setClients([]);
          }
        }
      } catch (error) {
        logger.error("Failed to fetch clients", error, { action: "fetch_clients" });
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  const handleSubmit = async (data: CreateProjectInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      logger.error("Form submission error", error, { action: "submit_project_form" });
    }
  };

  const handleClientCreated = (newClient: { id: string; companyName: string }) => {
    // Add the new client to the list
    setClients((prev) => [...prev, newClient]);
    // Automatically select the newly created client
    form.setValue("clientId", newClient.id);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#171717]">Basic Information</h3>

        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName">
            Project Name <span className="text-[#DC2626]">*</span>
          </Label>
          <Input
            id="projectName"
            {...form.register("projectName")}
            className="border-[#E5E5E5] focus:border-[#18181B]"
            placeholder="Enter project name"
          />
          {form.formState.errors.projectName && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.projectName.message}
            </p>
          )}
        </div>

        {/* Client */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="clientId">
              Client <span className="text-[#DC2626]">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowClientDialog(true)}
              className="border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Client
            </Button>
          </div>
          <Select
            value={form.watch("clientId")}
            onValueChange={(value) => form.setValue("clientId", value)}
            disabled={loadingClients}
          >
            <SelectTrigger className="border-[#E5E5E5]">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.clientId && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.clientId.message}
            </p>
          )}
        </div>

        {/* Project Type */}
        <div className="space-y-2">
          <Label htmlFor="projectType">
            Project Type <span className="text-[#DC2626]">*</span>
          </Label>
          <Select
            value={form.watch("projectType")}
            onValueChange={(value) => form.setValue("projectType", value as any)}
          >
            <SelectTrigger className="border-[#E5E5E5]">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AI_AGENT">AI Agent Development</SelectItem>
              <SelectItem value="AUTOMATION">Automation Solution</SelectItem>
              <SelectItem value="SAAS">SaaS Product</SelectItem>
              <SelectItem value="CONSULTING">Consulting</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.projectType && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.projectType.message}
            </p>
          )}
        </div>

        {/* Status and Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-[#DC2626]">*</span>
            </Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as any)}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-[#DC2626]">*</span>
            </Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value as any)}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            className="border-[#E5E5E5] focus:border-[#18181B] min-h-[100px]"
            placeholder="Enter project description"
          />
        </div>

        {/* Internal Notes */}
        <div className="space-y-2">
          <Label htmlFor="internalNotes">Internal Notes</Label>
          <Textarea
            id="internalNotes"
            {...form.register("internalNotes")}
            className="border-[#E5E5E5] focus:border-[#18181B] min-h-[80px]"
            placeholder="Internal notes (private to team)"
          />
        </div>
      </div>

      {/* Timeline & Budget Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#171717]">Timeline & Budget</h3>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Start Date <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              defaultValue={formattedStartDate}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : new Date();
                form.setValue("startDate", dateValue);
              }}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="dd/mm/yyyy"
            />
            {form.formState.errors.startDate && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">
              End Date <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              defaultValue={formattedEndDate}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : new Date();
                form.setValue("endDate", dateValue);
              }}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="dd/mm/yyyy"
            />
            {form.formState.errors.endDate && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Budget and Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Budget Amount</Label>
            <Input
              id="budgetAmount"
              type="number"
              step="0.01"
              {...form.register("budgetAmount", { valueAsNumber: true })}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="0.00"
            />
            {form.formState.errors.budgetAmount && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.budgetAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              step="0.5"
              {...form.register("estimatedHours", { valueAsNumber: true })}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="0"
            />
            {form.formState.errors.estimatedHours && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.estimatedHours.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
              Saving...
            </>
          ) : (
            "Save Project"
          )}
        </Button>
      </div>

      {/* Quick Client Dialog */}
      <QuickClientDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onClientCreated={handleClientCreated}
      />
    </form>
  );
}
