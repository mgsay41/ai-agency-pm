import { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Dashboard - AI Agency PM",
  description: "AI Agency Project Management System Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#18181B] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="flex h-screen overflow-hidden bg-white">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main id="main-content" className="flex-1 overflow-y-auto" role="main">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </>
  );
}
