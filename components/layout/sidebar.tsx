"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UsersRound,
  Calendar,
  Settings,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-client";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: UsersRound,
  },
  {
    name: "Meetings",
    href: "/dashboard/meetings",
    icon: Calendar,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get user initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-60 flex-col bg-[#FAFAFA] border-r border-[#E5E5E5]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-[#E5E5E5]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#18181B]">
            <span className="text-sm font-semibold text-white">AI</span>
          </div>
          <span className="text-base font-semibold text-[#171717]">
            Agency PM
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors",
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-[#525252] hover:bg-[#F4F4F5] hover:text-[#171717]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <Separator className="my-4" />

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors",
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-[#525252] hover:bg-[#F4F4F5] hover:text-[#171717]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu at Bottom */}
      <div className="border-t border-[#E5E5E5] p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E5]">
            <span className="text-sm font-medium text-[#525252]">
              {getInitials(user?.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#171717] truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-[#A3A3A3] truncate">
              {user?.role || "Member"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
