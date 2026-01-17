"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { clientContactSchema, type ClientContactFormData } from "@/lib/validations/client";

interface ContactFormProps {
  onSubmit: (data: Omit<ClientContactFormData, "clientId">) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<Omit<ClientContactFormData, "clientId">>;
  isLoading?: boolean;
}

export function ContactForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: ContactFormProps) {
  const form = useForm<Omit<ClientContactFormData, "clientId">>({
    resolver: zodResolver(clientContactSchema.omit({ clientId: true })),
    defaultValues: defaultValues || {
      isPrimary: false,
      contactName: "",
      jobTitle: "",
      email: "",
      phone: "",
      mobile: "",
      linkedinUrl: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: Omit<ClientContactFormData, "clientId">) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Primary Contact Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrimary"
          checked={form.watch("isPrimary")}
          onCheckedChange={(checked) => form.setValue("isPrimary", checked as boolean)}
        />
        <Label
          htmlFor="isPrimary"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as primary contact
        </Label>
      </div>

      {/* Contact Name */}
      <div className="space-y-2">
        <Label htmlFor="contactName">
          Contact Name <span className="text-[#DC2626]">*</span>
        </Label>
        <Input
          id="contactName"
          {...form.register("contactName")}
          className="border-[#E5E5E5]"
          placeholder="John Doe"
        />
        {form.formState.errors.contactName && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.contactName.message}
          </p>
        )}
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          {...form.register("jobTitle")}
          className="border-[#E5E5E5]"
          placeholder="CEO, CTO, Project Manager, etc."
        />
        {form.formState.errors.jobTitle && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.jobTitle.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-[#DC2626]">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          className="border-[#E5E5E5]"
          placeholder="john.doe@example.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Phone and Mobile */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register("phone")}
            className="border-[#E5E5E5]"
            placeholder="+1 (555) 123-4567"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            type="tel"
            {...form.register("mobile")}
            className="border-[#E5E5E5]"
            placeholder="+1 (555) 987-6543"
          />
          {form.formState.errors.mobile && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.mobile.message}
            </p>
          )}
        </div>
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
        <Input
          id="linkedinUrl"
          type="url"
          {...form.register("linkedinUrl")}
          className="border-[#E5E5E5]"
          placeholder="https://linkedin.com/in/johndoe"
        />
        {form.formState.errors.linkedinUrl && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.linkedinUrl.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          className="border-[#E5E5E5] min-h-[100px]"
          placeholder="Any additional information about this contact..."
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
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
          {isLoading ? "Saving..." : "Save Contact"}
        </Button>
      </div>
    </form>
  );
}
