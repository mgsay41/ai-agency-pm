import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-semibold text-[#171717]">404</h1>
          <h2 className="text-2xl font-semibold text-[#171717]">
            Page Not Found
          </h2>
          <p className="text-base text-[#525252]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Link href="/">
            <Button
              variant="outline"
              className="border-[#E5E5E5]"
            >
              Go Back
            </Button>
          </Link>
          <Link href="/projects">
            <Button className="bg-[#18181B] hover:bg-[#27272A]">
              View Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
