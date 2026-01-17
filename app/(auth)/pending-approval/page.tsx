"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Poll for approval status every 30 seconds
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await fetch("/api/auth/check-status");
        const data = await response.json();

        if (data.isPending === false) {
          // User has been approved, redirect to home/dashboard
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to check approval status:", error);
      }
    };

    const interval = setInterval(checkApprovalStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#18181B] mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#171717] mb-2">
            AI Agency PM
          </h1>
          <p className="text-sm text-[#525252]">
            Project Management System
          </p>
        </div>

        <Card className="border-[#E5E5E5] shadow-sm">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF7ED] mb-2">
                <Clock className="w-8 h-8 text-[#EA580C]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-[#171717] text-center">
              Account Pending Approval
            </CardTitle>
            <CardDescription className="text-[#525252] text-center">
              Your account has been created successfully and is waiting for administrator approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-[#171717]">What happens next?</h3>
              <ul className="space-y-2 text-sm text-[#525252]">
                <li className="flex items-start gap-2">
                  <span className="text-[#EA580C] mt-0.5">•</span>
                  <span>An administrator will review your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA580C] mt-0.5">•</span>
                  <span>You'll be assigned to a team and projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA580C] mt-0.5">•</span>
                  <span>You'll receive access to the dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA580C] mt-0.5">•</span>
                  <span>This page will automatically refresh when approved</span>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-[#A3A3A3]">
                If you have any questions, please contact your administrator.
              </p>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-[#E5E5E5] hover:bg-[#FAFAFA]"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
