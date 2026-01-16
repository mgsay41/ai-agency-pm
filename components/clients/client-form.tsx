"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { Loader2, X } from "lucide-react";
import { logger } from "@/lib/logger";

interface ClientFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<ClientFormData>;
  isLoading?: boolean;
}

// Helper function to format Date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export function ClientForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: ClientFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    defaultValues?.tags || []
  );
  const [tagInput, setTagInput] = useState("");
  const [preferredComm, setPreferredComm] = useState<string[]>(
    defaultValues?.preferredCommunication || []
  );

  const formattedClientSince = formatDateForInput(defaultValues?.clientSince);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      clientType: defaultValues?.clientType || "COMPANY",
      companyName: defaultValues?.companyName || "",
      industry: defaultValues?.industry || "",
      companySize: defaultValues?.companySize || undefined,
      website: defaultValues?.website || "",
      billingAddress: defaultValues?.billingAddress || "",
      timeZone: defaultValues?.timeZone || "",
      preferredCommunication: defaultValues?.preferredCommunication || [],
      tags: defaultValues?.tags || [],
      notes: defaultValues?.notes || "",
      isActive: defaultValues?.isActive ?? true,
      clientSince: defaultValues?.clientSince || new Date(),
    },
  });

  const handleSubmit = async (data: ClientFormData) => {
    try {
      // Include tags and preferredCommunication from state
      const submitData = {
        ...data,
        tags: selectedTags,
        preferredCommunication: preferredComm,
      };
      await onSubmit(submitData);
    } catch (error) {
      logger.error("Client form submission error", error, { action: "submit_client_form" });
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const togglePreferredComm = (value: string) => {
    const newComm = preferredComm.includes(value)
      ? preferredComm.filter((c) => c !== value)
      : [...preferredComm, value];
    setPreferredComm(newComm);
    form.setValue("preferredCommunication", newComm as any);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#171717]">Basic Information</h3>

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
          {form.formState.errors.clientType && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.clientType.message}
            </p>
          )}
        </div>

        {/* Company/Individual Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            {form.watch("clientType") === "INDIVIDUAL"
              ? "Individual Name"
              : "Company Name"}{" "}
            <span className="text-[#DC2626]">*</span>
          </Label>
          <Input
            id="companyName"
            {...form.register("companyName")}
            className="border-[#E5E5E5] focus:border-[#18181B]"
            placeholder={
              form.watch("clientType") === "INDIVIDUAL"
                ? "Enter individual name"
                : "Enter company name"
            }
          />
          {form.formState.errors.companyName && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        {/* Industry and Company Size Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              {...form.register("industry")}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="e.g., Technology, Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Select
              value={form.watch("companySize") || ""}
              onValueChange={(value) =>
                form.setValue("companySize", value as any)
              }
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

        {/* Client Since */}
        <div className="space-y-2">
          <Label htmlFor="clientSince">Client Since</Label>
          <Input
            id="clientSince"
            type="date"
            defaultValue={formattedClientSince}
            onChange={(e) => {
              const dateValue = e.target.value
                ? new Date(e.target.value)
                : new Date();
              form.setValue("clientSince", dateValue);
            }}
            className="border-[#E5E5E5] focus:border-[#18181B]"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) =>
              form.setValue("isActive", checked as boolean)
            }
          />
          <Label
            htmlFor="isActive"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active client
          </Label>
        </div>
      </div>

      {/* Contact & Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#171717]">
          Contact & Location
        </h3>

        {/* Preferred Communication */}
        <div className="space-y-2">
          <Label>Preferred Communication Channels</Label>
          <div className="grid grid-cols-2 gap-3">
            {["EMAIL", "PHONE", "SLACK", "TEAMS", "WHATSAPP"].map((channel) => (
              <div key={channel} className="flex items-center space-x-2">
                <Checkbox
                  id={`comm-${channel}`}
                  checked={preferredComm.includes(channel)}
                  onCheckedChange={() => togglePreferredComm(channel)}
                />
                <Label
                  htmlFor={`comm-${channel}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {channel.charAt(0) + channel.slice(1).toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Zone */}
        <div className="space-y-2">
          <Label htmlFor="timeZone">Time Zone</Label>
          <Input
            id="timeZone"
            {...form.register("timeZone")}
            className="border-[#E5E5E5] focus:border-[#18181B]"
            placeholder="e.g., America/New_York, Europe/London"
          />
        </div>

        {/* Billing Address */}
        <div className="space-y-2">
          <Label htmlFor="billingAddress">Billing Address</Label>
          <Textarea
            id="billingAddress"
            {...form.register("billingAddress")}
            className="border-[#E5E5E5] focus:border-[#18181B] min-h-[80px]"
            placeholder="Enter billing address"
          />
        </div>
      </div>

      {/* Tags & Notes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#171717]">Tags & Notes</h3>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="border-[#E5E5E5] focus:border-[#18181B]"
              placeholder="Type tag and press Enter"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
            >
              Add
            </Button>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-[#A3A3A3] hover:text-[#171717]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            className="border-[#E5E5E5] focus:border-[#18181B] min-h-[100px]"
            placeholder="Additional notes about the client"
          />
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
            "Save Client"
          )}
        </Button>
      </div>
    </form>
  );
}
