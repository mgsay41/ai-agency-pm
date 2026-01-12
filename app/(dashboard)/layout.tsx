import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - AI Agency PM",
  description: "AI Agency Project Management System Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
