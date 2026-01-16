"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { useProfile } from "@/hooks/use-profile";
import { ProfileFormData } from "@/lib/validations/profile";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#525252]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#525252]">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#171717] mb-2">Profile</h1>
        <p className="text-base text-[#525252]">
          Manage your account information and preferences
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Edit Form */}
        <div>
          <ProfileForm
            defaultValues={{
              name: user.name,
              email: user.email,
              phone: user.phone || "",
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>

        {/* Right Column - Read-only Info */}
        <div>
          <ProfileInfoCard user={user} />
        </div>
      </div>
    </div>
  );
}
