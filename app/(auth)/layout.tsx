import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - AI Agency PM",
  description: "Sign in or create an account to access the AI Agency Project Management System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#171717]">
            AI Agency PM
          </h1>
          <p className="mt-2 text-sm text-[#525252]">
            Project Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
