"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ defaultValues, onSubmit, isLoading }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
  });

  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#171717]">
          Personal Information
        </CardTitle>
        <CardDescription className="text-sm text-[#525252]">
          Update your profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#171717]">
              Full Name <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="border-[#E5E5E5]"
              placeholder="John Doe"
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#171717]">
              Email Address <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="border-[#E5E5E5]"
              placeholder="john.doe@example.com"
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#171717]">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              className="border-[#E5E5E5]"
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-[#DC2626]">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
              className="border-[#E5E5E5]"
            >
              Reset
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
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
