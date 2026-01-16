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
import { Textarea } from "@/components/ui/textarea";
import {
  teamMemberSchema,
  type TeamMemberFormData,
  SPECIALIZATIONS,
  SKILLS,
  DEPARTMENT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/validations/team";
import { TeamMember } from "@/hooks/use-team";
import { X } from "lucide-react";
import { useState } from "react";

interface TeamMemberFormProps {
  onSubmit: (data: TeamMemberFormData) => Promise<void>;
  defaultValues?: Partial<TeamMember>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function TeamMemberForm({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
}: TeamMemberFormProps) {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    defaultValues?.specialization || []
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    defaultValues?.skills || []
  );

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema) as any,
    defaultValues: {
      full_name: defaultValues?.fullName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      role_title: defaultValues?.roleTitle || "",
      department: defaultValues?.department as any || "DEVELOPMENT",
      specialization: defaultValues?.specialization || [],
      skills: defaultValues?.skills || [],
      hourly_rate: defaultValues?.hourlyRate || undefined,
      currency: defaultValues?.currency || "USD",
      employment_type: defaultValues?.employmentType as any || "FULL_TIME",
      start_date: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      status: defaultValues?.status as any || "ACTIVE",
      avatar_color: defaultValues?.avatarColor || "#18181B",
      bio: defaultValues?.bio || "",
      linkedin_url: defaultValues?.linkedinUrl || "",
      github_url: defaultValues?.githubUrl || "",
    },
  });

  const handleSubmit = async (data: TeamMemberFormData) => {
    const submitData = {
      ...data,
      specialization: selectedSpecializations,
      skills: selectedSkills,
    };
    await onSubmit(submitData);
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#171717]">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              {...form.register("full_name")}
              className="border-[#E5E5E5]"
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="border-[#E5E5E5]"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              className="border-[#E5E5E5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_title">
              Role/Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role_title"
              {...form.register("role_title")}
              className="border-[#E5E5E5]"
            />
            {form.formState.errors.role_title && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.role_title.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => form.setValue("department", value as any)}
              defaultValue={form.getValues("department")}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.department.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type">
              Employment Type <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => form.setValue("employment_type", value as any)}
              defaultValue={form.getValues("employment_type")}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Specialization */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#171717]">Specialization</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleSpecialization(spec)}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                selectedSpecializations.includes(spec)
                  ? "bg-[#18181B] text-white border-[#18181B]"
                  : "bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#FAFAFA]"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#171717]">Skills</h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-[#E5E5E5] rounded">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                selectedSkills.includes(skill)
                  ? "bg-[#18181B] text-white border-[#18181B]"
                  : "bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#FAFAFA]"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[#525252]">Selected:</span>
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#F4F4F5] text-[#171717] rounded"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="hover:text-[#DC2626]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Employment Details */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#171717]">Employment Details</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              {...form.register("hourly_rate", { valueAsNumber: true })}
              className="border-[#E5E5E5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...form.register("currency")}
              maxLength={3}
              className="border-[#E5E5E5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) => form.setValue("status", value as any)}
              defaultValue={form.getValues("status")}
            >
              <SelectTrigger className="border-[#E5E5E5]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            {...form.register("start_date")}
            className="border-[#E5E5E5]"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#171717]">Additional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...form.register("bio")}
            rows={3}
            className="border-[#E5E5E5]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              {...form.register("linkedin_url")}
              className="border-[#E5E5E5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              {...form.register("github_url")}
              className="border-[#E5E5E5]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar_color">Avatar Color</Label>
          <Input
            id="avatar_color"
            type="color"
            {...form.register("avatar_color")}
            className="border-[#E5E5E5] h-10"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-[#E5E5E5]">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-[#E5E5E5]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          {isLoading ? "Saving..." : defaultValues ? "Update Member" : "Create Member"}
        </Button>
      </div>
    </form>
  );
}
