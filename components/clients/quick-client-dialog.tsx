"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClientSchema, type CreateClientInput } from "@/lib/validations/client";
import { Loader2 } from "lucide-react";

interface QuickClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: { id: string; companyName: string }) => void;
}

export function QuickClientDialog({
  open,
  onOpenChange,
  onClientCreated,
}: QuickClientDialogProps) {
  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema) as any,
    defaultValues: {
      clientType: "COMPANY",
      isActive: true,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (data: CreateClientInput) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const result = await response.json();

      // Notify parent component with the new client
      onClientCreated({
        id: result.data.id,
        companyName: result.data.companyName,
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create client:", error);
      // You could add toast notification here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] shrink-0">
          <DialogTitle className="text-2xl font-semibold text-[#171717]">
            Add New Client
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4 scrollbar-thin">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="companyName"
                {...form.register("companyName")}
                className="border-[#E5E5E5] focus:border-[#18181B]"
                placeholder="Enter company name"
              />
              {form.formState.errors.companyName && (
                <p className="text-sm text-[#DC2626]">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>

            {/* Client Type */}
            <div className="space-y-2">
              <Label htmlFor="clientType">
                Client Type <span className="text-[#DC2626]">*</span>
              </Label>
              <Select
                value={form.watch("clientType")}
                onValueChange={(value) => form.setValue("clientType", value as any)}
              >
                <SelectTrigger className="border-[#E5E5E5]">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="NONPROFIT">Non-Profit</SelectItem>
                  <SelectItem value="GOVERNMENT">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                {...form.register("industry")}
                className="border-[#E5E5E5] focus:border-[#18181B]"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...form.register("website")}
                className="border-[#E5E5E5] focus:border-[#18181B]"
                placeholder="https://example.com"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-[#DC2626]">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
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
                    Creating...
                  </>
                ) : (
                  "Create Client"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
