"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Shield, Calendar, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProfileInfoCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#171717]">
          Account Information
        </CardTitle>
        <CardDescription className="text-sm text-[#525252]">
          View your account details and status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-[#525252] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
              Full Name
            </p>
            <p className="text-base text-[#171717] font-medium">{user.name}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-[#525252] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
              Email Address
            </p>
            <p className="text-base text-[#171717] font-medium">{user.email}</p>
            {user.emailVerified && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3 text-[#16A34A]" />
                <span className="text-xs text-[#16A34A]">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-[#525252] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
              Phone Number
            </p>
            <p className="text-base text-[#171717] font-medium">
              {user.phone || "Not provided"}
            </p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#525252] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
              Role
            </p>
            <p className="text-base text-[#171717] font-medium capitalize">
              {user.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-[#525252] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
              Member Since
            </p>
            <p className="text-base text-[#171717] font-medium">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Last Login */}
        {user.lastLogin && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#525252] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[#A3A3A3] uppercase tracking-wide mb-1">
                Last Login
              </p>
              <p className="text-base text-[#171717] font-medium">
                {formatDistanceToNow(new Date(user.lastLogin), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="pt-4 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#525252]">Account Status</span>
            <span
              className={`px-2 py-1 text-xs rounded ${
                user.isActive
                  ? "bg-[#F0FDF4] text-[#16A34A]"
                  : "bg-[#FEF2F2] text-[#DC2626]"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
