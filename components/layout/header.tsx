"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E5E5] bg-white px-6">
      {/* Page Title */}
      {title && (
        <h1 className="text-2xl font-semibold text-[#171717]">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications (placeholder for future) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-[#525252] hover:bg-[#FAFAFA]"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User Menu */}
      <UserMenu />
    </header>
  );
}
