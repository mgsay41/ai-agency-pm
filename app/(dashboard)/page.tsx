import { PageHeader } from "@/components/ui/page-header";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SalesDashboard } from "@/components/dashboard/SalesDashboard";
import { TeamDashboard } from "@/components/dashboard/TeamDashboard";
import { getAdminDashboardData } from "@/lib/dashboard/admin-dashboard";
import { getSalesDashboardData } from "@/lib/dashboard/sales-dashboard";
import { getTeamDashboardData } from "@/lib/dashboard/team-dashboard";
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

  // Get user role (default to TEAM_MEMBER if not set)
  const userRole = session.user.role || "TEAM_MEMBER";

  // Fetch role-specific dashboard data
  let dashboardData;
  let DashboardComponent;

  switch (userRole) {
    case "ADMIN":
      dashboardData = await getAdminDashboardData();
      DashboardComponent = AdminDashboard;
      break;
    case "SALES":
      dashboardData = await getSalesDashboardData(session.user.id);
      DashboardComponent = SalesDashboard;
      break;
    case "TEAM_MEMBER":
    default:
      dashboardData = await getTeamDashboardData(session.user.id);
      DashboardComponent = TeamDashboard;
      break;
  }

  return (
    <div className="space-y-8 px-8 py-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session.user.name || "User"}`}
      />

      <DashboardComponent data={dashboardData} />
    </div>
  );
}
