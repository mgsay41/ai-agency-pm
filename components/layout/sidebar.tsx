"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UsersRound,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-client";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Team",
    href: "/team",
    icon: UsersRound,
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: Calendar,
  },
];

const secondaryNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className={cn(
      "flex h-screen flex-col bg-[#FAFAFA] border-r border-[#E5E5E5] transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-[#E5E5E5]",
        isCollapsed ? "justify-center px-2" : "px-6"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#18181B] shrink-0">
            <span className="text-sm font-semibold text-white">AI</span>
          </div>
          {!isCollapsed && (
            <span className="text-base font-semibold text-[#171717] whitespace-nowrap">
              Agency PM
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2",
                isCollapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-[#525252] hover:bg-[#F4F4F5] hover:text-[#171717]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <Separator className="my-4" role="separator" />

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2",
                isCollapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-[#525252] hover:bg-[#F4F4F5] hover:text-[#171717]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu at Bottom */}
      <div className="border-t border-[#E5E5E5] p-4">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed ? "justify-center px-0" : "px-3 py-2"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E5] shrink-0">
            <span className="text-sm font-medium text-[#525252]">
              {getInitials(user?.name)}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#171717] truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-[#A3A3A3] truncate">
                {user?.role || "Member"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 h-6 w-6 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-[#FAFAFA] transition-colors shadow-sm",
          "z-10 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[#525252]" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-[#525252]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
