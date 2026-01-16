"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#171717]">
            Something went wrong
          </h1>
          <p className="text-base text-[#525252]">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {error.message && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4">
            <p className="text-sm text-[#DC2626] font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="border-[#E5E5E5]"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-[#18181B] hover:bg-[#27272A]"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
