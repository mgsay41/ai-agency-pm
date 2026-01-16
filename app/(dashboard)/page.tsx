import { PageHeader } from "@/components/ui/page-header";
import { DashboardClient } from "./dashboard-client";
import { getDashboardStats } from "@/lib/services/dashboard.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Fetch session server-side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch initial stats server-side for better performance
  const initialStats = await getDashboardStats();

  return (
    <div className="space-y-8 px-8 py-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session.user.name || "User"}`}
      />

      <DashboardClient
        userName={session.user.name || "User"}
        initialStats={initialStats}
      />
    </div>
  );
}
