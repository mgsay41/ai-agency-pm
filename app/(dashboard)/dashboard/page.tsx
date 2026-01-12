import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-[#171717] mb-6">Dashboard</h1>

      <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#171717] mb-4">
          Welcome, {session.user.name}!
        </h2>

        <div className="space-y-2">
          <p className="text-sm text-[#525252]">
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
          <p className="text-sm text-[#525252]">
            <span className="font-medium">Role:</span> {session.user.role}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-[#171717] mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#E5E5E5] rounded-lg p-6 hover:bg-[#FAFAFA] transition-colors">
            <h3 className="font-semibold text-[#171717] mb-2">Projects</h3>
            <p className="text-sm text-[#525252]">
              View and manage your projects
            </p>
          </div>

          <div className="border border-[#E5E5E5] rounded-lg p-6 hover:bg-[#FAFAFA] transition-colors">
            <h3 className="font-semibold text-[#171717] mb-2">Clients</h3>
            <p className="text-sm text-[#525252]">
              Manage client relationships
            </p>
          </div>

          <div className="border border-[#E5E5E5] rounded-lg p-6 hover:bg-[#FAFAFA] transition-colors">
            <h3 className="font-semibold text-[#171717] mb-2">Team</h3>
            <p className="text-sm text-[#525252]">
              View team members and assignments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
