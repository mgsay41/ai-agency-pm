"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "./global-search";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E5E5] bg-white px-6" role="banner">
      {/* Page Title */}
      {title && (
        <h1 className="text-2xl font-semibold text-[#171717]">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search */}
      <div className="hidden md:block">
        <GlobalSearch />
      </div>

      {/* Notifications (placeholder for future) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-[#525252] hover:bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User Menu */}
      <UserMenu />
    </header>
  );
}
